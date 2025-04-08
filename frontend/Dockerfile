# Development image for hot-reloading
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with clean cache
RUN npm clean-install --force

# Copy all frontend files
COPY . .

# Make start script executable
RUN chmod +x /app/start.sh

# Expose the Vite dev server port
EXPOSE 5173

# Start Vite dev server
CMD ["/bin/bash", "/app/start.sh"]
