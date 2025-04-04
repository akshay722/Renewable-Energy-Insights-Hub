#!/bin/bash

# Set Python path to include current directory
export PYTHONPATH=$PYTHONPATH:$(pwd)

# Wait for the database to be ready
echo "Waiting for MySQL database..."
sleep 5

# Start the FastAPI application
echo "Starting FastAPI application..."
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload