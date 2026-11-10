from pydantic import BaseModel
from typing import Optional, List

class CVData(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: List[str] = []
    experience: List[dict] = []
    education: List[dict] = []
    location: Optional[str] = None
    summary: Optional[str] = None

class ExtractResponse(BaseModel):
    success: bool
    cv_data: Optional[dict] = None
    raw_text: Optional[str] = None
    error: Optional[str] = None

class JobData(BaseModel):
    id: Optional[str] = None
    title: str
    description: Optional[str] = None
    requirements: List[str] = []
    skills: List[str] = []
    location: Optional[str] = None
    company: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None

class JobRecommendation(BaseModel):
    job_id: str
    title: str
    company: Optional[str] = None
    location: Optional[str] = None
    match_score: float
    match_reasons: List[str] = []

class RecommendRequest(BaseModel):
    cv_data: CVData
    jobs: List[JobData]
    top_k: int = 10

class RecommendResponse(BaseModel):
    success: bool
    recommendations: List[JobRecommendation] = []
    error: Optional[str] = None