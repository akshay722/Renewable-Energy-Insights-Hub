#!/bin/bash

# Set Python path to include current directory
export PYTHONPATH=$PYTHONPATH:$(pwd)

# Start the FastAPI application
echo "Starting FastAPI application..."
echo "Connecting to existing database at host.docker.internal..."
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload