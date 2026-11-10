from fastapi import APIRouter, HTTPException, BackgroundTasks
import logging
from typing import Optional, Dict, Any
import asyncio

from ..model.train import CVJobMatcher

logger = logging.getLogger(__name__)
router = APIRouter()

# Global variable to track training status
training_status = {
    "is_training": False,
    "progress": 0,
    "message": "",
    "error": None
}

@router.post("/train")
async def train_model(
    background_tasks: BackgroundTasks,
    num_samples: int = 1000,
    epochs: int = 100,
    validation_split: float = 0.2
):
    """
    Train the CV-Job matching model
    
    Args:
        background_tasks: FastAPI background tasks
        num_samples: Number of sample training examples to generate
        epochs: Number of training epochs
        validation_split: Fraction of data for validation
        
    Returns:
        Training job information
    """
    try:
        if training_status["is_training"]:
            raise HTTPException(
                status_code=409,
                detail="Model training is already in progress"
            )
        
        # Start training in background
        background_tasks.add_task(
            _train_model_background,
            num_samples,
            epochs,
            validation_split
        )
        
        return {
            "success": True,
            "message": "Model training started",
            "job_id": "training_job_001",
            "estimated_time_minutes": epochs * 0.5  # Rough estimate
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting model training: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start training: {str(e)}"
        )

@router.get("/train/status")
async def get_training_status():
    """
    Get current training status
    
    Returns:
        Current training status and progress
    """
    try:
        return {
            "success": True,
            "status": training_status
        }
        
    except Exception as e:
        logger.error(f"Error getting training status: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get training status: {str(e)}"
        )

@router.post("/train/stop")
async def stop_training():
    """
    Stop ongoing model training
    
    Returns:
        Stop confirmation
    """
    try:
        if not training_status["is_training"]:
            raise HTTPException(
                status_code=404,
                detail="No training in progress"
            )
        
        # Note: In a real implementation, you'd need proper thread cancellation
        training_status["is_training"] = False
        training_status["message"] = "Training stopped by user"
        
        return {
            "success": True,
            "message": "Training stopped successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error stopping training: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to stop training: {str(e)}"
        )

@router.get("/train/model-info")
async def get_model_info():
    """
    Get information about the trained model
    
    Returns:
        Model metadata and performance metrics
    """
    try:
        matcher = CVJobMatcher()
        
        # Try to load existing model
        try:
            matcher.load_model()
            model_loaded = True
            
            # Get model summary
            if matcher.model:
                model_summary = {
                    "input_shape": matcher.model.input_shape,
                    "output_shape": matcher.model.output_shape,
                    "num_parameters": matcher.model.count_params(),
                    "layers": len(matcher.model.layers)
                }
            else:
                model_summary = {}
                
        except Exception:
            model_loaded = False
            model_summary = {}
        
        return {
            "success": True,
            "model_loaded": model_loaded,
            "model_path": matcher.model_path,
            "model_summary": model_summary,
            "features": {
                "tfidf_features": 5000,
                "ngram_range": [1, 2],
                "numerical_features": [
                    "skills_count",
                    "experience_count", 
                    "education_count",
                    "skills_overlap_ratio",
                    "experience_years",
                    "salary_min",
                    "salary_max",
                    "location_match"
                ]
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting model info: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get model info: {str(e)}"
        )

@router.post("/train/evaluate")
async def evaluate_model():
    """
    Evaluate model performance on test data
    
    Returns:
        Evaluation metrics
    """
    try:
        matcher = CVJobMatcher()
        
        # Try to load existing model
        try:
            matcher.load_model()
        except Exception:
            raise HTTPException(
                status_code=404,
                detail="No trained model found. Please train the model first."
            )
        
        # Generate test data
        cv_data, job_data, labels = matcher.create_sample_data(num_samples=200)
        
        # Prepare data
        X, y = matcher.prepare_data(cv_data, job_data, labels)
        
        # Evaluate model
        loss, accuracy, mse = matcher.model.evaluate(X, y, verbose=0)
        
        return {
            "success": True,
            "evaluation_metrics": {
                "loss": float(loss),
                "accuracy": float(accuracy),
                "mse": float(mse)
            },
            "test_samples": len(cv_data)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error evaluating model: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to evaluate model: {str(e)}"
        )

async def _train_model_background(
    num_samples: int,
    epochs: int,
    validation_split: float
):
    """
    Background task for model training
    
    Args:
        num_samples: Number of sample training examples
        epochs: Number of training epochs
        validation_split: Fraction of data for validation
    """
    try:
        # Update training status
        training_status["is_training"] = True
        training_status["progress"] = 0
        training_status["message"] = "Initializing training..."
        training_status["error"] = None
        
        # Initialize matcher
        matcher = CVJobMatcher()
        
        # Update status
        training_status["progress"] = 10
        training_status["message"] = "Generating training data..."
        
        # Generate sample data
        cv_data, job_data, labels = matcher.create_sample_data(num_samples=num_samples)
        
        # Update status
        training_status["progress"] = 30
        training_status["message"] = "Preparing data for training..."
        
        # Train model
        history = matcher.train(
            cv_data=cv_data,
            job_data=job_data,
            labels=labels,
            validation_split=validation_split,
            epochs=epochs
        )
        
        # Update status
        training_status["progress"] = 90
        training_status["message"] = "Finalizing model..."
        
        # Simulate finalization delay
        await asyncio.sleep(2)
        
        # Complete training
        training_status["progress"] = 100
        training_status["message"] = "Training completed successfully"
        training_status["is_training"] = False
        
        logger.info("Model training completed successfully")
        
    except Exception as e:
        logger.error(f"Model training failed: {str(e)}")
        training_status["is_training"] = False
        training_status["error"] = str(e)
        training_status["message"] = f"Training failed: {str(e)}"
