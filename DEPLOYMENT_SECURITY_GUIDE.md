# CELIA - Deployment & Security Guide

## 🔒 Security Best Practices

### 1. Authentication & Authorization

#### Password Security
```typescript
// Backend: Use bcrypt with 12 rounds
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

async hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

#### JWT Configuration
```typescript
// Use strong secrets (minimum 256 bits)
JWT_SECRET="generate-with-openssl-rand-base64-32"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"

// Implement refresh token rotation
async refreshToken(userId: string): Promise<{ accessToken: string }> {
  const payload = { sub: userId, type: 'access' };
  return {
    accessToken: this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    }),
  };
}
```

#### Row Level Security (RLS) Verification

**Test RLS Policies**:
```sql
-- Test as unauthenticated user
SET ROLE anon;
SELECT * FROM profiles; -- Should return nothing

-- Test as authenticated user
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-uuid-here';
SELECT * FROM profiles WHERE id = 'user-uuid-here'; -- Should work
SELECT * FROM profiles WHERE id = 'other-user-uuid'; -- Should return nothing for private data
```

### 2. Input Validation

#### Backend DTOs
```typescript
import { IsEmail, IsString, MinLength, MaxLength, IsInt, Min, Max, IsArray, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string;

  @IsInt()
  @Min(18)
  @Max(100)
  age?: number;

  @IsEnum(['male', 'female', 'non-binary', 'prefer-not-to-say'])
  gender?: string;

  @IsArray()
  @MaxLength(500, { each: true })
  interests?: string[];
}
```

#### Sanitize User Input
```typescript
import * as sanitizeHtml from 'sanitize-html';

function sanitizeUserInput(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [], // No HTML allowed
    allowedAttributes: {},
  });
}
```

### 3. Rate Limiting

#### Backend Rate Limiting
```typescript
// Install: npm install @nestjs/throttler

// app.module.ts
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60, // Time window in seconds
      limit: 100, // Max requests per TTL
    }),
  ],
})
export class AppModule {}

// Apply to specific endpoints
@UseGuards(ThrottlerGuard)
@Throttle(10, 60) // 10 requests per 60 seconds
@Post('send-invitation')
async sendInvitation() {
  // ...
}
```

#### Frontend Rate Limiting
```typescript
// lib/rateLimiter.ts
class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  canMakeRequest(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];

    // Filter out old requests
    const recentRequests = requests.filter((time) => now - time < windowMs);

    if (recentRequests.length >= maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(key, recentRequests);
    return true;
  }
}

export const rateLimiter = new RateLimiter();

// Usage
if (!rateLimiter.canMakeRequest('send-pulse', 5, 60000)) {
  Alert.alert('Slow down', 'Please wait before sending more pulses');
  return;
}
```

### 4. Data Privacy

#### Hide Sensitive Information
```typescript
// Backend: Create DTOs for responses
export class PublicUserDto {
  id: string;
  fullName: string;
  avatarUrl: string;
  collegeName: string;
  interests: string[];
  attractivenessScore: number;
  // Email NOT included
}

// Use class-transformer to exclude fields
import { Exclude } from 'class-transformer';

export class User {
  id: string;
  email: string;

  @Exclude()
  password: string;

  @Exclude()
  passwordResetToken: string;
}
```

#### Implement Block/Report
```typescript
// Add to schema
model BlockedUser {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  blockedId   String   @map("blocked_id")
  reason      String?
  createdAt   DateTime @default(now()) @map("created_at")

  user    User @relation("UserBlocks", fields: [userId], references: [id])
  blocked User @relation("BlockedBy", fields: [blockedId], references: [id])

  @@unique([userId, blockedId])
  @@map("blocked_users")
}

// Filter blocked users from suggestions
async getSmartSuggestions(userId: string) {
  const blocked = await this.prisma.blockedUser.findMany({
    where: { userId },
    select: { blockedId: true },
  });

  const blockedIds = blocked.map((b) => b.blockedId);

  return this.prisma.user.findMany({
    where: {
      id: { notIn: [userId, ...blockedIds] },
    },
  });
}
```

### 5. SQL Injection Prevention

**Use Prisma/Supabase** (parameterized queries by default):
```typescript
// ✅ Safe - Prisma uses parameterized queries
await prisma.user.findMany({
  where: { fullName: { contains: userInput } },
});

// ✅ Safe - Supabase client uses parameterized queries
const { data } = await supabase
  .from('profiles')
  .select('*')
  .ilike('full_name', `%${userInput}%`);

// ❌ NEVER do raw SQL with user input
await prisma.$queryRaw`SELECT * FROM users WHERE name = ${userInput}`; // Vulnerable!
```

### 6. XSS Prevention

#### Frontend
```typescript
// React Native Text components automatically escape
<Text>{userGeneratedContent}</Text> // Safe

// For WebView, sanitize HTML
import { WebView } from 'react-native-webview';

<WebView
  source={{ html: sanitizeHtml(userHtml) }}
  javaScriptEnabled={false} // Disable JS if not needed
/>
```

### 7. Secure File Uploads

```typescript
// Backend: Validate file types and sizes
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

const imageFilter = (req, file, callback) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
    return callback(new Error('Only image files are allowed!'), false);
  }
  callback(null, true);
};

@Post('upload')
@UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueName}-${file.originalname}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: imageFilter,
  })
)
async uploadFile(@UploadedFile() file: Express.Multer.File) {
  return { url: `/uploads/${file.filename}` };
}
```

### 8. CORS Configuration

```typescript
// main.ts
app.enableCors({
  origin: [
    'http://localhost:19006', // Expo web dev
    'https://your-production-domain.com',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
});
```

---

## 🚀 Deployment Guide

### 1. Backend Deployment (Railway)

#### Step 1: Prepare Backend
```bash
cd celia-server

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Build
npm run build
```

#### Step 2: Configure Railway
1. Go to https://railway.app
2. Create new project
3. Connect GitHub repository
4. Add PostgreSQL database (Railway provides one-click)
5. Set environment variables:

```bash
DATABASE_URL=<provided-by-railway>
JWT_SECRET=<generate-strong-secret>
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=production
```

#### Step 3: Configure Prisma
```bash
# In railway, run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

#### Step 4: Deploy
```bash
# Railway auto-deploys on git push
git push origin main
```

### 2. Supabase Setup

#### Step 1: Create Project
1. Go to https://supabase.com
2. Create new project
3. Note your credentials:
   - Project URL
   - Anon/Public Key
   - Service Role Key

#### Step 2: Run Migrations
```bash
cd celia-client

# Install Supabase CLI
npm install -g supabase

# Link project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

#### Step 3: Configure RLS
- All RLS policies are in the migration
- Test using SQL Editor in Supabase dashboard

#### Step 4: Enable Auth
1. Go to Authentication → Settings
2. Configure email templates
3. Set Site URL to your app URL
4. Disable email confirmation for development (enable for production)

### 3. Frontend Deployment (Expo/EAS)

#### Step 1: Configure EAS
```bash
cd celia-client

# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure project
eas build:configure
```

#### Step 2: Update Environment Variables
```bash
# .env.production
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_API_URL=https://your-backend.railway.app
```

#### Step 3: Build for iOS
```bash
# Development build
eas build --platform ios --profile development

# Production build
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

#### Step 4: Build for Android
```bash
# Development build
eas build --platform android --profile development

# Production build
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

#### Step 5: Over-the-Air (OTA) Updates
```bash
# Publish update without rebuilding
eas update --branch production --message "Fixed minor bugs"
```

### 4. Monitoring & Analytics

#### Backend Monitoring (Sentry)
```bash
npm install @sentry/node @sentry/tracing
```

```typescript
// main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

#### Frontend Monitoring (Sentry)
```bash
npm install @sentry/react-native
```

```typescript
// App.tsx
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enableInExpoDevelopment: false,
  debug: __DEV__,
});
```

#### Analytics (PostHog)
```bash
npm install posthog-react-native
```

```typescript
// lib/analytics.ts
import PostHog from 'posthog-react-native';

export const analytics = new PostHog(
  'your-api-key',
  { host: 'https://app.posthog.com' }
);

// Track events
analytics.capture('user_signed_up');
analytics.capture('event_created', { event_type: 'social' });
```

---

## 📊 Performance Optimization

### 1. Database Indexing

Verify all indexes are created:
```sql
-- Check existing indexes
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### 2. Query Optimization

```typescript
// ✅ Efficient: Use select to limit fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    fullName: true,
    avatarUrl: true,
    // Only fields you need
  },
});

