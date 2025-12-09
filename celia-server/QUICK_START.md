# Quick Start Guide

Get your CELIA API server running in 5 minutes!

## Prerequisites Check

```bash
node --version  # Should be 18+
npm --version   # Should be 9+
```

## Installation Steps

### 1. Install Dependencies

```bash
cd celia-server
npm install
```

This will install all required packages including NestJS, Prisma, and other dependencies.

### 2. Set Up Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed initial data (categories, colleges)
npm run prisma:seed
```

### 3. Start the Server

```bash
# Development mode with hot reload
npm run start:dev
```

You should see:
```
╔═══════════════════════════════════════════════════════╗
║   🚀 CELIA API Server Started Successfully!          ║
║   🌐 Server:      http://localhost:3000              ║
║   📚 API Docs:    http://localhost:3000/api/docs     ║
╚═══════════════════════════════════════════════════════╝
```

## Test the API

### 1. Open Swagger Documentation

Navigate to: http://localhost:3000/api/docs

### 2. Register a Test User

Click on **POST /api/auth/register** → Try it out

```json
{
  "email": "test@stanford.edu",
  "password": "password123",
  "fullName": "Test User",
  "collegeName": "Stanford University",
  "major": "Computer Science",
  "graduationYear": 2025,
  "bio": "This is my test bio with more than fifty characters to pass validation requirements",
  "interests": ["Sports & Fitness", "Technology & Gaming", "Food & Cooking"],
  "preferredLocations": ["Stanford, CA"]
}
```

Click **Execute**

### 3. Copy Your Token

From the response, copy the `token` value.

### 4. Authorize Swagger

Click the **Authorize** button at the top of the page.

Enter: `Bearer YOUR_TOKEN_HERE`

Click **Authorize** then **Close**

### 5. Test Other Endpoints

Now you can test any endpoint! Try:
- GET /api/users - See all users
- GET /api/categories/events - Get event categories
- POST /api/events - Create an event

## Database Management

### View Data in Prisma Studio

```bash
npm run prisma:studio
```

This opens a GUI at http://localhost:5555 where you can:
- View all tables
- Edit data
- Run queries
- Inspect relationships

### Reset Database (if needed)

```bash
npx prisma migrate reset
npm run prisma:seed
```

## Common Commands

```bash
# Development
npm run start:dev      # Start with hot reload
npm run start:debug    # Start with debugger

# Production
npm run build          # Build for production
npm run start:prod     # Run production build

# Database
npm run prisma:generate    # Generate Prisma Client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open database GUI
npm run prisma:seed        # Seed database

# Code Quality
npm run lint           # Lint code
npm run format         # Format code with Prettier
npm run test           # Run tests
```

## Connecting from Mobile App

Update your mobile app's API configuration:

```typescript
const API_URL = 'http://localhost:3000/api';

// Or for physical device testing:
const API_URL = 'http://YOUR_LOCAL_IP:3000/api';
```

## Next Steps

1. ✅ Server is running
2. ✅ Database is set up
3. ✅ API documentation is available

Now you can:
- Test all endpoints via Swagger
- Connect your mobile app
- Start building features
- Add custom business logic

## Troubleshooting

### Port 3000 already in use?

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm run start:dev
```

### Database connection error?

Check your `.env` file has the correct `DATABASE_URL`.

### Prisma Client not generated?

```bash
npm run prisma:generate
```

### Need to reset everything?

```bash
rm -rf node_modules package-lock.json dist
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## Support

- 📚 Full Documentation: [README.md](./README.md)
- 🔗 API Reference: [API_ENDPOINTS.md](./API_ENDPOINTS.md)
- 🌐 Swagger UI: http://localhost:3000/api/docs
- 📧 Questions: support@celia.app

Happy coding! 🚀
