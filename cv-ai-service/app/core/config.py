from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    app_name: str = "CV AI Service"
    debug: bool = False
    version: str = "1.0.0"

    host: str = "0.0.0.0"
    port: int = 8000

    model_path: str = "./models"
    model_name: str = "cv_job_matcher.h5"
    max_file_size: int = 10 * 1024 * 1024

    allowed_extensions: str = ".pdf,.docx,.jpg,.jpeg,.png"
    easyocr_langs: str = "en,vi"

    tesseract_cmd: str = "tesseract"
    tesseract_lang: str = "eng,vie"

    spacy_model: str = "en_core_web_sm"
    vietnamese_model: str = "vi_core_news_lg"

    backend_url: Optional[str] = None

    model_config = {"env_file": ".env", "extra": "ignore"}

settings = Settings()