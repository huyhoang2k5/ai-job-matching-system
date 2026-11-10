#!/bin/bash
echo "Starting CV AI Service..."
cd "$(dirname "$0")/cv-ai-service"
if [ -d "venv" ]; then
    source venv/bin/activate
fi
uvicorn app.main:app --reload --port 8000
