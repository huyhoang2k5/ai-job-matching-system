import re
import string
from typing import List
from underthesea import text_normalize
import logging

logger = logging.getLogger(__name__)

class TextCleaner:
    """Clean and normalize text extracted from CVs"""
    
    def __init__(self):
        # Common patterns to clean
        self.email_pattern = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
        self.phone_pattern = re.compile(r'(\+84|0)?[3-9][0-9]{8,9}')
        self.url_pattern = re.compile(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+')
        self.date_pattern = re.compile(r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b|\b\d{4}[/-]\d{1,2}[/-]\d{1,2}\b')
        
        # Vietnamese characters normalization
        self.vietnamese_chars = {
            'à', 'á', 'ạ', 'ả', 'ã', 'â', 'ầ', 'ấ', 'ậ', 'ẩ', 'ẫ', 'ă', 'ằ', 'ắ', 'ặ', 'ẳ', 'ẵ',
            'è', 'é', 'ẹ', 'ẻ', 'ẽ', 'ê', 'ề', 'ế', 'ệ', 'ể', 'ễ',
            'ì', 'í', 'ị', 'ỉ', 'ĩ',
            'ò', 'ó', 'ọ', 'ỏ', 'õ', 'ô', 'ồ', 'ố', 'ộ', 'ổ', 'ỗ', 'ơ', 'ờ', 'ớ', 'ợ', 'ở', 'ỡ',
            'ù', 'ú', 'ụ', 'ủ', 'ũ', 'ư', 'ừ', 'ứ', 'ự', 'ử', 'ữ',
            'ỳ', 'ý', 'ỵ', 'ỷ', 'ỹ',
            'đ', 'Đ',
            'À', 'Á', 'Ạ', 'Ả', 'Ã', 'Â', 'Ầ', 'Ấ', 'Ậ', 'Ẩ', 'Ẫ', 'Ă', 'Ằ', 'Ắ', 'Ặ', 'Ẳ', 'Ẵ',
            'È', 'É', 'Ẹ', 'Ẻ', 'Ẽ', 'Ê', 'Ề', 'Ế', 'Ệ', 'Ể', 'Ễ',
            'Ì', 'Í', 'Ị', 'Ỉ', 'Ĩ',
            'Ò', 'Ó', 'Ọ', 'Ỏ', 'Õ', 'Ô', 'Ồ', 'Ố', 'Ộ', 'Ổ', 'Ỗ', 'Ơ', 'Ờ', 'Ớ', 'Ợ', 'Ở', 'Ỡ',
            'Ù', 'Ú', 'Ụ', 'Ủ', 'Ũ', 'Ư', 'Ừ', 'Ứ', 'Ự', 'Ử', 'Ữ',
            'Ỳ', 'Ý', 'Ỵ', 'Ỷ', 'Ỹ'
        }
    
    def clean_text(self, text: str) -> str:
        """
        Clean and normalize text
        
        Args:
            text: Raw text from CV
            
        Returns:
            Cleaned text
        """
        if not text:
            return ""
        
        try:
            # Remove extra spaces but preserve newlines
            text = re.sub(r'[ \t]+', ' ', text)
            # Normalize newlines
            text = re.sub(r'\n\s*\n', '\n\n', text)
            
            # Remove special characters but keep Vietnamese characters
            text = self._remove_special_chars(text)
            
            # Normalize Vietnamese text
            text = self._normalize_vietnamese(text)
            
            # Remove page numbers and headers/footers
            text = self._remove_page_numbers(text)
            
            # Remove email and phone patterns temporarily for better processing
            text = self._preserve_patterns(text)
            
            # Strip and return
            return text.strip()
            
        except Exception as e:
            logger.error(f"Error cleaning text: {str(e)}")
            return text
    
    def _remove_special_chars(self, text: str) -> str:
        """Remove special characters but keep Vietnamese characters and basic punctuation"""
        # Keep letters, numbers, Vietnamese characters, and basic punctuation
        allowed_chars = string.ascii_letters + string.digits + string.punctuation + ' '
        
        # Add Vietnamese characters to allowed chars
        for char in self.vietnamese_chars:
            allowed_chars += char
        
        cleaned = ""
        for char in text:
            if char in allowed_chars or char.isspace():
                cleaned += char
            else:
                cleaned += " "
        
        return cleaned
    
    def _normalize_vietnamese(self, text: str) -> str:
        """Normalize Vietnamese text using underthesea"""
        try:
            # Use underthesea for Vietnamese text normalization
            normalized = text_normalize(text)
            return normalized
        except Exception as e:
            logger.warning(f"Vietnamese normalization failed: {str(e)}")
            return text
    
    def _remove_page_numbers(self, text: str) -> str:
        """Remove page numbers and common CV headers/footers"""
        # Remove page numbers like "Page 1 of 3", "Trang 1/3"
        text = re.sub(r'(?i)page\s+\d+\s+of\s+\d+', '', text)
        text = re.sub(r'(?i)trang\s+\d+[/\s]\d+', '', text)
        
        # Remove common headers/footers
        headers_footers = [
            r'(?i)curriculum\s+vitae',
            r'(?i)cv\s+resume',
            r'(?i)resume',
            r'(?i)sơ\s+yield\s+lý\s+lịch',
            r'(?i)hồ\s+so\s+cá\s+nhiên'
        ]
        
        for pattern in headers_footers:
            text = re.sub(pattern, '', text)
        
        return text
    
    def _preserve_patterns(self, text: str) -> str:
        """Preserve important patterns like emails and phones"""
        # This method can be used to temporarily replace patterns
        # and restore them later if needed
        return text
    
    def extract_sentences(self, text: str) -> List[str]:
        """
        Split text into sentences
        
        Args:
            text: Input text
            
        Returns:
            List of sentences
        """
        if not text:
            return []
        
        try:
            # Simple sentence splitting - can be enhanced with underthesea
            sentences = re.split(r'[.!?]+', text)
            sentences = [s.strip() for s in sentences if s.strip()]
            return sentences
        except Exception as e:
            logger.error(f"Error splitting sentences: {str(e)}")
            return [text]
    
    def remove_stopwords(self, text: str, custom_stopwords: List[str] = None) -> str:
        """
        Remove common stopwords from text
        
        Args:
            text: Input text
            custom_stopwords: List of custom stopwords to remove
            
        Returns:
            Text without stopwords
        """
        try:
            # Basic English stopwords
            english_stopwords = {
                'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 
                'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 
                'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 
                'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 
                'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 
                'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 
                'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 
                'at', 'by', 'for', 'with', 'through', 'during', 'before', 'after', 'above', 
                'below', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 
                'further', 'then', 'once'
            }
            
            # Basic Vietnamese stopwords
            vietnamese_stopwords = {
                'và', 'là', 'của', 'các', 'cho', 'để', 'với', 'trong', 'một', 'nhưng', 
                'không', 'có', 'được', 'từ', 'ở', 'về', 'này', 'đó', 'lên', 'xuống', 'ra', 
                'vào', 'lại', 'còn', 'đã', 'sẽ', 'đang', 'thì', 'mà', 'nếu', 'như', 'vì', 
                'tại', 'theo', 'giữa', 'qua', 'khi', 'nào', 'nào', 'mấy', 'bao nhiêu', 
                'tất cả', 'mọi', 'nhiều', 'ít', 'hơn', 'nhất', 'rất', 'quá', 'đã', 'chưa'
            }
            
            all_stopwords = english_stopwords | vietnamese_stopwords
            
            if custom_stopwords:
                all_stopwords.update(custom_stopwords)
            
            words = text.lower().split()
            filtered_words = [word for word in words if word not in all_stopwords]
            
            return ' '.join(filtered_words)
            
        except Exception as e:
            logger.error(f"Error removing stopwords: {str(e)}")
            return text
    
    def normalize_skills(self, skills: List[str]) -> List[str]:
        """
        Normalize skill names and filter out noisy extracted text
        
        Args:
            skills: List of skill names
            
        Returns:
            Normalized and filtered skill names
        """
        normalized_skills = []
        
        for skill in skills:
            if not skill:
                continue
            
            # Split skill by comma, slash, semicolon, or vertical bar to separate combined skills
            parts = re.split(r'[,/;|]', skill)
            for part in parts:
                normalized = part.lower().strip()
                
                # Remove common prefixes/suffixes
                normalized = re.sub(r'^(knowledge\s+of|experience\s+with|skill\s+in|languages?\s+and|frameworks?)\s+', '', normalized)
                normalized = re.sub(r'\s+(skills?|experience|knowledge|languages?|frameworks?)$', '', normalized)
                normalized = re.sub(r'\s+', ' ', normalized).strip()
                
                # Validation filters for clean skills:
                # 1. Skip if it is too short (<=1 character) or too long (>=25 characters, which is usually a phrase/sentence)
                if len(normalized) <= 1 or len(normalized) > 25:
                    continue
                # 2. Skip if it contains too many words (maximum 3 words)
                if len(normalized.split()) > 3:
                    continue
                # 3. Skip if it is mostly numeric or contains digits
                if re.match(r'^\d+(\.\d+)?$', normalized) or re.search(r'\d+/\d+', normalized):
                    continue
                # 4. Skip common noisy words that are not skills
                noisy_words = {'university', 'college', 'gpa', 'school', 'subjects', 'vietnam', 'hanoi', 'danang', 'saigon', 'email', 'phone', 'github', 'portfolio', 'contact', 'detected', 'awards', 'awards & certifications', 'certifications'}
                if normalized in noisy_words or any(nw in normalized for nw in ['university of', 'college of']):
                    continue
                
                normalized_skills.append(normalized)
        
        # Remove duplicates while preserving order
        seen = set()
        unique_skills = []
        for skill in normalized_skills:
            if skill not in seen:
                seen.add(skill)
                unique_skills.append(skill)
        
        return unique_skills
