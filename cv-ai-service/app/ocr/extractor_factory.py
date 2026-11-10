import os
from typing import Optional
from pathlib import Path
import logging

from .pdf_extractor import PDFExtractor
from .docx_extractor import DOCXExtractor
from .image_ocr import ImageOCR

logger = logging.getLogger(__name__)

class ExtractorFactory:
    """Factory class to create appropriate extractor based on file type"""
    
    def __init__(self):
        self.pdf_extractor = PDFExtractor()
        self.docx_extractor = DOCXExtractor()
        self.image_ocr = ImageOCR()
        
        # Supported file extensions
        self.pdf_extensions = {'.pdf'}
        self.docx_extensions = {'.docx'}
        self.image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif'}
    
    def get_extractor(self, file_path: str):
        """
        Get appropriate extractor based on file extension
        
        Args:
            file_path: Path to the file
            
        Returns:
            Extractor instance or None if unsupported file type
        """
        file_ext = Path(file_path).suffix.lower()
        
        if file_ext in self.pdf_extensions:
            return self.pdf_extractor
        elif file_ext in self.docx_extensions:
            return self.docx_extractor
        elif file_ext in self.image_extensions:
            return self.image_ocr
        else:
            logger.error(f"Unsupported file type: {file_ext}")
            return None
    
    def extract_text(self, file_path: str) -> Optional[str]:
        """
        Extract text from file using appropriate extractor
        
        Args:
            file_path: Path to the file
            
        Returns:
            Extracted text as string or None if failed
        """
        try:
            # Check if file exists
            if not os.path.exists(file_path):
                logger.error(f"File not found: {file_path}")
                return None
            
            # Get appropriate extractor
            extractor = self.get_extractor(file_path)
            if not extractor:
                return None
            
            # Extract text
            text = extractor.extract_text(file_path)
            
            if text:
                logger.info(f"Successfully extracted text from {file_path}")
                return text
            else:
                logger.warning(f"No text extracted from {file_path}")
                return None
                
        except Exception as e:
            logger.error(f"Error extracting text from {file_path}: {str(e)}")
            return None
    
    def extract_metadata(self, file_path: str) -> dict:
        """
        Extract metadata from file using appropriate extractor
        
        Args:
            file_path: Path to the file
            
        Returns:
            Dictionary containing file metadata
        """
        try:
            extractor = self.get_extractor(file_path)
            if not extractor:
                return {}
            
            # Check if extractor has metadata extraction method
            if hasattr(extractor, 'extract_metadata'):
                return extractor.extract_metadata(file_path)
            else:
                logger.info(f"Extractor for {file_path} does not support metadata extraction")
                return {}
                
        except Exception as e:
            logger.error(f"Error extracting metadata from {file_path}: {str(e)}")
            return {}
    
    def is_supported_file(self, file_path: str) -> bool:
        """
        Check if file type is supported
        
        Args:
            file_path: Path to the file
            
        Returns:
            True if file type is supported, False otherwise
        """
        file_ext = Path(file_path).suffix.lower()
        all_extensions = self.pdf_extensions | self.docx_extensions | self.image_extensions
        return file_ext in all_extensions
    
    def get_file_type(self, file_path: str) -> str:
        """
        Get file type category
        
        Args:
            file_path: Path to the file
            
        Returns:
            File type as string ('pdf', 'docx', 'image', 'unsupported')
        """
        file_ext = Path(file_path).suffix.lower()
        
        if file_ext in self.pdf_extensions:
            return 'pdf'
        elif file_ext in self.docx_extensions:
            return 'docx'
        elif file_ext in self.image_extensions:
            return 'image'
        else:
            return 'unsupported'
