# Renewable Energy Insights Hub

A comprehensive platform for monitoring and analyzing renewable energy consumption and generation.

## Easy Setup with Docker

This application is fully dockerized, including the database with mock data, making it extremely easy to get started.

### Prerequisites

- Docker and Docker Compose
- Git

### One-Command Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/RenewableEnergyInsightsHub.git
cd RenewableEnergyInsightsHub

# Start all services (database, backend, frontend)
docker compose up
```

That's it! The application will:

1. Create a MySQL database with mock data
2. Start the backend API server
3. Start the frontend development server

### Accessing the Application

Once all containers are running, access:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Demo Accounts

The following accounts are pre-created with the mock data:

- Regular user: demo/password
- Test user: test/password123
- Admin user: admin/admin123

## Features

- Real-time energy consumption and generation monitoring
- Historical data visualization with charts and graphs
- Source filtering (solar, wind, grid)
- User authentication and profile management
- Project management
- Modern, responsive UI built with React and Tailwind CSS

## Development

If you prefer to run the application without Docker for development:

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure database
echo "DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=renewable_energy_db" > .env

# Run the server
python -m uvicorn main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Data Persistence

The Docker setup includes a volume for the database, so your data will persist between container restarts. If you need to reset to the initial data, remove the volume:

```bash
docker compose down -v
docker compose up
```

## Deployment

For deploying to AWS, see [DEPLOYMENT.md](DEPLOYMENT.md) which includes detailed instructions for:

- Setting up AWS Free Tier resources
- Deploying the application to Elastic Beanstalk
- Setting up a CI/CD pipeline

## Overview

This application allows businesses to:

- Track energy consumption from different sources (grid, solar, wind, etc.)
- Monitor renewable energy generation data
- Visualize consumption vs. generation patterns
- Filter data by time periods and energy sources
- Identify green power coverage through various charts

## Project Structure

- **Frontend**: React + TypeScript + Vite + Chart.js
- **Backend**: FastAPI + SQLAlchemy + MySQL
- **Containerization**: Docker + Docker Compose

## Setup & Installation

### Prerequisites

- Docker and Docker Compose
- MySQL (if running outside Docker)
- Node.js and npm (for local frontend development)
- Python 3.8+ (for local backend development)

### Using Docker (Recommended)

1. Clone the repository
2. Copy `.env.example` to `.env` and configure as needed
3. Make sure your local MySQL database is running and accessible
4. Run Docker Compose:

```bash
docker compose up -d
```

This will:

- Connect to your local MySQL database using `host.docker.internal`
- Start the FastAPI backend container
- Start the React frontend container

Access the application at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Manual Setup

#### Backend

1. Navigate to the backend directory
2. Create a virtual environment:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Run the backend:

```bash
./start.sh
```

#### Frontend

1. Navigate to the frontend directory
2. Install dependencies:

```bash
cd frontend
npm install
```

3. Run the frontend:

```bash
npm run dev
```

## Database Initialization

The application uses a MySQL database with demo data for energy consumption and generation.

### Using the SQL Script (Quickest Method)

The project includes an SQL script to set up the database with demo data:

1. Create a MySQL database named `renewable_energy_db`
2. Run the init-db.sql script:

```bash
mysql -u root -p < init-db.sql
```

### Using the Python Seed Script

For convenient database seeding:

1. Configure database access in `.env` (copy from `.env.example`)
2. Run the seed script:

```bash
cd backend
python seed_database.py
```

## Default Login

The application is pre-configured with these users:

- Demo User:
  - Username: demo@example.com
  - Password: password

## Working with Containers

Stop the containers:

```bash
docker compose down
```

Rebuild and restart containers:

```bash
docker compose up -d --build
```

View logs:

```bash
docker compose logs -f
```

## Main Features

- **Authentication System**: Login, registration and user profiles
- **Dashboard**: Overview of energy consumption and generation
- **Consumption Tracking**: View and filter energy consumption data
- **Generation Monitoring**: Track renewable energy generation
- **Source Filtering**: Filter data by energy source types
- **Time Range Selection**: View data by hour, day, week or month
- **Interactive Charts**:
  - Energy consumption vs. generation (bars for consumption, spline for generation)
  - Source distribution pie charts

## Database Configuration

### Local Development

The database connection string can be configured in `backend/config.py` or using the `DATABASE_URL` environment variable in your `.env` file.

### Docker Configuration

When running with Docker, the application is configured to connect to your host machine's MySQL database using the `host.docker.internal` DNS name. This allows Docker containers to access services running on your host machine.

The connection string in the Docker environment is:

```
DATABASE_URL=mysql+pymysql://root:Qywter@123@host.docker.internal:3306/renewable_energy_db
```

You can modify this in the `docker-compose.yml` file under the backend service's environment variables if your database credentials or location differ.
