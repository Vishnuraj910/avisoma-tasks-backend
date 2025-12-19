# Tasks Backend API

A TypeScript Express API service for managing tasks with PostgreSQL database.

Frontend Application available [here](https://github.com/Vishnuraj910/avisoma-tasks-frontend)

POSTMAN Collection is available [here](https://github.com/Vishnuraj910/avisoma-tasks-backend/tree/b8cca9e69fe26dabf8a2be12c3e52ad84d00166b/postman)

## Screenshots
<img width="977" height="856" alt="Screenshot 2025-12-19 at 5 26 02 PM" src="https://github.com/user-attachments/assets/d8a17b45-9878-46b0-ad6f-c9e50ff5081d" />
<img width="977" height="856" alt="Screenshot 2025-12-19 at 5 41 49 PM" src="https://github.com/user-attachments/assets/3caf106c-d4ac-451a-a7c3-86340c507ea5" />

## Features

- RESTful API for task management
- PostgreSQL database with automatic schema initialization
- Health check endpoint
- Comprehensive test coverage
- Docker support with docker-compose
- Updated at value is updated via DB trigger
- Prisma ORM for database interactions (default)
- Option to switch to native PostgreSQL driver (`pg`)

## Prerequisites

- Node.js 20+ (for local development)
- Docker and Docker Compose (for containerized deployment)

## Local Development

### Setup

1. Install dependencies:
```bash
npm install
# or
bun install
```

2. Create a `.env` file:
```env
NODE_ENV=development
PORT=3000
DB_URL=postgresql://postgres:postgres@localhost:5432/avisoma_db
API_KEY=your-secret-api-key-here
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

5. Generate Prisma Client:
```bash
npx prisma generate
```

6. Run the development server:
```bash
npm run dev
# or
bun dev
```

### Building for Production

1. Build the project:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
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
API_KEY=your-secret-api-key-here
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

### Authentication

All API endpoints (except `/health`) require authentication via API key. Include the API key in the `Authorization` header:

```
Authorization: Bearer your-api-key
```

or

```
Authorization: your-api-key
```

### Health Check
- `GET /health` - Check API and database health (no authentication required)

### Tasks
- `POST /api/tasks` - Create a new task
  - Body: `{ "title": "string", "description": "string" (optional) }`
  - Requires: API key in Authorization header
- `GET /api/tasks` - Get all tasks (excludes soft-deleted tasks)
  - Requires: API key in Authorization header
- `GET /api/tasks/:id` - Get a single task (returns 404 if soft-deleted)
  - Requires: API key in Authorization header
- `PATCH /api/tasks/:id` - Update task status
  - Body: `{ "status": "pending" | "in_progress" | "completed" }`
  - Requires: API key in Authorization header
- `DELETE /api/tasks/:id` - Soft delete a task
  - Requires: API key in Authorization header

## Testing

Run tests:
```bash
npm test
# or
bun test
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
- `API_KEY` - API key for authentication (required for all endpoints except `/health`)

## Project Structure

```
tasks-backend/
├── db/
│   └── schema.sql          # Database schema
├── postman/
│   └── ...                 # Postman collection
├── prisma/
│   ├── migrations/         # Database migrations
│   └── schema.prisma       # Prisma schema
├── src/
│   ├── app.ts              # Express app configuration
│   ├── server.ts           # Server entry point
│   ├── controllers/
│   │   └── tasks.controller.ts # Task controllers
│   ├── generated/          # Generated types (Prisma)
│   ├── middleware/
│   │   └── auth.ts         # Authentication middleware
│   ├── models/
│   │   ├── enums.ts        # Enums
│   │   └── tasks.model.ts  # Task model
│   ├── routes/
│   │   └── tasks.route.ts  # Task routes
│   ├── services/
│   │   ├── tasks.prisma.service.ts # Task services (Prisma)
│   │   └── tasks.service.ts    # Task services (Native pg)
│   ├── utils/
│   │   ├── db.ts           # Database utilities (pg)
│   │   └── prisma.ts       # Prisma client instance
│   └── __tests__/          # Test files
├── Dockerfile              # Docker image definition
├── docker-compose.yml      # Docker Compose configuration
├── package.json
└── tsconfig.json
```

## Database & ORM

This project uses **Prisma** as the default ORM. The schema is defined in `prisma/schema.prisma`.

### Switching to Native PostgreSQL Driver (pg)

The project also includes a native `pg` driver implementation for tasks services. If you prefer to use the native driver instead of Prisma, follow these steps:

1.  Open `src/controllers/tasks.controller.ts`.
2.  Locate the import statement for task services (around line 5).
3.  Change the import path from `../services/tasks.prisma.service.js` to `../services/tasks.service.js`.

**Current (Prisma):**
```typescript
import {
  createTaskService,
  // ...
} from "../services/tasks.prisma.service.js";
```

**Switch to Native pg:**
```typescript
import {
  createTaskService,
  // ...
} from "../services/tasks.service.js";
```

The service interfaces are identical, so no other code changes are required.
