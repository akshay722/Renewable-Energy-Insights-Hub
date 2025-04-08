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

### Local Development

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
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/renewable_energy_db_sql
SECRET_KEY=your_secret_key_here
```

4. Create the MySQL database:

```bash
mysql -u root -p
```

```sql
CREATE DATABASE renewable_energy_db_sql;
exit;
```

### Docker Deployment

The backend can be run in Docker, connecting to your host machine's MySQL database:

1. Ensure your local MySQL database is running and accessible
2. The database connection in Docker uses `host.docker.internal` to connect to your host machine's MySQL:
   ```
   DATABASE_URL=mysql+pymysql://root:Qywter@123@host.docker.internal:3306/renewable_energy_db_sql
   ```
3. Run the Docker container from the project root:
   ```bash
   docker compose up -d backend
   ```

## Running the Application

### Local Development

Start the development server:

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### Docker

The application starts automatically when the Docker container runs. The API will be available at `http://localhost:8000`

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

### Insights

- `GET /api/v1/insights/summary` - Get energy summary comparing consumption and generation

## Troubleshooting

### Database Connection Issues

- When running in Docker, make sure your host MySQL server:

  - Is running and accessible
  - Allows connections from Docker (check bind-address in MySQL config)
  - Has the correct username/password as specified in the connection string
  - Has the renewable_energy_db_sql database created

- You can test the connection from inside the container:
  ```bash
  docker compose exec backend bash
  python -c "import pymysql; pymysql.connect(host='host.docker.internal', user='root', password='Qywter@123', database='renewable_energy_db_sql')"
  ```
  If no error appears, the connection is successful.

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
