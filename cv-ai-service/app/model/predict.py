import logging
import re
from typing import Dict, List, Tuple

import numpy as np

from .train import CVJobMatcher

logger = logging.getLogger(__name__)


class CVJobPredictor:
    """Predict CV-Job matching with an explainable scoring layer."""

    def __init__(self, model_path: str = "app/model/saved_model"):
        self.model_path = model_path
        self.matcher = CVJobMatcher(model_path)

        try:
            self.matcher.load_model()
            logger.info("Model loaded successfully")
        except Exception as e:
            logger.warning(f"Could not load model: {str(e)}")
            logger.info("Using explainable heuristic scoring")

    def predict_matches(
        self,
        cv_data: Dict,
        job_data: List[Dict],
        top_k: int = 10
    ) -> List[Dict]:
        """Return top job recommendations with stable, explainable scores."""
        try:
            recommendations = []
            for i, job in enumerate(job_data):
                score, details = self._calculate_heuristic_score(cv_data, job)
                reasons = self._generate_match_reasons(cv_data, job, score, details)

                recommendations.append({
                    'job_id': job.get('id', str(i)),
                    'title': job.get('title', ''),
                    'company': job.get('company', ''),
                    'location': job.get('location', ''),
                    'match_score': score,
                    'match_reasons': reasons
                })

            recommendations.sort(key=lambda x: x['match_score'], reverse=True)
            return recommendations[:top_k]

        except Exception as e:
            logger.error(f"Error predicting matches: {str(e)}")
            return []

    def predict_single_match(self, cv_data: Dict, job_data: Dict) -> Dict:
        """Predict match score for a single CV-Job pair."""
        try:
            score, details = self._calculate_heuristic_score(cv_data, job_data)
            reasons = self._generate_match_reasons(cv_data, job_data, score, details)

            return {
                'match_score': score,
                'match_reasons': reasons
            }

        except Exception as e:
            logger.error(f"Error predicting single match: {str(e)}")
            return {'match_score': 0.0, 'match_reasons': []}

    def _normalize_text(self, value) -> str:
        text = str(value or '').lower()
        text = re.sub(r'[^a-z0-9+#.]+', ' ', text)
        return re.sub(r'\s+', ' ', text).strip()

    def _normalize_skill(self, value) -> str:
        skill = self._normalize_text(value)
        aliases = {
            'ai': 'artificial intelligence',
            'golang': 'go',
            'js': 'javascript',
            'ml': 'machine learning',
            'node': 'node.js',
            'nodejs': 'node.js',
            'reactjs': 'react',
            'tf': 'tensorflow'
        }
        return aliases.get(skill, skill)

    def _skills_match(self, cv_skill: str, job_skill: str) -> bool:
        if cv_skill == job_skill:
            return True

        short_tokens = {'c', 'c++', 'c#', 'go', 'r'}
        if cv_skill in short_tokens or job_skill in short_tokens:
            return False

        if len(cv_skill) < 4 or len(job_skill) < 4:
            return False

        return job_skill in cv_skill or cv_skill in job_skill

    def _skill_overlap(self, cv_skills: List, job_skills: List) -> Tuple[float, List[str]]:
        cv_normalized = {
            self._normalize_skill(skill)
            for skill in cv_skills
            if self._normalize_skill(skill)
        }
        job_normalized = {
            self._normalize_skill(skill)
            for skill in job_skills
            if self._normalize_skill(skill)
        }

        if not job_normalized:
            return 0.0, []

        matches = []
        weighted_total = 0.0
        weighted_match = 0.0
        ordered_job_skills = [
            self._normalize_skill(skill)
            for skill in job_skills
            if self._normalize_skill(skill)
        ]

        for index, job_skill in enumerate(ordered_job_skills):
            weight = max(0.65, 1.25 - index * 0.12)
            weighted_total += weight
            for cv_skill in cv_normalized:
                if self._skills_match(cv_skill, job_skill):
                    matches.append(job_skill)
                    weighted_match += weight
                    break

        unique_matches = sorted(set(matches))
        return weighted_match / weighted_total if weighted_total else 0.0, unique_matches

    def _calculate_heuristic_score(self, cv_data: Dict, job_data: Dict) -> Tuple[float, Dict]:
        """Calculate an explainable score from actual profile-job overlap."""
        cv_skills = cv_data.get('skills', []) or []
        job_skills = job_data.get('skills', []) or []
        skill_ratio, matched_skills = self._skill_overlap(cv_skills, job_skills)

        cv_location = self._normalize_text(cv_data.get('location'))
        job_location = self._normalize_text(job_data.get('location'))
        location_match = bool(
            cv_location and job_location and
            (cv_location in job_location or job_location in cv_location)
        )

        cv_experience = cv_data.get('experience', []) or []
        experience_score = min(1.0, len(cv_experience) / 5.0)
        education_score = 1.0 if cv_data.get('education') else 0.0

        searchable_job_text = self._normalize_text(
            f"{job_data.get('title', '')} "
            f"{job_data.get('description', '')} "
            f"{job_data.get('requirements', '')}"
        )
        normalized_cv_skills = {
            self._normalize_skill(skill)
            for skill in cv_skills
            if self._normalize_skill(skill)
        }
        title_hits = sum(1 for skill in normalized_cv_skills if skill in searchable_job_text)
        title_score = min(1.0, title_hits / max(1, len(job_skills) or 3))

        cv_context_text = self._normalize_text(
            f"{cv_data.get('name', '')} "
            f"{cv_data.get('summary', '')} "
            f"{cv_data.get('location', '')} "
            f"{' '.join(str(exp.get('title', '')) + ' ' + str(exp.get('description', '')) for exp in cv_experience if isinstance(exp, dict))} "
            f"{' '.join(str(edu.get('degree', '')) + ' ' + str(edu.get('field', '')) for edu in (cv_data.get('education', []) or []) if isinstance(edu, dict))}"
        )
        job_focus_text = self._normalize_text(
            f"{job_data.get('title', '')} {' '.join(job_skills)}"
        )
        focus_terms = [
            term for term in re.split(r'\s+', job_focus_text)
            if len(term) >= 4 and term not in {'engineer', 'developer', 'specialist'}
        ]
        focus_score = min(
            1.0,
            sum(1 for term in set(focus_terms) if term in cv_context_text) / max(1, min(5, len(set(focus_terms))))
        )

        score = (
            0.12 +
            skill_ratio * 0.55 +
            title_score * 0.10 +
            focus_score * 0.08 +
            (0.08 if location_match else 0.0) +
            experience_score * 0.06 +
            education_score * 0.04
        )

        if skill_ratio == 0:
            score = min(score, 0.38)
        elif skill_ratio < 0.25:
            score = min(score, 0.52)

        details = {
            'skill_ratio': skill_ratio,
            'matched_skills': matched_skills,
            'job_skills_count': len({
                self._normalize_skill(skill)
                for skill in job_skills
                if self._normalize_skill(skill)
            }),
            'location_match': location_match,
            'experience_score': experience_score,
            'education_score': education_score,
            'title_score': title_score,
            'focus_score': focus_score
        }
        return float(np.nan_to_num(max(0.05, min(0.98, score)))), details

    def _generate_match_reasons(
        self,
        cv_data: Dict,
        job_data: Dict,
        score: float,
        details: Dict = None
    ) -> List[str]:
        """Generate reasons for the match score."""
        reasons = []

        try:
            details = details or self._calculate_heuristic_score(cv_data, job_data)[1]
            matched_skills = details.get('matched_skills', [])
            job_skills_count = details.get('job_skills_count', 0)
            skill_ratio = details.get('skill_ratio', 0.0)

            if job_skills_count:
                skill_text = ', '.join(matched_skills[:4])
                if skill_ratio >= 0.7:
                    reasons.append(
                        f"Strong skill match ({len(matched_skills)} out of {job_skills_count}: {skill_text})"
                    )
                elif skill_ratio >= 0.4:
                    reasons.append(
                        f"Good skill match ({len(matched_skills)} out of {job_skills_count}: {skill_text})"
                    )
                elif skill_ratio > 0:
                    reasons.append(
                        f"Some skill overlap ({len(matched_skills)} matching skills: {skill_text})"
                    )
                else:
                    reasons.append("Low skill overlap")

            cv_experience = cv_data.get('experience', []) or []
            if cv_experience:
                exp_years = len(cv_experience)
                if exp_years >= 5:
                    reasons.append("Extensive experience")
                elif exp_years >= 2:
                    reasons.append("Relevant experience")

            if details.get('location_match'):
                reasons.append("Location match")

            if cv_data.get('education'):
                reasons.append("Relevant education")

            job_salary_min = job_data.get('salary_min')
            job_salary_max = job_data.get('salary_max')
            if job_salary_min and job_salary_max:
                reasons.append(f"Salary range: ${job_salary_min}-${job_salary_max}")

            if score >= 0.8:
                reasons.append("Excellent overall match")
            elif score >= 0.6:
                reasons.append("Good match potential")
            elif score >= 0.4:
                reasons.append("Potential match")

            return reasons[:5]

        except Exception as e:
            logger.error(f"Error generating match reasons: {str(e)}")
            return []

    def _train_sample_model(self):
        """Train model with sample data. Kept for compatibility with older code paths."""
        try:
            logger.info("Training model with sample data...")
            cv_data, job_data, labels = self.matcher.create_sample_data(num_samples=500)
            self.matcher.train(cv_data, job_data, labels, epochs=50, validation_split=0.2)
            logger.info("Sample model training completed")

        except Exception as e:
            logger.error(f"Error training sample model: {str(e)}")
            raise

    def get_feature_importance(self, cv_data: Dict, job_data: Dict) -> Dict:
        """Get feature importance for a specific CV-Job pair."""
        try:
            _, details = self._calculate_heuristic_score(cv_data, job_data)

            return {
                'skill_overlap': details.get('skill_ratio', 0.0),
                'location_match': 1.0 if details.get('location_match') else 0.0,
                'experience_score': details.get('experience_score', 0.0),
                'cv_skills_count': len(cv_data.get('skills', []) or []),
                'job_skills_count': details.get('job_skills_count', 0),
                'matching_skills': details.get('matched_skills', [])
            }

        except Exception as e:
            logger.error(f"Error getting feature importance: {str(e)}")
            return {}

    def batch_predict(self, cv_job_pairs: List[Tuple[Dict, Dict]]) -> List[Dict]:
        """Predict matches for multiple CV-Job pairs."""
        try:
            return [
                self.predict_single_match(cv_data, job_data)
                for cv_data, job_data in cv_job_pairs
            ]

        except Exception as e:
            logger.error(f"Error in batch prediction: {str(e)}")
            return []
