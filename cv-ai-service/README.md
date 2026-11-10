# CV AI Service

AI-powered CV analysis and job recommendation service built with FastAPI and TensorFlow.

## Features

- **OCR Support**: Extract text from PDF, DOCX, and image files (JPG, PNG)
- **NLP Processing**: Parse CV text to extract structured information
- **AI Matching**: TensorFlow model for CV-Job compatibility scoring
- **Multi-language**: Support for English and Vietnamese text processing
- **REST API**: Clean FastAPI endpoints for integration

## Tech Stack

- **Backend**: FastAPI, Python 3.8+
- **AI/ML**: TensorFlow, scikit-learn, spaCy
- **OCR**: EasyOCR, PyMuPDF, pdfplumber, python-docx
- **NLP**: underthesea (Vietnamese), spaCy (English)
- **Processing**: pandas, numpy

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cv-ai-service
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Download language models:
```bash
python -m spacy download en_core_web_sm
python -m spacy download vi_core_news_lg
```

5. Copy environment file:
```bash
cp .env.example .env
```

## Usage

### Start the service:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### API Documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Extract CV Data
- `POST /api/v1/extract` - Extract structured data from uploaded file
- `POST /api/v1/extract/text` - Extract data from raw text
- `GET /api/v1/extract/supported-formats` - Get supported file formats
- `POST /api/v1/extract/validate` - Validate extracted CV data

### Job Recommendations
- `POST /api/v1/recommend` - Get job recommendations for CV
- `POST /api/v1/recommend/single` - Get match score for single job
- `POST /api/v1/recommend/batch` - Batch processing for multiple pairs
- `POST /api/v1/recommend/features` - Get feature importance analysis
- `GET /api/v1/recommend/stats` - Get system statistics

### Model Training
- `POST /api/v1/train` - Train the matching model
- `GET /api/v1/train/status` - Get training status
- `POST /api/v1/train/stop` - Stop ongoing training
- `GET /api/v1/train/model-info` - Get model information
- `POST /api/v1/train/evaluate` - Evaluate model performance

## Example Usage

### Extract CV from file:
```python
import requests

# Upload CV file
with open('cv.pdf', 'rb') as f:
    files = {'file': f}
    data = {'include_raw_text': True}
    response = requests.post('http://localhost:8000/api/v1/extract', 
                           files=files, data=data)
    
result = response.json()
print(result['cv_data'])
```

### Get job recommendations:
```python
import requests

cv_data = {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "0123456789",
    "skills": ["python", "react", "sql"],
    "experience": [{"title": "Software Engineer", "company": "Tech Corp"}],
    "education": [{"degree": "Bachelor", "school": "University"}],
    "location": "Hanoi"
}

jobs = [
    {
        "title": "Senior Python Developer",
        "description": "Looking for experienced Python developer",
        "skills": ["python", "sql", "django"],
        "location": "Hanoi"
    }
]

request_data = {
    "cv_data": cv_data,
    "jobs": jobs,
    "top_k": 5
}

response = requests.post('http://localhost:8000/api/v1/recommend', 
                        json=request_data)
                        
recommendations = response.json()
print(recommendations['recommendations'])
```

## Project Structure

```
cv-ai-service/
├── app/
│   ├── api/                 # FastAPI route handlers
│   │   ├── extract.py       # CV extraction endpoints
│   │   ├── recommend.py     # Job recommendation endpoints
│   │   └── train.py         # Model training endpoints
│   ├── core/                # Core configuration
│   │   └── config.py        # Settings and environment variables
│   ├── models/              # Pydantic models
│   │   └── __init__.py     # Data models for API
│   ├── nlp/                # Natural language processing
│   │   ├── cleaner.py       # Text cleaning and normalization
│   │   └── parser.py        # CV information extraction
│   ├── ocr/                # OCR and file extraction
│   │   ├── pdf_extractor.py # PDF text extraction
│   │   ├── docx_extractor.py # DOCX text extraction
│   │   ├── image_ocr.py     # Image OCR processing
│   │   └── extractor_factory.py # Factory for file extractors
│   └── model/              # Machine learning models
│       ├── train.py         # Model training logic
│       └── predict.py       # Prediction and inference
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
└── README.md             # This file
```

## Configuration

Environment variables (copy `.env.example` to `.env`):

```env
# App Configuration
APP_NAME=CV AI Service
DEBUG=false
VERSION=1.0.0

# AI Model Settings
MODEL_PATH=app/model/saved_model
MAX_FILE_SIZE=10485760
ALLOWED_EXTENSIONS=.pdf,.docx,.jpg,.jpeg,.png

# NLP Settings
SPACY_MODEL=en_core_web_sm
VIETNAMESE_MODEL=vi_core_news_lg

# OCR Settings
EASYOCR_LANGS=en,vi

# External Services
BACKEND_URL=http://localhost:3001
```

## Model Training

The service includes a TensorFlow neural network for CV-Job matching:

1. **Automatic Training**: The model trains automatically on first use with sample data
2. **Custom Training**: Use `/api/v1/train` endpoint to train with custom data
3. **Features**: TF-IDF text vectors + numerical features (skills overlap, experience, location)
4. **Architecture**: 4-layer neural network with dropout and batch normalization

## Development

### Running tests:
```bash
pytest
```

### Code formatting:
```bash
black app/
flake8 app/
```

### Adding new features:
1. Update models in `app/models/`
2. Add business logic in appropriate modules
3. Create API endpoints in `app/api/`
4. Update tests and documentation

## Deployment

### Docker:
```bash
docker build -t cv-ai-service .
docker run -p 8000:8000 cv-ai-service
```

### Production:
- Use Gunicorn or uWSGI for production serving
- Configure proper CORS settings
- Set up monitoring and logging
- Use environment variables for configuration

## License

MIT License
