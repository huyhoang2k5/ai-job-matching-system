from docx import Document
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class DOCXExtractor:
    """Extract text from DOCX files"""
    
    def __init__(self):
        pass
    
    def extract_text(self, file_path: str) -> Optional[str]:
        """
        Extract text from DOCX file
        
        Args:
            file_path: Path to DOCX file
            
        Returns:
            Extracted text as string or None if failed
        """
        try:
            doc = Document(file_path)
            text = ""
            
            # Extract text from paragraphs
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    text += paragraph.text + "\n"
            
            # Extract text from tables
            for table in doc.tables:
                for row in table.rows:
                    row_text = []
                    for cell in row.cells:
                        if cell.text.strip():
                            row_text.append(cell.text.strip())
                    if row_text:
                        text += " | ".join(row_text) + "\n"
            
            # Extract text from headers and footers
            for section in doc.sections:
                # Header
                if section.header:
                    for paragraph in section.header.paragraphs:
                        if paragraph.text.strip():
                            text += paragraph.text + "\n"
                
                # Footer
                if section.footer:
                    for paragraph in section.footer.paragraphs:
                        if paragraph.text.strip():
                            text += paragraph.text + "\n"
            
            return text.strip() if text.strip() else None
            
        except Exception as e:
            logger.error(f"Error extracting text from DOCX {file_path}: {str(e)}")
            return None
    
    def extract_metadata(self, file_path: str) -> dict:
        """
        Extract metadata from DOCX file
        
        Args:
            file_path: Path to DOCX file
            
        Returns:
            Dictionary containing DOCX metadata
        """
        try:
            doc = Document(file_path)
            core_props = doc.core_properties
            
            return {
                "title": core_props.title or "",
                "author": core_props.author or "",
                "subject": core_props.subject or "",
                "keywords": core_props.keywords or "",
                "category": core_props.category or "",
                "comments": core_props.comments or "",
                "created": str(core_props.created) if core_props.created else "",
                "modified": str(core_props.modified) if core_props.modified else "",
                "last_modified_by": core_props.last_modified_by or "",
                "revision": str(core_props.revision) if core_props.revision else ""
            }
            
        except Exception as e:
            logger.error(f"Error extracting DOCX metadata: {str(e)}")
            return {}
    
    def extract_structured_content(self, file_path: str) -> dict:
        """
        Extract structured content from DOCX file
        
        Args:
            file_path: Path to DOCX file
            
        Returns:
            Dictionary with structured content including paragraphs, tables, etc.
        """
        try:
            doc = Document(file_path)
            
            paragraphs = []
            for i, paragraph in enumerate(doc.paragraphs):
                if paragraph.text.strip():
                    paragraphs.append({
                        "index": i,
                        "text": paragraph.text,
                        "style": paragraph.style.name if paragraph.style else "Normal"
                    })
            
            tables = []
            for i, table in enumerate(doc.tables):
                table_data = []
                for row in table.rows:
                    row_data = []
                    for cell in row.cells:
                        row_data.append(cell.text.strip())
                    table_data.append(row_data)
                tables.append({
                    "index": i,
                    "data": table_data
                })
            
            return {
                "paragraphs": paragraphs,
                "tables": tables,
                "total_paragraphs": len(paragraphs),
                "total_tables": len(tables)
            }
            
        except Exception as e:
            logger.error(f"Error extracting structured content from DOCX: {str(e)}")
            return {}
