# Renewable Energy Insights Hub

A comprehensive platform for monitoring and analyzing renewable energy consumption and generation data with interactive visualizations.

## Quick Start with Docker

The easiest way to get started is using Docker, which sets up the entire application stack including database, backend, and frontend.

### Prerequisites

- Docker and Docker Compose
- Git

### One-Command Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/RenewableEnergyInsightsHub.git
cd RenewableEnergyInsightsHub

# Start all services
docker compose up -d
```

### Accessing the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Authentication

Login with these credentials:

- Email: `demo@example.com`
- Password: `password123`

## Features

- Real-time energy consumption and generation monitoring
- Historical data visualization with interactive charts
- Source filtering (solar, wind, hydro, etc.)
- User authentication and profile management
- Project management
- Responsive UI built with React and Tailwind CSS

## Project Architecture

- **Frontend**: React + TypeScript + Vite + Chart.js
- **Backend**: FastAPI + SQLAlchemy + MySQL
- **Containerization**: Docker + Docker Compose

## Manual Setup (Without Docker)

If you prefer to run components separately for development:

### Database Setup

1. Install MySQL (version 8.0 recommended)
2. Create a database and initialize it:

```bash
mysql -u root -p -e "CREATE DATABASE renewable_energy_db;"
mysql -u root -p renewable_energy_db < init-db.sql
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure database connection in .env
echo "DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=renewable_energy_db" > .env

# Start the backend server
python -m uvicorn main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Database Management

### Data Persistence

The Docker setup includes a volume for the database, so your data persists between container restarts.

### Reset to Initial Data

If you need to reset to the initial database state:

```bash
docker compose down -v && docker compose up -d
```

The `-v` flag removes volumes, ensuring a fresh database is created.

### Database Seeding

For development, you can use the Python seed script to populate the database with test data:

```bash
cd backend
python seed_database.py
```

## Docker Commands

```bash
# Stop all containers
docker compose down

# Rebuild and restart containers
docker compose up -d --build

# View logs
docker compose logs -f
```

## Main Features

- **Dashboard**: Overview of energy consumption and generation
- **Consumption Tracking**: View and filter energy consumption data
- **Generation Monitoring**: Track renewable energy generation
- **Source Filtering**: Filter by energy source types (solar, wind, etc.)
- **Time Range Selection**: View data by hour, day, week, or month
- **Interactive Charts**:
  - Energy consumption vs. generation (line charts)
  - Source distribution pie charts

## Deployment

For deploying to AWS, see [DEPLOYMENT.md](DEPLOYMENT.md) which includes detailed instructions for:

- Setting up AWS Free Tier resources
- Deploying the application to Elastic Beanstalk
- Setting up a CI/CD pipeline
