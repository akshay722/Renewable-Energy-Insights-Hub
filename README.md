# Wattwize

A comprehensive platform for monitoring and analyzing renewable energy consumption and generation data with interactive visualizations.

### Demo Environment

- **Frontend URL**: https://d2b2j5yt43rmm.cloudfront.net
- **Backend API**: https://d2rbp73b060qyp.cloudfront.net
- **API Documentation**: https://d2rbp73b060qyp.cloudfront.net/docs

## Features

- **Real-time Energy Monitoring**: Track electricity consumption and generation across multiple sources
- **Source Distribution Analysis**: Visualize energy distribution by source type (solar, wind, hydro, etc.)
- **Multi-Project Management**: Organize and track data across multiple renewable energy projects
- **Environmental Impact Metrics**: Calculate CO2 emissions avoided and renewable percentage
- **Interactive Data Visualization**: Time-series charts, breakdowns, and comparison views
- **Date Range Filtering**: Analyze data across custom time periods
- **Responsive Design**: Full functionality on desktop and mobile devices
- **Dark/Light Mode**: Choose your preferred UI theme

## Project Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Chart.js
- **Backend**: FastAPI + SQLAlchemy + MySQL
- **Containerization**: Docker + Docker Compose

## Prerequisites

Before getting started, ensure you have the following installed on your system:

- [Docker](https://docs.docker.com/get-docker/) (v20.10.0+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0.0+)
- [Git](https://git-scm.com/downloads) (v2.30.0+)

## Quick Start with Docker

The easiest way to get started is using Docker, which sets up the entire application stack including database, backend, and frontend.

```bash
# Clone the repository
git clone https://github.com/yourusername/RenewableEnergyInsightsHub.git
cd RenewableEnergyInsightsHub

# Build and start all services
docker compose build
docker compose up -d
```

### Accessing the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### Default Login Credentials

```
Email: demo@example.com
Password: password123
```

## Project Structure and Components

### Database Structure

The MySQL database contains the following main tables:

- **users**: User accounts and authentication details
- **projects**: Energy projects that belong to users
- **energy_consumption**: Records of energy usage categorized by source
- **energy_generation**: Records of energy generation from renewable sources

### Backend API Endpoints

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

#### Insights

- `GET /api/insights/summary`: Get energy summary (consumption vs. generation)

### Frontend Pages

- **Dashboard**: Overview of energy metrics
- **Projects**: List and management of energy projects
- **Project Details**: Detailed analysis of a specific project
- **Login/Register**: Authentication pages
- **Profile**: User account management

## Manual Setup (Without Docker)

If you prefer to run components separately for development:

### Prerequisites for Manual Setup

Before proceeding with manual setup, ensure you have the following installed:

1. **Python 3.10 or later**:

   - **Windows**: Download and install from [python.org](https://www.python.org/downloads/windows/)
   - **macOS**: `brew install python@3.10` (with [Homebrew](https://brew.sh/))
   - **Linux (Ubuntu/Debian)**: `sudo apt update && sudo apt install python3.10 python3.10-venv python3-pip`

2. **Node.js 18 or later**:

   - **All platforms**: Download from [nodejs.org](https://nodejs.org/)
   - **Alternative**: Use [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions

3. **MySQL 8.0**:
   - **Windows**: Download MySQL Installer from [dev.mysql.com](https://dev.mysql.com/downloads/installer/)
   - **macOS**: `brew install mysql@8.0`
   - **Linux**: `sudo apt install mysql-server-8.0`

### Database Setup

1. Install MySQL (version 8.0 recommended)
2. Create a database and initialize it:

```bash
mysql -u root -p -e "CREATE DATABASE renewable_energy_db_sql;"
mysql -u root -p renewable_energy_db_sql < init-db.sql
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure database connection in .env
# Windows (Command Prompt)
echo DB_USER=root> .env
echo DB_PASSWORD=your_password>> .env
echo DB_HOST=localhost>> .env
echo DB_PORT=3306>> .env
echo DB_NAME=renewable_energy_db_sql>> .env

# Linux/macOS
cat > .env << EOF
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=renewable_energy_db_sql
EOF

# Start the backend server
python -m uvicorn main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Data Management

### Data Persistence

The Docker setup includes a volume for the database, so your data persists between container restarts.

### Reset to Initial Data

If you need to reset to the initial database state:

```bash
docker compose down -v
docker compose up -d
```

The `-v` flag removes volumes, ensuring a fresh database is created.

## Docker Commands Reference

```bash
# Build all containers
docker compose build

# Start all containers in the background
docker compose up -d

# View logs
docker compose logs -f

# Stop all containers
docker compose down

# Stop all containers and remove volumes
docker compose down -v
```

## Key Assumptions

1. **Portfolio of Assets/Projects**: Users organize their energy data into a portfolio of assets or projects, which can represent physical locations, installations, or logical groupings of renewable energy resources.

2. **Dual Tracking**: Each project can track both energy consumption and generation, or just one of them depending on the setup.

3. **Energy Grid Integration**: Excess energy generated and not consumed by a user's projects is still counted toward their overall renewable energy balance.

4. **Source Classification**: Energy is categorized by source types (solar, wind, hydro, geothermal, biomass, grid) for detailed analysis.

5. **Time-Series Data**: All energy data is time-stamped to enable historical analysis and trend identification.

6. **Environmental Impact**: CO2 emissions avoided are calculated based on the difference between renewable generation and grid consumption.

7. **Mock Data Generation**: The application includes 2 months of pre-generated mock data with natural variance to simulate real-world usage patterns across different energy sources, providing a realistic demonstration environment without data inconsistencies.

## Future Improvements

1. **Predictive Analytics**: Implement machine learning to predict future energy generation and consumption.

2. **Energy Shifting Optimization**: Add intelligent algorithms to suggest optimal times for shifting energy usage to periods of peak renewable generation.

3. **Battery Storage Management**: Incorporate battery storage systems monitoring and optimization to track charge/discharge cycles, efficiency, and state of health.

4. **Energy Flow Visualization**: Add interactive diagrams showing real-time energy flows between generation sources, storage systems, consumption points, and grid connections.

5. **Storage ROI Calculator**: Implement tools to calculate return on investment for different energy storage solutions based on usage patterns and local energy prices.

6. **Comprehensive Testing Suite**: Develop end-to-end, integration, and unit tests to ensure application reliability and facilitate future development.

7. **Infrastructure Scaling**: Enhance AWS deployment to support higher traffic and data volumes while maintaining cost-efficiency:

   - Auto-scaling for Elastic Beanstalk
   - Database read replicas for high query loads
   - CloudFront optimization for global access

8. **Mobile Application**: Develop native mobile applications for iOS and Android.

9. **Real-time Integrations**: Add support for IoT device integration for real-time data collection.

10. **Energy Trading**: Implement simulated or real energy trading features for surplus renewable energy.

11. **Additional Visualizations**: Expand data visualization options with more chart types and reports.

12. **Enhanced User Management**: Add support for teams and organizations with role-based access control.

13. **Public API**: Create a public API for third-party integrations.

## Deployment to AWS

This project can be deployed using Terraform for infrastructure as code and GitHub Actions for CI/CD automation.

### AWS Architecture

- **Frontend**: S3 bucket with CloudFront distribution (HTTPS enabled)
- **Backend API**: Elastic Beanstalk running Python FastAPI application
- **Database**: RDS MySQL instance (db.t3.micro)
- **Security**: IAM roles, security groups, HTTPS configuration
- **HTTPS for Backend**: Manually configured through CloudFront after initial infrastructure setup

## Infrastructure as Code with Terraform

This project uses Terraform to provision and manage all AWS infrastructure in a consistent, repeatable way.

### Terraform Configuration

Our Terraform setup (`/terraform` directory) automates the creation of:

- **S3 and CloudFront**: Static hosting with global CDN for the frontend
- **Elastic Beanstalk**: Managed application platform for the Python backend
- **RDS MySQL**: Managed database service for application data
- **Security Groups**: Network access control for components
- **IAM Roles**: Least-privilege access control

### Key Benefits

- **Reproducible Environments**: Identical staging and production setups
- **Version Control**: Infrastructure changes tracked alongside code
- **Dependency Management**: Automatic handling of resource dependencies
- **State Management**: Tracking of deployed resources and their configurations

### Deployment Process

1. **Initialize**: `terraform init` to set up the Terraform environment
2. **Plan**: `terraform plan` to preview infrastructure changes
3. **Apply**: `terraform apply` to create or modify AWS resources
4. **Destroy**: `terraform destroy` to tear down all resources when needed

The Terraform configuration is designed to work within AWS Free Tier limits while providing a production-ready architecture.

## CI/CD with GitHub Actions

This project uses GitHub Actions to automate the deployment process, ensuring consistent and reliable deployments.

### Workflow Configuration

Our GitHub Actions workflow (`.github/workflows/deploy.yml`) handles the complete deployment process:

1. **Triggers**:

   - Automatically runs on push to the `main` branch
   - Can be manually triggered via workflow_dispatch

2. **Frontend Deployment**:

   - Sets up Node.js environment
   - Installs dependencies
   - Builds the React application with production optimization
   - Deploys built assets to S3
   - Invalidates CloudFront cache to ensure latest content is served

3. **Backend Deployment**:

   - Sets up Python environment
   - Installs dependencies
   - Creates deployment package (zip)
   - Uploads package to S3
   - Creates new Elastic Beanstalk application version
   - Updates Elastic Beanstalk environment with the new version
   - Configures environment variables securely using GitHub Secrets

4. **Security Considerations**:
   - All sensitive data (AWS credentials, database passwords) stored as GitHub Secrets
   - Limited IAM permissions following principle of least privilege
   - Automated environment-specific configuration

### Required GitHub Secrets

The workflow requires these secrets:

- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`: AWS credentials
- `S3_BUCKET`: Frontend bucket name
- `EB_BUCKET`: Elastic Beanstalk deployment artifact bucket
- `APP_NAME` and `ENV_NAME`: Elastic Beanstalk application and environment names
- `DB_PASSWORD`: Database password

### Monitoring Deployments

Deployment progress can be monitored in the "Actions" tab of the GitHub repository.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
