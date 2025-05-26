# My Microservice Project

## Overview
This is a microservices-based backend system built with NestJS, PostgreSQL, Redis, and RabbitMQ. The system is designed to be scalable, modular, and easy to maintain.

## Project Structure
```
.
├── apps/                    # Application modules
│   ├── api-gateway/         # API Gateway service
│   ├── user-service/        # User management service
│   └── product-service/     # Product management service
├── libs/                    # Shared libraries
│   ├── database/            # Database connection and entities
│   ├── authentication/      # Authentication utilities
│   ├── redis/               # Redis utilities
│   └── rmq/                 # RabbitMQ utilities
├── shared/                  # Shared resources
├── templates/               # Template files
└── docs/                    # Documentation
```

## Prerequisites
- Node.js (v18.x or higher)
- npm (v9.x or higher)
- Docker and Docker Compose (for containerized deployment)
- PostgreSQL (v14 or higher)
- Redis (v6 or higher)
- RabbitMQ (v3.9 or higher)

## Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/my-microservice-project.git
```

2. Navigate to project directory
```bash
cd my-microservice-project
```

3. Install dependencies
```bash
npm install
```

4. Set up environment variables
```bash
cp .env.template .env
```
Then update the .env file with your configuration values.

## Development

### Available Scripts

```bash
# Start development server with hot-reload
npm run start:dev

# Start a specific service
npm run start:user
npm run start:product

# Build the application
npm run build

# Run linting
npm run lint

# Format code
npm run format

# Run tests
npm run test
npm run test:watch
npm run test:cov
npm run test:e2e
```

### Database Migrations

#### Platform Database
```bash
# Generate migration
npm run migration:platform:generate

# Run migration
npm run migration:platform:run

# Revert migration
npm run migration:platform:revert
```

## Docker Setup

The project includes Docker configuration for easy deployment. To run the service using Docker:

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

## Environment Variables

### Core Configuration
- `NODE_ENV`: Environment (development/production)
- `PORT`: Service port
- `HOST`: Service host

### Database Configuration
- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASS`: Database password
- `DB_SSL`: Database SSL configuration

### Redis Configuration
- `REDIS_DB_HOST`: Redis database host
- `REDIS_DB_PORT`: Redis database port
- `REDIS_DB_ACCESS_KEY`: Redis access key

### Authentication
- `JWT_SECRET`: JWT secret key
- `JWT_REFRESH_SECRET`: JWT refresh secret key

### Message Queue
- `RABBIT_MQ_URI`: RabbitMQ connection URI

## Testing

The project uses Jest for testing. Different types of tests are available:

- Unit tests: `npm run test`
- Watch mode: `npm run test:watch`
- Coverage report: `npm run test:cov`
- E2E tests: `npm run test:e2e`

## Architecture

### Microservices
The platform consists of three core microservices:

1. **API Gateway**
   - Serves as the single entry point for all client requests
   - Handles authentication and authorization
   - Manages request routing to appropriate services

2. **User Service**
   - Manages user-related functionality
   - Handles authentication and authorization
   - User profile management
   - Role-based access control

3. **Product Service**
   - Manages product-related functionality
   - Product catalog management
   - Inventory management
   - Product search and filtering

### Communication
- **Synchronous**: REST API for direct service-to-service communication
- **Asynchronous**: RabbitMQ for event-driven communication

### Data Storage
- **PostgreSQL**: Primary data store for structured data
- **Redis**: Cache for frequently accessed data and session management

## License
This project is proprietary and confidential. 