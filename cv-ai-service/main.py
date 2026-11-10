from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import extract, recommend, train
from app.core.config import settings

app = FastAPI(
    title="CV AI Service",
    description="AI-powered CV analysis and job recommendation service",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(extract.router, prefix="/api/v1", tags=["extract"])
app.include_router(recommend.router, prefix="/api/v1", tags=["recommend"])
app.include_router(train.router, prefix="/api/v1", tags=["train"])

@app.get("/")
async def root():
    return {"message": "CV AI Service is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "cv-ai-service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
