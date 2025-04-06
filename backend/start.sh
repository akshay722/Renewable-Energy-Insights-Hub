#!/bin/bash

# Set Python path to include current directory
export PYTHONPATH=$PYTHONPATH:$(pwd)

# Start the FastAPI application
echo "Starting FastAPI application..."
echo "Connecting to database..."

# Run the seed database script if it exists and flag is set
if [ -f "seed_database.py" ] && [ "$SEED_DATABASE" = "true" ]; then
  echo "Seeding database with mock data..."
  python seed_database.py || echo "Warning: Database seeding failed, but continuing with application startup"
fi

# Start the application
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload