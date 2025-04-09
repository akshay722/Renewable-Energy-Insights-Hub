# Renewable Energy Insights Hub Backend

A FastAPI-based backend service for the Renewable Energy Insights Hub that provides data visualization for energy consumption and generation with secure user access.

## Features

- User authentication with JWT tokens
- Energy consumption data tracking and analysis
- Energy generation data tracking and analysis
- Energy source categorization (solar, wind, hydro, etc.)
- Data filtering by date range and energy source
- Energy efficiency insights and recommendations

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

### API Endpoints

#### Authentication

- `POST /api/auth/login`: Authenticate a user
- `POST /api/auth/register`: Register a new user
- `GET /api/auth/me`: Get the currently authenticated user

#### Projects

- `GET /api/projects`: List all projects for current user
- `POST /api/projects`: Create a new project
- `GET /api/projects/{id}`: Get a specific project
- `PUT /api/projects/{id}`: Update a project
- `DELETE /api/projects/{id}`: Delete a project

#### Energy Consumption

- `POST /api/energy/consumption`: Add consumption data
- `GET /api/energy/consumption`: Get raw consumption data
- `GET /api/energy/consumption/aggregate/daily`: Get daily aggregated consumption
- `GET /api/energy/consumption/aggregate/weekly`: Get weekly aggregated consumption

#### Energy Generation

- `POST /api/energy/generation`: Add generation data
- `GET /api/energy/generation`: Get raw generation data
- `GET /api/energy/generation/aggregate/daily`: Get daily aggregated generation
- `GET /api/energy/generation/aggregate/weekly`: Get weekly aggregated generation

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
