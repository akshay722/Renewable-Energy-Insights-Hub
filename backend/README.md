# Renewable Energy Insights Hub Backend

A FastAPI-based backend service for the Renewable Energy Insights Hub that provides data visualization for energy consumption and generation with secure user access.

## Features

- User authentication with JWT tokens
- Energy consumption data tracking and analysis
- Energy generation data tracking and analysis
- Energy source categorization (solar, wind, hydro, etc.)
- Data filtering by date range and energy source
- Energy efficiency insights and recommendations
- Mock data generation for testing and demos

## Setup

1. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the root directory with the following content:

```
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/renewable_energy_db
SECRET_KEY=your_secret_key_here
```

4. Create the MySQL database:

```bash
mysql -u root -p
```

```sql
CREATE DATABASE renewable_energy_db;
exit;
```

## Running the Application

Start the development server:

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login and get access token

### Users

- `GET /api/v1/users/me` - Get current user information
- `PUT /api/v1/users/me` - Update current user information

### Energy Consumption

- `POST /api/v1/energy/consumption/` - Create new consumption record
- `GET /api/v1/energy/consumption/` - Get consumption records with filtering
- `GET /api/v1/energy/consumption/{consumption_id}` - Get specific consumption record
- `PUT /api/v1/energy/consumption/{consumption_id}` - Update consumption record
- `DELETE /api/v1/energy/consumption/{consumption_id}` - Delete consumption record
- `POST /api/v1/energy/consumption/batch-create` - Create multiple records
- `GET /api/v1/energy/consumption/aggregate/daily` - Get daily aggregated data

### Energy Generation

- `POST /api/v1/energy/generation/` - Create new generation record
- `GET /api/v1/energy/generation/` - Get generation records with filtering
- `GET /api/v1/energy/generation/{generation_id}` - Get specific generation record
- `PUT /api/v1/energy/generation/{generation_id}` - Update generation record
- `DELETE /api/v1/energy/generation/{generation_id}` - Delete generation record
- `POST /api/v1/energy/generation/batch-create` - Create multiple records
- `GET /api/v1/energy/generation/aggregate/daily` - Get daily aggregated data

### Insights

- `GET /api/v1/insights/summary` - Get energy summary comparing consumption and generation
- `GET /api/v1/insights/recommendations` - Get personalized energy recommendations
- `GET /api/v1/insights/trends` - Get energy usage trends over time

### Mock Data

- `POST /api/v1/data-sample/generate` - Generate sample data for testing and demos

## Project Structure

```
.
├── api/                # API routes and endpoints
│   ├── endpoints/      # API endpoint modules
│   └── deps.py         # Dependency functions
├── core/               # Core functionality
│   └── security.py     # Authentication and security
├── models/             # SQLAlchemy models
│   ├── base.py         # Base model class
│   ├── user.py         # User model
│   └── energy_data.py  # Energy models
├── schemas/            # Pydantic schemas
│   ├── user.py         # User schemas
│   ├── energy.py       # Energy schemas
│   └── token.py        # Token schemas
├── utils/              # Utility functions
│   └── mock_data.py    # Mock data generator
├── main.py             # Main application entry point
├── config.py           # Configuration settings
├── database.py         # Database connection setup
├── requirements.txt    # Project dependencies
└── README.md           # This file
```