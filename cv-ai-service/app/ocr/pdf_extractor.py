import fitz
import pdfplumber
import easyocr
import numpy as np
from PIL import Image
import io
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class PDFExtractor:
    
    def __init__(self):
        self._ocr_reader = None  # lazy loading
    
    def _get_ocr_reader(self):
        """Khởi tạo EasyOCR chỉ khi cần"""
        if self._ocr_reader is None:
            self._ocr_reader = easyocr.Reader(['vi', 'en'])
        return self._ocr_reader
    
    def extract_text(self, file_path: str) -> Optional[str]:
        try:
            text = self._extract_with_pymupdf(file_path)
            if text and len(text.strip()) > 50:
                return text

            text = self._extract_with_pdfplumber(file_path)
            if text and len(text.strip()) > 50:
                return text

            # Fallback: dùng EasyOCR
            logger.info("Falling back to EasyOCR...")
            text = self._extract_with_easyocr(file_path)
            if text and len(text.strip()) > 50:
                return text

            logger.warning(f"Could not extract sufficient text from {file_path}")
            return None

        except Exception as e:
            logger.error(f"Error extracting text from PDF {file_path}: {str(e)}")
            return None

    def _extract_with_pymupdf(self, file_path: str) -> Optional[str]:
        try:
            doc = fitz.open(file_path)
            text = ""
            for page_num in range(len(doc)):
                page = doc[page_num]
                text += page.get_text() + "\n"
            doc.close()
            return text.strip()
        except Exception as e:
            logger.error(f"PyMuPDF extraction failed: {str(e)}")
            return None

    def _extract_with_pdfplumber(self, file_path: str) -> Optional[str]:
        try:
            text = ""
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            return text.strip()
        except Exception as e:
            logger.error(f"pdfplumber extraction failed: {str(e)}")
            return None

    def _extract_with_easyocr(self, file_path: str) -> Optional[str]:
        """Fallback: chuyển PDF sang ảnh rồi OCR bằng EasyOCR"""
        try:
            reader = self._get_ocr_reader()
            doc = fitz.open(file_path)
            text = ""
            for page_num in range(len(doc)):
                page = doc[page_num]
                mat = fitz.Matrix(2, 2)  # zoom 2x cho rõ
                pix = page.get_pixmap(matrix=mat)
                img_data = pix.tobytes("png")
                img = Image.open(io.BytesIO(img_data))
                img_array = np.array(img)
                results = reader.readtext(img_array)
                page_text = " ".join([result[1] for result in results])
                text += page_text + "\n"
            doc.close()
            return text.strip()
        except Exception as e:
            logger.error(f"EasyOCR extraction failed: {str(e)}")
            return None

    def extract_metadata(self, file_path: str) -> dict:
        try:
            doc = fitz.open(file_path)
            metadata = doc.metadata
            page_count = len(doc)
            doc.close()
            return {
                "title": metadata.get("title", ""),
                "author": metadata.get("author", ""),
                "page_count": page_count
            }
        except Exception as e:
            logger.error(f"Error extracting PDF metadata: {str(e)}")
            return {}