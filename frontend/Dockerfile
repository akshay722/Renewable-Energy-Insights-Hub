# Development image for hot-reloading
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy all frontend files
COPY . .

# Make start script executable
RUN chmod +x /app/start.sh

# Expose the Vite dev server port
EXPOSE 5173

# Start Vite dev server
CMD ["/bin/bash", "/app/start.sh"]
