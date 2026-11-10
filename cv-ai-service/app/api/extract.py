from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
import tempfile
import os
import logging
from typing import Optional

from ..ocr.extractor_factory import ExtractorFactory
from ..nlp.parser import CVParser
from ..models import ExtractResponse, CVData

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize components
extractor_factory = ExtractorFactory()
cv_parser = CVParser()

@router.post("/extract", response_model=ExtractResponse)
async def extract_cv_data(
    file: UploadFile = File(...),
    include_raw_text: bool = Form(False)
):
    """
    Extract structured data from uploaded CV file
    
    Args:
        file: CV file (PDF, DOCX, JPG, PNG)
        include_raw_text: Whether to include raw extracted text in response
        
    Returns:
        Structured CV data with extraction status
    """
    try:
        # Validate file type
        if not extractor_factory.is_supported_file(file.filename):
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type. Supported types: {', '.join(extractor_factory.pdf_extensions | extractor_factory.docx_extensions | extractor_factory.image_extensions)}"
            )
        
        # Check file size
        file_size = 0
        content = await file.read()
        file_size = len(content)
        
        max_size = 10 * 1024 * 1024  # 10MB
        if file_size > max_size:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size is {max_size // (1024*1024)}MB"
            )
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            # Extract text from file
            raw_text = extractor_factory.extract_text(temp_file_path)
            
            if not raw_text:
                raise HTTPException(
                    status_code=422,
                    detail="Could not extract text from the uploaded file"
                )
            
            # Parse CV data
            cv_data_dict = cv_parser.parse_cv(raw_text)
            
            # Create CVData model
            cv_data = CVData(**cv_data_dict)
            
            # Prepare response
            response_data = {
                "success": True,
                "cv_data": cv_data.dict()
            }
            
            if include_raw_text:
                response_data["raw_text"] = raw_text
            
            return ExtractResponse(**response_data)
            
        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_file_path)
            except Exception as e:
                logger.warning(f"Could not delete temporary file {temp_file_path}: {str(e)}")
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error extracting CV data: {str(e)}")
        return ExtractResponse(
            success=False,
            error=f"Failed to extract CV data: {str(e)}"
        )

@router.post("/extract/text")
async def extract_cv_from_text(
    text: str = Form(...),
    file_type: Optional[str] = Form(None)
):
    """
    Extract structured data from CV text
    
    Args:
        text: Raw CV text
        file_type: Optional file type hint for better processing
        
    Returns:
        Structured CV data with extraction status
    """
    try:
        if not text or not text.strip():
            raise HTTPException(
                status_code=400,
                detail="Text content is required"
            )
        
        # Parse CV data
        cv_data_dict = cv_parser.parse_cv(text)
        
        # Create CVData model
        cv_data = CVData(**cv_data_dict)
        
        return ExtractResponse(
            success=True,
            cv_data=cv_data.dict(),
            raw_text=text
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error extracting CV from text: {str(e)}")
        return ExtractResponse(
            success=False,
            error=f"Failed to extract CV data: {str(e)}"
        )

@router.get("/extract/supported-formats")
async def get_supported_formats():
    """
    Get list of supported file formats
    
    Returns:
        Dictionary with supported file extensions
    """
    try:
        return {
            "supported_formats": {
                "pdf": list(extractor_factory.pdf_extensions),
                "docx": list(extractor_factory.docx_extensions),
                "image": list(extractor_factory.image_extensions)
            },
            "max_file_size_mb": 10,
            "max_file_size_bytes": 10 * 1024 * 1024
        }
    except Exception as e:
        logger.error(f"Error getting supported formats: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get supported formats"
        )

@router.post("/extract/validate")
async def validate_cv_data(cv_data: CVData):
    """
    Validate extracted CV data
    
    Args:
        cv_data: CV data to validate
        
    Returns:
        Validation result with any issues found
    """
    try:
        validation_issues = []
        
        # Validate email format
        if cv_data.email:
            import re
            email_pattern = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
            if not email_pattern.match(cv_data.email):
                validation_issues.append("Invalid email format")
        
        # Validate phone format (Vietnamese)
        if cv_data.phone:
            phone_pattern = re.compile(r'(\+84|0)?[3-9][0-9]{8,9}')
            if not phone_pattern.match(cv_data.phone):
                validation_issues.append("Invalid Vietnamese phone number format")
        
        # Check for required fields
        if not cv_data.skills:
            validation_issues.append("No skills found")
        
        if not cv_data.experience:
            validation_issues.append("No experience information found")
        
        # Check data quality
        if cv_data.skills and len(cv_data.skills) < 3:
            validation_issues.append("Very few skills detected")
        
        if cv_data.experience and len(cv_data.experience) == 0:
            validation_issues.append("No work experience detected")
        
        return {
            "valid": len(validation_issues) == 0,
            "issues": validation_issues,
            "completeness_score": _calculate_completeness_score(cv_data)
        }
        
    except Exception as e:
        logger.error(f"Error validating CV data: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to validate CV data: {str(e)}"
        )

def _calculate_completeness_score(cv_data: CVData) -> float:
    """Calculate completeness score for CV data"""
    total_fields = 7  # name, email, phone, skills, experience, education, location
    filled_fields = 0
    
    if cv_data.name:
        filled_fields += 1
    if cv_data.email:
        filled_fields += 1
    if cv_data.phone:
        filled_fields += 1
    if cv_data.skills and len(cv_data.skills) > 0:
        filled_fields += 1
    if cv_data.experience and len(cv_data.experience) > 0:
        filled_fields += 1
    if cv_data.education and len(cv_data.education) > 0:
        filled_fields += 1
    if cv_data.location:
        filled_fields += 1
    
    return round(filled_fields / total_fields * 100, 1)
