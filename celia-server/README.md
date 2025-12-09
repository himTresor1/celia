# CELIA API Server

Backend API for CELIA - A college event management platform built with NestJS, Prisma, and PostgreSQL (Neon DB).

## Features

- **Authentication & Authorization**: JWT-based authentication with secure password hashing
- **User Management**: Profile management with photos, interests, and college information
- **Event Management**: Create, update, delete events with rich details
- **Invitation System**: Send single or bulk invitations to events
- **Attendance Tracking**: Join/leave events and track attendees
- **Search & Filtering**: Search users, events, filter by categories
- **Real-time Updates**: Optimized queries with proper indexing
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Rate Limiting**: Protection against abuse
- **Data Validation**: Strong validation using class-validator

## Tech Stack

- **Framework**: NestJS 10.x
- **Database**: PostgreSQL (Neon DB)
- **ORM**: Prisma 5.x
- **Authentication**: JWT + bcrypt
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator, class-transformer
- **Language**: TypeScript

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Neon DB recommended)
- Git

## Installation

### 1. Clone and Install

```bash
# Navigate to the server directory
cd celia-server

# Install dependencies
npm install
```

### 2. Environment Configuration

The `.env` file is already configured with your Neon DB connection. Update if needed:

```env
DATABASE_URL="your-neon-db-connection-string"
JWT_SECRET="your-secret-key"
JWT_EXPIRATION="7d"
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:8081"
```

### 3. Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with initial data
npm run prisma:seed
```

### 4. Start Development Server

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The server will start on http://localhost:3000

## API Documentation

Once the server is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:3000/api/docs

The documentation includes:
- All available endpoints
- Request/response schemas
- Authentication requirements
- Try-it-out functionality

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (with filters)
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user profile
- `GET /api/users/:id/stats` - Get user statistics
- `GET /api/users/:id/events` - Get user's events

### Events
- `POST /api/events` - Create event
- `GET /api/events` - Get all accessible events
- `GET /api/events/:id` - Get event details
- `PATCH /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/join` - Join event
- `DELETE /api/events/:id/leave` - Leave event
- `GET /api/events/:id/attendees` - Get event attendees

### Invitations
- `POST /api/invitations` - Send single invitation
- `POST /api/invitations/bulk` - Send bulk invitations
- `GET /api/invitations/my` - Get my invitations
- `GET /api/invitations/event/:eventId` - Get event invitations
- `PATCH /api/invitations/:id` - Update invitation status
- `DELETE /api/invitations/:id` - Delete invitation

### Categories
- `GET /api/categories/events` - Get event categories
- `GET /api/categories/interests` - Get interest categories
- `GET /api/categories/colleges` - Get colleges

## Database Schema

### Core Models

**User**
- Profile information (name, email, college, major, etc.)
- Photos and avatar
- Interests and preferred locations
- Profile completion status

**Event**
- Event details (name, description, location)
- Date and time
- Category and interest tags
- Capacity limits
- Status (draft, active, cancelled, completed)

**EventInvitation**
- Links events and users
- Status tracking (pending, going, declined)
- Personal messages

**EventAttendee**
- Tracks confirmed attendees
- Join timestamps

**EventCategory, InterestCategory, College**
- Reference data for dropdowns and filters

## Database Management

```bash
# View database in Prisma Studio
npm run prisma:studio

# Create a new migration
npm run prisma:migrate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Generate Prisma Client after schema changes
npm run prisma:generate
```

## Development

### Project Structure

```
src/
├── auth/           # Authentication module
├── users/          # User management
├── events/         # Event management
├── invitations/    # Invitation system
├── categories/     # Reference data
├── prisma/         # Prisma service
├── common/         # Shared utilities
│   ├── decorators/ # Custom decorators
│   ├── filters/    # Exception filters
│   └── interceptors/ # Response interceptors
├── app.module.ts   # Root module
└── main.ts         # Application entry point
```

### Adding New Features

1. Generate a new module:
```bash
nest generate module feature-name
nest generate service feature-name
nest generate controller feature-name
```

2. Update Prisma schema if needed:
```prisma
// Add to prisma/schema.prisma
model NewModel {
  id String @id @default(uuid())
  // fields...
}
```

3. Run migration:
```bash
npm run prisma:migrate
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Security

- **Password Hashing**: bcrypt with salt rounds of 10
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: 100 requests per minute
- **Input Validation**: All inputs validated with class-validator
- **CORS**: Configurable origins
- **SQL Injection**: Protected by Prisma ORM

## Performance

- **Database Indexes**: Optimized queries with strategic indexes
- **Connection Pooling**: Prisma connection pooling enabled
- **Pagination**: Ready for pagination implementation
- **Caching**: Ready for Redis integration

## Deployment

### Deploy to Railway

1. Push code to GitHub
2. Connect repository to Railway
3. Add environment variables
4. Railway auto-deploys

### Deploy to Render

1. Create Web Service
2. Connect GitHub repository
3. Configure:
   - Build: `npm install && npx prisma generate && npm run build`
   - Start: `npx prisma migrate deploy && npm run start:prod`
4. Add environment variables

### Deploy to Heroku

```bash
heroku create celia-api
heroku addons:create heroku-postgresql
git push heroku main
heroku run npx prisma migrate deploy
```

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | - |
| JWT_SECRET | Secret key for JWT signing | - |
| JWT_EXPIRATION | Token expiration time | 7d |
| PORT | Server port | 3000 |
| NODE_ENV | Environment (development/production) | development |
| CORS_ORIGIN | Allowed CORS origins | * |

## Troubleshooting

### Database Connection Issues

```bash
# Test database connection
npx prisma db pull

# Check migrations status
npx prisma migrate status
```

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
PORT=3001 npm run start:dev
```

### Prisma Client Issues

```bash
# Regenerate Prisma Client
npm run prisma:generate

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Submit pull request

## Support

For issues and questions:
- GitHub Issues: [github.com/celia/issues]
- Email: support@celia.app
- Documentation: http://localhost:3000/api/docs

## License

MIT License - see LICENSE file for details

## Changelog

### v1.0.0 (2024-12-09)
- Initial release
- User authentication and profiles
- Event management
- Invitation system
- Full API documentation
