import easyocr
import cv2
import numpy as np
from PIL import Image
from typing import Optional, List, Tuple
import logging
import io
import base64

logger = logging.getLogger(__name__)

class ImageOCR:
    """OCR processing for image files using EasyOCR"""
    
    def __init__(self, languages: List[str] = None):
        """
        Initialize OCR reader
        
        Args:
            languages: List of language codes (e.g., ['en', 'vi'])
        """
        self.languages = languages or ['en', 'vi']
        try:
            self.reader = easyocr.Reader(self.languages)
            logger.info(f"EasyOCR initialized with languages: {self.languages}")
        except Exception as e:
            logger.error(f"Failed to initialize EasyOCR: {str(e)}")
            self.reader = None
    
    def extract_text(self, file_path: str) -> Optional[str]:
        """
        Extract text from image file
        
        Args:
            file_path: Path to image file
            
        Returns:
            Extracted text as string or None if failed
        """
        if not self.reader:
            logger.error("OCR reader not initialized")
            return None
            
        try:
            # Preprocess image
            processed_image = self._preprocess_image(file_path)
            if processed_image is None:
                return None
            
            # Perform OCR
            results = self.reader.readtext(processed_image)
            
            # Extract and format text
            text_lines = []
            for (bbox, text, confidence) in results:
                if confidence > 0.5:  # Filter low confidence results
                    text_lines.append(text.strip())
            
            extracted_text = "\n".join(text_lines)
            
            logger.info(f"Extracted {len(text_lines)} lines of text from image")
            return extracted_text if extracted_text.strip() else None
            
        except Exception as e:
            logger.error(f"Error extracting text from image {file_path}: {str(e)}")
            return None
    
    def extract_text_from_bytes(self, image_bytes: bytes) -> Optional[str]:
        """
        Extract text from image bytes
        
        Args:
            image_bytes: Image data as bytes
            
        Returns:
            Extracted text as string or None if failed
        """
        if not self.reader:
            logger.error("OCR reader not initialized")
            return None
            
        try:
            # Convert bytes to numpy array
            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                logger.error("Failed to decode image from bytes")
                return None
            
            # Preprocess image
            processed_image = self._preprocess_image_array(image)
            
            # Perform OCR
            results = self.reader.readtext(processed_image)
            
            # Extract and format text
            text_lines = []
            for (bbox, text, confidence) in results:
                if confidence > 0.5:  # Filter low confidence results
                    text_lines.append(text.strip())
            
            extracted_text = "\n".join(text_lines)
            
            logger.info(f"Extracted {len(text_lines)} lines of text from image bytes")
            return extracted_text if extracted_text.strip() else None
            
        except Exception as e:
            logger.error(f"Error extracting text from image bytes: {str(e)}")
            return None
    
    def _preprocess_image(self, file_path: str) -> Optional[np.ndarray]:
        """
        Preprocess image file for better OCR results
        
        Args:
            file_path: Path to image file
            
        Returns:
            Preprocessed image as numpy array or None if failed
        """
        try:
            # Load image
            image = cv2.imread(file_path)
            if image is None:
                logger.error(f"Failed to load image: {file_path}")
                return None
            
            return self._preprocess_image_array(image)
            
        except Exception as e:
            logger.error(f"Error preprocessing image {file_path}: {str(e)}")
            return None
    
    def _preprocess_image_array(self, image: np.ndarray) -> np.ndarray:
        """
        Preprocess image array for better OCR results
        
        Args:
            image: Image as numpy array
            
        Returns:
            Preprocessed image as numpy array
        """
        try:
            # Convert to grayscale
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image
            
            # Apply adaptive thresholding for better text extraction
            binary = cv2.adaptiveThreshold(
                gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                cv2.THRESH_BINARY, 11, 2
            )
            
            # Noise reduction
            denoised = cv2.medianBlur(binary, 3)
            
            # Enhance contrast
            enhanced = cv2.convertScaleAbs(denoised, alpha=1.5, beta=10)
            
            return enhanced
            
        except Exception as e:
            logger.error(f"Error in image preprocessing: {str(e)}")
            return image  # Return original if preprocessing fails
    
    def extract_text_with_confidence(self, file_path: str) -> List[Tuple[str, float]]:
        """
        Extract text with confidence scores
        
        Args:
            file_path: Path to image file
            
        Returns:
            List of tuples (text, confidence_score)
        """
        if not self.reader:
            logger.error("OCR reader not initialized")
            return []
            
        try:
            processed_image = self._preprocess_image(file_path)
            if processed_image is None:
                return []
            
            results = self.reader.readtext(processed_image)
            
            # Filter and format results
            text_with_confidence = []
            for (bbox, text, confidence) in results:
                if confidence > 0.3:  # Lower threshold for detailed results
                    text_with_confidence.append((text.strip(), confidence))
            
            return text_with_confidence
            
        except Exception as e:
            logger.error(f"Error extracting text with confidence: {str(e)}")
            return []
    
    def detect_text_regions(self, file_path: str) -> List[dict]:
        """
        Detect text regions with bounding boxes
        
        Args:
            file_path: Path to image file
            
        Returns:
            List of dictionaries with text region information
        """
        if not self.reader:
            logger.error("OCR reader not initialized")
            return []
            
        try:
            processed_image = self._preprocess_image(file_path)
            if processed_image is None:
                return []
            
            results = self.reader.readtext(processed_image)
            
            text_regions = []
            for (bbox, text, confidence) in results:
                if confidence > 0.3:
                    # Convert bbox to more usable format
                    x_min = min(point[0] for point in bbox)
                    y_min = min(point[1] for point in bbox)
                    x_max = max(point[0] for point in bbox)
                    y_max = max(point[1] for point in bbox)
                    
                    text_regions.append({
                        "text": text.strip(),
                        "confidence": confidence,
                        "bbox": {
                            "x_min": x_min,
                            "y_min": y_min,
                            "x_max": x_max,
                            "y_max": y_max,
                            "width": x_max - x_min,
                            "height": y_max - y_min
                        }
                    })
            
            return text_regions
            
        except Exception as e:
            logger.error(f"Error detecting text regions: {str(e)}")
            return []
