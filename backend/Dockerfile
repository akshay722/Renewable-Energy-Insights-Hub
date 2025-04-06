# Use official Python image
FROM python:3.10

# Set the working directory
WORKDIR /app

# Copy requirements first for caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application files
COPY . .

# Make the start script executable
RUN chmod +x /app/start.sh

# Expose the backend port
EXPOSE 8000

# Start the FastAPI app
CMD ["/bin/bash", "/app/start.sh"]
