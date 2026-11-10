import re
import spacy
from typing import Dict, List, Optional, Tuple
from underthesea import pos_tag, ner
import logging

from .cleaner import TextCleaner

logger = logging.getLogger(__name__)

class CVParser:
    """Parse CV text to extract structured information"""
    
    def __init__(self):
        self.cleaner = TextCleaner()
        
        # Try to load spaCy models
        try:
            self.nlp_en = spacy.load("en_core_web_sm")
        except OSError:
            logger.warning("English spaCy model not found. Some features may be limited.")
            self.nlp_en = None
            
        try:
            self.nlp_vi = spacy.load("vi_core_news_lg")
        except OSError:
            # vi_core_news_lg is not published for current spaCy releases; Vietnamese parsing uses underthesea below.
            logger.info("Vietnamese spaCy model unavailable; using underthesea for Vietnamese NLP.")
            self.nlp_vi = None
        
        # Patterns for information extraction
        self.email_pattern = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
        self.phone_pattern = re.compile(
            r'(?<!\d)(?:\+?84|0)?(?:[\s.\-()]*)[3-9](?:[\s.\-()]*\d){8}(?!\d)'
        )
        self.phone_fallback_pattern = re.compile(
            r'(?<!\d)(?:\+?\d{1,3}[\s.\-()]*)?(?:\(?\d{2,4}\)?[\s.\-()]*)?\d{3,4}[\s.\-()]*\d{3,4}(?!\d)'
        )
        
        # Vietnamese and English skill keywords
        self.skill_keywords = {
            'programming': [
                'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'php', 'ruby', 'go',
                'react', 'vue', 'angular', 'nodejs', 'express', 'django', 'flask', 'spring',
                'html', 'css', 'sql', 'nosql', 'mongodb', 'mysql', 'postgresql', 'redis'
            ],
            'tools': [
                'git', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'ci/cd',
                'jira', 'confluence', 'slack', 'figma', 'sketch', 'photoshop', 'illustrator'
            ],
            'languages': [
                'tiếng việt', 'vietnamese', 'tiếng anh', 'english', 'tiếng pháp', 'french',
                'tiếng đức', 'german', 'tiếng nhật', 'japanese', 'tiếng trung', 'chinese'
            ],
            'soft_skills': [
                'leadership', 'teamwork', 'communication', 'problem solving', 'analytical',
                'creative', 'detail-oriented', 'time management', 'project management',
                'lãnh đạo', 'làm việc nhóm', 'giao tiếp', 'giải quyết vấn đề', 'phân tích'
            ]
        }
        
        # Education keywords
        self.education_keywords = [
            'university', 'college', 'đại học', 'cao đẳng', 'bachelor', 'master', 'phd',
            'cử nhân', 'thạc sĩ', 'tiến sĩ', 'engineering', 'science', 'arts', 'business'
        ]
        
        # Experience indicators
        self.experience_indicators = [
            'experience', 'worked', 'internship', 'project', 'developed', 'implemented',
            'kinh nghiệm', 'đã làm việc', 'thực tập', 'dự án', 'phát triển', 'triển khai'
        ]
    
    def parse_cv(self, text: str) -> Dict:
        """
        Parse CV text and extract structured information
        
        Args:
            text: Raw text from CV
            
        Returns:
            Dictionary containing parsed CV information
        """
        try:
            # Clean text
            cleaned_text = self.cleaner.clean_text(text)
            
            # Extract information
            result = {
                'name': self.extract_name(text),
                'email': self.extract_email(text),
                'phone': self.extract_phone(text),
                'skills': self.extract_skills(cleaned_text),
                'experience': self.extract_experience(cleaned_text),
                'education': self.extract_education(cleaned_text),
                'location': self.extract_location(cleaned_text),
                'summary': self.extract_summary(cleaned_text)
            }
            
            # Clean and normalize extracted data
            result['skills'] = self.cleaner.normalize_skills(result['skills'])
            
            logger.info("CV parsing completed successfully")
            return result
            
        except Exception as e:
            logger.error(f"Error parsing CV: {str(e)}")
            return {}
    
    def extract_name(self, text: str) -> Optional[str]:
        """Extract person's name from CV"""
        try:
            lines = [line.strip() for line in text.split('\n') if line.strip()]
            label_patterns = [
                r'(?:họ\s*(?:và)?\s*tên|ho\s*(?:va)?\s*ten|full\s*name|name)\s*[:\-]\s*(.+)',
                r'(?:tên|ten)\s*[:\-]\s*(.+)'
            ]
            blocked_words = {
                'curriculum', 'resume', 'cv', 'email', 'phone', 'tel', 'mobile',
                'github', 'linkedin', 'portfolio', 'address', 'contact',
                'objective', 'summary', 'education', 'experience', 'skills',
                'số điện thoại', 'dien thoai', 'liên hệ', 'lien he'
            }
            
            for line in lines[:15]:
                for pattern in label_patterns:
                    match = re.search(pattern, line, re.IGNORECASE)
                    if match:
                        candidate = self._clean_name_candidate(match.group(1))
                        if self._looks_like_name(candidate):
                            return candidate
            
            # Name is usually in the first few lines
            for line in lines[:12]:
                if not line or len(line) < 3:
                    continue
                
                # Skip lines that are clearly emails, phones, or headers
                if (self.email_pattern.search(line) or 
                    self.phone_pattern.search(line) or
                    any(word in line.lower() for word in blocked_words)):
                    continue
                
                candidate = self._clean_name_candidate(line)
                if self._looks_like_name(candidate):
                    return candidate
            
            return None
            
        except Exception as e:
            logger.error(f"Error extracting name: {str(e)}")
            return None
    
    def extract_email(self, text: str) -> Optional[str]:
        """Extract email address"""
        try:
            emails = self.email_pattern.findall(text)
            return emails[0] if emails else None
        except Exception as e:
            logger.error(f"Error extracting email: {str(e)}")
            return None
    
    def extract_phone(self, text: str) -> Optional[str]:
        """Extract phone number"""
        try:
            lines = [line.strip() for line in text.split('\n') if line.strip()]
            phone_labels = ['phone', 'mobile', 'tel', 'điện thoại', 'dien thoai', 'sdt', 'contact']
            
            for i, line in enumerate(lines):
                search_lines = [line]
                if any(label in line.lower() for label in phone_labels) and i + 1 < len(lines):
                    search_lines.append(lines[i + 1])
                
                for candidate_line in search_lines:
                    phone = self._extract_phone_from_text(candidate_line)
                    if phone:
                        return phone
            
            return self._extract_phone_from_text(text)
        except Exception as e:
            logger.error(f"Error extracting phone: {str(e)}")
            return None

    def _extract_phone_from_text(self, value: str) -> Optional[str]:
        for pattern in [self.phone_pattern, self.phone_fallback_pattern]:
            match = pattern.search(value)
            if not match:
                continue
            phone = re.sub(r'[^\d+]', '', match.group(0))
            digits = re.sub(r'\D', '', phone)
            if len(digits) < 9 or len(digits) > 13:
                continue
            if phone.startswith('+84'):
                return '0' + phone[3:]
            if phone.startswith('84') and len(digits) == 11:
                return '0' + phone[2:]
            return phone
        return None

    def _clean_name_candidate(self, value: str) -> str:
        value = re.sub(self.email_pattern, '', value)
        value = re.sub(self.phone_pattern, '', value)
        value = re.sub(r'[\|•·,;]+', ' ', value)
        value = re.sub(r'\s+', ' ', value).strip(' :-')
        return value

    def _looks_like_name(self, value: str) -> bool:
        if not value or len(value) > 60:
            return False
        if any(char.isdigit() for char in value):
            return False
        words = [word.strip(".-'") for word in value.split() if word.strip(".-'")]
        if not 2 <= len(words) <= 5:
            return False
        lowered = value.lower()
        blocked_fragments = [
            'developer', 'engineer', 'student', 'intern', 'manager', 'analyst',
            'email', 'phone', 'address', 'github', 'linkedin', 'portfolio',
            'lập trình', 'sinh viên', 'thực tập', 'kỹ sư', 'chuyên viên'
        ]
        if any(fragment in lowered for fragment in blocked_fragments):
            return False
        letter_words = [word for word in words if re.search(r'[A-Za-zÀ-ỹ]', word)]
        if len(letter_words) != len(words):
            return False
        capitalized_words = sum(1 for word in words if word[:1].isupper())
        uppercase_name = value.isupper() and len(words) >= 2
        return uppercase_name or capitalized_words >= max(1, len(words) - 1)
    
    def extract_skills(self, text: str) -> List[str]:
        """Extract skills from text"""
        try:
            skills = set()
            text_lower = text.lower()
            
            # Extract based on keyword lists
            for category, keywords in self.skill_keywords.items():
                for keyword in keywords:
                    if keyword in text_lower:
                        skills.add(keyword)
            
            # Use NER for additional skill extraction
            try:
                # Try Vietnamese NER first
                tagged_words = pos_tag(text)
                for word, pos in tagged_words:
                    if pos in ['N', 'Np', 'V'] and len(word) > 2:
                        # Check if word looks like a skill
                        if any(keyword in word.lower() for keyword in 
                               ['python', 'java', 'sql', 'web', 'mobile', 'data']):
                            skills.add(word.lower())
            except Exception as e:
                logger.warning(f"Vietnamese NER failed: {str(e)}")
            
            # Try English spaCy if available
            if self.nlp_en:
                try:
                    doc = self.nlp_en(text)
                    for ent in doc.ents:
                        if ent.label_ in ['PRODUCT', 'ORG', 'WORK_OF_ART']:
                            skills.add(ent.text.lower())
                except Exception as e:
                    logger.warning(f"English spaCy NER failed: {str(e)}")
            
            return list(skills)
            
        except Exception as e:
            logger.error(f"Error extracting skills: {str(e)}")
            return []
    
    def extract_experience(self, text: str) -> List[Dict]:
        """Extract work experience with section-based parsing and contact skipping"""
        try:
            experiences = []
            lines = text.split('\n')
            
            current_exp = None
            in_experience_section = False
            
            # Section headers that mark the end of experience section
            other_section_headers = [
                'học vấn', 'kỹ năng', 'thông tin cá nhân', 'mục tiêu', 'education', 'skills', 'contact',
                'gpa', 'subjects', 'môn học', 'chứng chỉ', 'certificates', 'liên hệ', 'giới thiệu'
            ]
            
            # Section headers that mark the start of experience section
            experience_section_headers = [
                'experience', 'work history', 'professional journey', 'employment history',
                'kinh nghiệm', 'quá trình làm việc', 'lịch sử làm việc', 'dự án', 'projects'
            ]
            
            experience_markers = [
                'developer', 'engineer', 'manager', 'analyst', 'designer', 'consultant',
                'intern', 'thực tập', 'lập trình viên', 'kỹ sư', 'chuyên viên', 'dự án', 'project'
            ]
            
            for i, line in enumerate(lines):
                line = line.strip()
                if not line or len(line) < 3:
                    continue
                
                line_lower = line.lower()
                
                # Check section transition
                if any(header in line_lower for header in other_section_headers) and len(line) < 50:
                    in_experience_section = False
                    if current_exp:
                        experiences.append(current_exp)
                        current_exp = None
                    continue
                
                if any(header in line_lower for header in experience_section_headers) and len(line) < 50:
                    in_experience_section = True
                    continue
                
                # If we're not in the experience section yet, we can skip or look for triggers
                if not in_experience_section:
                    # Check if line contains a job marker AND a date, then we can assume we found an experience block
                    has_marker = any(marker in line_lower for marker in experience_markers)
                    has_date = re.search(r'\b(19|20)\d{2}\b|\b\d{1,2}/\d{4}\b', line)
                    if has_marker and has_date:
                        in_experience_section = True
                    else:
                        continue
                
                # Skip contact info lines
                if (self.email_pattern.search(line) or 
                    self.phone_pattern.search(line) or 
                    'github.com' in line_lower or 
                    'linkedin.com' in line_lower or
                    'facebook.com' in line_lower):
                    continue
                
                # Detect if line looks like a new entry (Job Title or Company or Project Name)
                has_date = re.search(r'\b(19|20)\d{2}\b|\b\d{1,2}/\d{4}\b', line)
                is_job_title = any(marker in line_lower for marker in experience_markers)
                is_title_case = line[0].isupper() and len(line.split()) < 8
                
                if (is_job_title and (has_date or len(line) < 100)) or (has_date and is_title_case):
                    if current_exp:
                        experiences.append(current_exp)
                    
                    title = self.extract_job_title(line) or line[:60]
                    current_exp = {
                        'title': title,
                        'company': self.extract_company(line) or "Kinh nghiệm làm việc",
                        'duration': self.extract_duration(line) or "N/A",
                        'description': line
                    }
                elif current_exp:
                    # Append description
                    if line.isupper() and len(line) < 40:
                        experiences.append(current_exp)
                        current_exp = {
                            'title': line,
                            'company': "Chi tiết dự án / Công việc",
                            'duration': "N/A",
                            'description': line
                        }
                    else:
                        current_exp['description'] += '\n' + line
            
            if current_exp:
                experiences.append(current_exp)
            
            return experiences
            
        except Exception as e:
            logger.error(f"Error extracting experience: {str(e)}")
            return []
    
    def extract_education(self, text: str) -> List[Dict]:
        """Extract education information"""
        try:
            education = []
            lines = text.split('\n')
            
            for i, line in enumerate(lines):
                line = line.strip()
                if not line:
                    continue
                
                # Check if line contains education keywords
                if any(keyword in line.lower() for keyword in self.education_keywords):
                    edu_entry = {
                        'degree': self.extract_degree(line),
                        'school': self.extract_school(line),
                        'year': self.extract_year(line),
                        'description': line
                    }
                    
                    if edu_entry['degree'] or edu_entry['school']:
                        education.append(edu_entry)
            
            return education
            
        except Exception as e:
            logger.error(f"Error extracting education: {str(e)}")
            return []
    
    def extract_location(self, text: str) -> Optional[str]:
        """Extract location/address"""
        try:
            # Common Vietnamese cities and provinces
            locations = [
                'hà nội', 'hanoi', 'hồ chí minh', 'ho chi minh', 'saigon',
                'đà nẵng', 'danang', 'hai phong', 'haiphong', 'cần thơ',
                'vietnam', 'việt nam'
            ]
            
            text_lower = text.lower()
            for location in locations:
                if location in text_lower:
                    return location.title()
            
            # Try spaCy location extraction
            if self.nlp_en:
                doc = self.nlp_en(text)
                for ent in doc.ents:
                    if ent.label_ == 'GPE':
                        return ent.text
            
            return None
            
        except Exception as e:
            logger.error(f"Error extracting location: {str(e)}")
            return None
    
    def extract_summary(self, text: str) -> Optional[str]:
        """Extract professional summary/objective"""
        try:
            lines = text.split('\n')
            
            # Look for summary sections
            summary_indicators = [
                'summary', 'objective', 'profile', 'about me',
                'tóm tắt', 'mục tiêu', 'giới thiệu'
            ]
            
            summary_lines = []
            in_summary = False
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                line_lower = line.lower()
                
                # Check if we're entering a summary section
                if any(indicator in line_lower for indicator in summary_indicators):
                    in_summary = True
                    continue
                
                # Check if we're leaving the summary section
                if (in_summary and 
                    any(indicator in line_lower for indicator in 
                        ['experience', 'education', 'skills', 'kinh nghiệm', 'học vấn'])):
                    break
                
                if in_summary and len(line) > 10:
                    summary_lines.append(line)
            
            if summary_lines:
                return ' '.join(summary_lines[:3])  # First 3 lines of summary
            
            return None
            
        except Exception as e:
            logger.error(f"Error extracting summary: {str(e)}")
            return None
    
    def extract_job_title(self, text: str) -> Optional[str]:
        """Extract job title from text and clean it"""
        job_titles = [
            'developer', 'engineer', 'manager', 'analyst', 'designer', 'consultant',
            'director', 'specialist', 'coordinator', 'administrator', 'assistant',
            'lập trình viên', 'kỹ sư', 'quản lý', 'phân tích', 'thiết kế', 'chuyên viên'
        ]
        
        # Clean contact info first
        clean_text = re.sub(self.email_pattern, '', text)
        clean_text = re.sub(self.phone_pattern, '', clean_text)
        
        text_lower = clean_text.lower()
        for title in job_titles:
            if title in text_lower:
                words = clean_text.split()
                for i, word in enumerate(words):
                    if title in word.lower():
                        start = max(0, i-2)
                        end = min(len(words), i+3)
                        extracted = ' '.join(words[start:end]).strip()
                        # Final cleanup for punctuation
                        return re.sub(r'[,|:-]+$', '', extracted).strip()
        
        return None
    
    def extract_company(self, text: str) -> Optional[str]:
        """Extract company name from text"""
        # This is a simplified version - in practice, you'd use more sophisticated NER
        text_lower = text.lower()
        
        # Look for company indicators
        company_indicators = ['at', 'in', 'for', 'tại', 'công ty']
        
        for indicator in company_indicators:
            if indicator in text_lower:
                # Extract text after the indicator
                parts = text.split(indicator)
                if len(parts) > 1:
                    company_part = parts[1].strip()
                    # Get first 2-3 words as company name
                    words = company_part.split()
                    if words:
                        return ' '.join(words[:3])
        
        return None
    
    def extract_duration(self, text: str) -> Optional[str]:
        """Extract employment duration from text"""
        # Look for date patterns
        date_patterns = [
            r'\b\d{4}\b',  # Years
            r'\b\d{1,2}/\d{4}\b',  # MM/YYYY
            r'\b\d{1,2}-\d{4}\b',  # MM-YYYY
            r'\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{4}\b'  # Month YYYY
        ]
        
        dates = []
        for pattern in date_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            dates.extend(matches)
        
        if dates:
            return ', '.join(dates[:2])  # Return first 2 dates (start and end)
        
        return None
    
    def extract_degree(self, text: str) -> Optional[str]:
        """Extract degree from education text"""
        degrees = [
            'bachelor', 'master', 'phd', 'doctorate', 'associate',
            'cử nhân', 'thạc sĩ', 'tiến sĩ', 'cao đẳng'
        ]
        
        text_lower = text.lower()
        for degree in degrees:
            if degree in text_lower:
                return degree
        
        return None
    
    def extract_school(self, text: str) -> Optional[str]:
        """Extract school/university name"""
        school_indicators = [
            'university', 'college', 'institute', 'school',
            'đại học', 'cao đẳng', 'học viện', 'trường'
        ]
        
        text_lower = text.lower()
        for indicator in school_indicators:
            if indicator in text_lower:
                # Extract the phrase containing the school name
                words = text.split()
                for i, word in enumerate(words):
                    if indicator in word.lower():
                        # Get surrounding words for context
                        start = max(0, i-1)
                        end = min(len(words), i+4)
                        return ' '.join(words[start:end])
        
        return None
    
    def extract_year(self, text: str) -> Optional[str]:
        """Extract graduation year"""
        years = re.findall(r'\b(19|20)\d{2}\b', text)
        if years:
            # Return the most recent year
            return max(years)
        return None
