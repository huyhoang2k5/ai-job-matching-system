from fastapi import APIRouter, HTTPException
import logging
from typing import List

from ..models import RecommendRequest, RecommendResponse, JobRecommendation
from ..model.predict import CVJobPredictor

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize predictor
predictor = CVJobPredictor()

@router.post("/recommend", response_model=RecommendResponse)
async def recommend_jobs(request: RecommendRequest):
    """
    Get job recommendations based on CV data
    
    Args:
        request: Request containing CV data and job listings
        
    Returns:
        List of job recommendations with match scores
    """
    try:
        # Validate input
        if not request.cv_data:
            raise HTTPException(
                status_code=400,
                detail="CV data is required"
            )
        
        if not request.jobs:
            raise HTTPException(
                status_code=400,
                detail="Job listings are required"
            )
        
        # Get recommendations
        recommendations = predictor.predict_matches(
            cv_data=request.cv_data.dict(),
            job_data=[job.dict() for job in request.jobs],
            top_k=request.top_k
        )
        
        # Convert to JobRecommendation models
        job_recommendations = []
        for rec in recommendations:
            job_recommendations.append(JobRecommendation(**rec))
        
        return RecommendResponse(
            success=True,
            recommendations=job_recommendations
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        return RecommendResponse(
            success=False,
            error=f"Failed to generate recommendations: {str(e)}"
        )

@router.post("/recommend/single")
async def recommend_single_job(
    cv_data: dict,
    job_data: dict
):
    """
    Get match score for single CV-Job pair
    
    Args:
        cv_data: CV dictionary
        job_data: Job dictionary
        
    Returns:
        Match score and reasons
    """
    try:
        if not cv_data:
            raise HTTPException(
                status_code=400,
                detail="CV data is required"
            )
        
        if not job_data:
            raise HTTPException(
                status_code=400,
                detail="Job data is required"
            )
        
        # Get prediction
        prediction = predictor.predict_single_match(cv_data, job_data)
        
        return {
            "success": True,
            "prediction": prediction
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error predicting single match: {str(e)}")
        return {
            "success": False,
            "error": f"Failed to predict match: {str(e)}"
        }

@router.post("/recommend/batch")
async def recommend_batch(
    cv_job_pairs: List[dict]
):
    """
    Get match scores for multiple CV-Job pairs
    
    Args:
        cv_job_pairs: List of dictionaries with 'cv_data' and 'job_data'
        
    Returns:
        List of match predictions
    """
    try:
        if not cv_job_pairs:
            raise HTTPException(
                status_code=400,
                detail="CV-Job pairs are required"
            )
        
        # Prepare pairs
        pairs = []
        for pair in cv_job_pairs:
            cv_data = pair.get('cv_data')
            job_data = pair.get('job_data')
            
            if not cv_data or not job_data:
                raise HTTPException(
                    status_code=400,
                    detail="Each pair must contain both cv_data and job_data"
                )
            
            pairs.append((cv_data, job_data))
        
        # Get predictions
        predictions = predictor.batch_predict(pairs)
        
        return {
            "success": True,
            "predictions": predictions,
            "total_pairs": len(predictions)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in batch recommendation: {str(e)}")
        return {
            "success": False,
            "error": f"Failed to process batch recommendations: {str(e)}"
        }

@router.post("/recommend/features")
async def get_feature_importance(
    cv_data: dict,
    job_data: dict
):
    """
    Get feature importance for CV-Job matching
    
    Args:
        cv_data: CV dictionary
        job_data: Job dictionary
        
    Returns:
        Feature importance analysis
    """
    try:
        if not cv_data:
            raise HTTPException(
                status_code=400,
                detail="CV data is required"
            )
        
        if not job_data:
            raise HTTPException(
                status_code=400,
                detail="Job data is required"
            )
        
        # Get feature importance
        importance = predictor.get_feature_importance(cv_data, job_data)
        
        return {
            "success": True,
            "feature_importance": importance
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting feature importance: {str(e)}")
        return {
            "success": False,
            "error": f"Failed to get feature importance: {str(e)}"
        }

@router.get("/recommend/stats")
async def get_recommendation_stats():
    """
    Get recommendation system statistics
    
    Returns:
        System status and statistics
    """
    try:
        # Check if model is loaded
        model_loaded = predictor.matcher.model is not None
        
        return {
            "success": True,
            "model_loaded": model_loaded,
            "model_path": predictor.model_path,
            "supported_features": [
                "skill_matching",
                "experience_matching",
                "location_matching",
                "education_matching",
                "salary_analysis"
            ]
        }
        
    except Exception as e:
        logger.error(f"Error getting recommendation stats: {str(e)}")
        return {
            "success": False,
            "error": f"Failed to get stats: {str(e)}"
        }
