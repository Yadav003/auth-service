# Auth Service - Authentication Microservice

Production-ready authentication microservice for multi-tenant applications. Built with Node.js, Express, MongoDB, and JWT.

## Project Structure

```
auth-service/
├── src/
│   ├── config/              # Configuration (DB, environment)
│   ├── controllers/         # Request/response handlers (no business logic)
│   ├── services/            # Business logic layer
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API route definitions
│   ├── middlewares/         # Express middlewares (auth, error, logging)
│   ├── utils/               # Helper utilities (JWT, password, token)
│   └── validators/          # Request validation schemas (Joi)
├── server.js                # Application entry point
├── app.js                   # Express app initialization
├── package.json             # Dependencies & scripts
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
└── README.md                # This file
```

## Architecture Principles

- **Clean Architecture**: Separation of concerns with clear layer boundaries
- **No Business Logic in Controllers**: Controllers only handle HTTP request/response
- **Centralized Error Handling**: Global error handler middleware
- **Security First**: Helmet, CORS, rate limiting, password hashing
- **Environment-Based Configuration**: All secrets via environment variables
- **ES Modules**: Modern JavaScript with import/export syntax
- **Async/Await**: Promise-based async operations

## Tech Stack

- **Runtime**: Node.js (LTS)
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: Joi
- **Security**: Helmet, CORS, express-rate-limit
- **Environment**: dotenv

## Installation

```bash
# Install dependencies
npm install

# Create .env file from template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

## Running the Service

```bash
# Development (with hot reload)
npm run dev

# Production
npm start

# Linting
npm run lint

# Testing
npm test
```

## API Endpoints (Planned)

### Health Check
- `GET /health` - Service health status
- `GET /api/v1/auth/status` - Auth service status

### Authentication (To be implemented)
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/validate` - Validate token (for other services)

### Password Management (To be implemented)
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token

## Environment Variables

See `.env.example` for all required and optional variables.

### Required
- `PORT` - Server port
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_ACCESS_SECRET` - Secret for access tokens
- `JWT_REFRESH_SECRET` - Secret for refresh tokens

### Optional
- `JWT_ACCESS_EXPIRY` - Access token expiry (default: 15m)
- `JWT_REFRESH_EXPIRY` - Refresh token expiry (default: 7d)
- `BCRYPT_ROUNDS` - Bcrypt hashing rounds (default: 10)
- `RATE_LIMIT_WINDOW_MS` - Rate limit window (default: 900000ms)
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window (default: 100)

## Development Roadmap

- [ ] Implement user registration with email verification
- [ ] Implement login with JWT tokens
- [ ] Implement refresh token mechanism
- [ ] Implement RBAC (Role-Based Access Control)
- [ ] Implement password reset flow
- [ ] Implement rate limiting
- [ ] Implement request validation
- [ ] Add comprehensive error handling
- [ ] Add request logging
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Add API documentation (Swagger/OpenAPI)
- [ ] Add database migrations
- [ ] Add monitoring and alerting

## Security Considerations

- All secrets stored in environment variables (never committed)
- Passwords hashed with bcrypt (never stored in plain text)
- JWT tokens with expiry to minimize token hijacking impact
- Refresh tokens for long-lived sessions
- Rate limiting to prevent brute force attacks
- Helmet for HTTP header security
- CORS for controlled cross-origin access
- Input validation on all endpoints
- SQL injection protection via Mongoose
- HTTPS enforced in production

## Error Handling

The service implements centralized error handling with standardized error responses:

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Descriptive error message"
}
```

## Logging

Logs are written to console in development and to files in production (with Winston/Pino).

## Contributing

[Add contribution guidelines]

## License

MIT

---

**Note**: This is a scaffold with placeholder implementations. Full implementation will be added in phases.
