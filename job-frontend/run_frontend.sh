#!/bin/bash
echo "Starting Job Frontend..."
cd "$(dirname "$0")/job-frontend"
npm run dev