// ❌ Inefficient: Fetching all fields
const users = await prisma.user.findMany();

// ✅ Use pagination
const users = await prisma.user.findMany({
  skip: (page - 1) * limit,
  take: limit,
});
```

### 3. Caching (Redis - Optional)

```typescript
// Install: npm install @nestjs/cache-manager cache-manager-redis-store

import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      ttl: 600, // 10 minutes
    }),
  ],
})
export class AppModule {}

// Use in service
@Injectable()
export class UsersService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async findOne(id: string) {
    const cacheKey = `user:${id}`;
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) return cached;

    const user = await this.prisma.user.findUnique({ where: { id } });
    await this.cacheManager.set(cacheKey, user, { ttl: 600 });

    return user;
  }
}
```

### 4. Image Optimization

```typescript
// Use CDN for images
// Frontend: Use react-native-fast-image
import FastImage from 'react-native-fast-image';

<FastImage
  source={{ uri: imageUrl, priority: FastImage.priority.normal }}
  style={styles.image}
  resizeMode={FastImage.resizeMode.cover}
/>

// Backend: Resize images on upload
import * as sharp from 'sharp';

async processImage(file: Express.Multer.File) {
  const resized = await sharp(file.path)
    .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  // Upload to S3/Cloudinary/Supabase Storage
  return uploadedUrl;
}
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. RLS Policy Blocking Queries
```sql
-- Temporarily disable RLS for testing
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- Check active policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Test as specific user
SET request.jwt.claim.sub = 'user-uuid';
```

#### 2. Migration Conflicts
```bash
# Reset database (development only!)
npx prisma migrate reset

# For Supabase
supabase db reset
```

#### 3. CORS Errors
```typescript
// Backend: Enable CORS for all origins (development only!)
app.enableCors({
  origin: '*',
  credentials: true,
});
```

#### 4. Build Failures (Expo)
```bash
# Clear cache
expo start -c

# Rebuild node_modules
rm -rf node_modules
npm install

# Clear EAS build cache
eas build --clear-cache
```

---

## ✅ Production Checklist

- [ ] Environment variables set in production
- [ ] Database migrations applied
- [ ] RLS policies enabled and tested
- [ ] Rate limiting configured
- [ ] CORS configured correctly
- [ ] HTTPS enabled (SSL certificates)
- [ ] Error monitoring setup (Sentry)
- [ ] Analytics tracking implemented
- [ ] Backup strategy for database
- [ ] Email templates configured
- [ ] Password reset flow tested
- [ ] File upload limits enforced
- [ ] API documentation generated
- [ ] Load testing performed
- [ ] Security audit completed
- [ ] Privacy policy and terms of service added
- [ ] App store listings created
- [ ] Push notifications configured (optional)

---

## 📞 Support & Resources

- **Supabase Docs**: https://supabase.com/docs
- **NestJS Docs**: https://docs.nestjs.com
- **Expo Docs**: https://docs.expo.dev
- **Prisma Docs**: https://www.prisma.io/docs
- **Railway Docs**: https://docs.railway.app

---

This guide ensures your application is secure, performant, and production-ready. Follow each section carefully and test thoroughly before launching to users.
