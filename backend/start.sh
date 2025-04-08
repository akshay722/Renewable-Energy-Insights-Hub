#!/bin/bash

echo "Waiting for MySQL to be ready via Python..."

# Run Python script to wait until DB is reachable
python3 /app/wait_for_db.py

# If successful, start the FastAPI server
echo "MySQL is ready. Launching FastAPI...
"
uvicorn main:app --host 0.0.0.0 --port 8000
