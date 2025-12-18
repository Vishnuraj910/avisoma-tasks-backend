# Tasks Backend API

A TypeScript Express API service for managing tasks with PostgreSQL database.

## Features

- RESTful API for task management
- PostgreSQL database with automatic schema initialization
- Health check endpoint
- Comprehensive test coverage
- Docker support with docker-compose

## Prerequisites

- Node.js 20+ (for local development)
- Docker and Docker Compose (for containerized deployment)

## Local Development

### Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```env
NODE_ENV=development
PORT=3000
DB_URL=postgresql://postgres:postgres@localhost:5432/avisoma_db
```

3. Start PostgreSQL (using Docker):
```bash
docker run -d \
  --name tasks-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=avisoma_db \
  -p 5432:5432 \
  postgres:16-alpine
```

4. Initialize the database schema:
```bash
psql -h localhost -U postgres -d avisoma_db -f db/schema.sql
```

5. Run the development server:
```bash
npm run dev
```

## Docker Deployment

### Using Docker Compose (Recommended)

1. Create a `.env` file (optional, defaults are provided):
```env
NODE_ENV=production
PORT=3000
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=avisoma_db
POSTGRES_PORT=5432
```

2. Build and start services:
```bash
docker-compose up -d
```

3. View logs:
```bash
docker-compose logs -f
```

4. Stop services:
```bash
docker-compose down
```

5. Stop and remove volumes (clean slate):
```bash
docker-compose down -v
```

### Using Docker Only

1. Build the image:
```bash
docker build -t tasks-backend .
```

2. Start PostgreSQL:
```bash
docker run -d \
  --name tasks-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=avisoma_db \
  -p 5432:5432 \
  -v $(pwd)/db/schema.sql:/docker-entrypoint-initdb.d/schema.sql \
  postgres:16-alpine
```

3. Run the application:
```bash
docker run -d \
  --name tasks-backend \
  --link tasks-postgres:postgres \
  -e DB_URL=postgresql://postgres:postgres@postgres:5432/avisoma_db \
  -p 3000:3000 \
  tasks-backend
```

## API Endpoints

### Health Check
- `GET /health` - Check API and database health

### Tasks
- `POST /api/tasks` - Create a new task
  - Body: `{ "title": "string", "description": "string" (optional) }`
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get a single task
- `PATCH /api/tasks/:id` - Update task status
  - Body: `{ "status": "pending" | "in-progress" | "completed" }`
- `DELETE /api/tasks/:id` - Soft delete a task

## Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Environment Variables

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `DB_URL` - PostgreSQL connection string
- `POSTGRES_USER` - PostgreSQL username (default: postgres)
- `POSTGRES_PASSWORD` - PostgreSQL password (default: postgres)
- `POSTGRES_DB` - PostgreSQL database name (default: avisoma_db)
- `POSTGRES_PORT` - PostgreSQL port (default: 5432)

## Project Structure

```
tasks-backend/
├── src/
│   ├── app.ts              # Express app configuration
│   ├── server.ts           # Server entry point
│   ├── routes/
│   │   └── tasks.ts        # Task routes
│   ├── models/
│   │   ├── tasks.ts        # Task model
│   │   └── enums.ts        # Enums
│   ├── utils/
│   │   └── db.ts           # Database utilities
│   └── __tests__/          # Test files
├── db/
│   └── schema.sql          # Database schema
├── Dockerfile              # Docker image definition
├── docker-compose.yml      # Docker Compose configuration
└── package.json
```
