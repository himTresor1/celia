# CELIA Backend - NestJS + Prisma + Neon DB Setup Guide

Complete guide to create a production-ready backend for the CELIA event management app using NestJS, Prisma, and Neon DB (PostgreSQL).

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Database Setup (Neon)](#database-setup-neon)
- [Prisma Configuration](#prisma-configuration)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Authentication Setup](#authentication-setup)
- [API Modules](#api-modules)
- [API Endpoints](#api-endpoints)
- [Security & Best Practices](#security--best-practices)
- [Deployment](#deployment)

---

## Prerequisites

- Node.js 18+ and npm
- Git
- A Neon account (free tier available)
- Basic knowledge of TypeScript

---

## Project Setup

### 1. Create NestJS Project

```bash
# Install NestJS CLI globally
npm install -g @nestjs/cli

# Create new project
nest new celia-backend

# Navigate to project
cd celia-backend

# Install required dependencies
npm install @prisma/client
npm install -D prisma

# Install additional dependencies
npm install @nestjs/passport passport passport-jwt
npm install @nestjs/jwt bcrypt
npm install class-validator class-transformer
npm install @nestjs/config
npm install @nestjs/throttler

# Install types
npm install -D @types/passport-jwt @types/bcrypt
```

---

## Database Setup (Neon)

### 1. Create Neon Database

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project: `celia-app`
3. Select region closest to your users
4. Copy the connection string (it looks like this):
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

### 2. Environment Variables

Create `.env` file in root:

```env
# Database
DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRATION="7d"

# App
PORT=3000
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:8081"
```

Create `.env.example` for reference (without sensitive data):

```env
DATABASE_URL=""
JWT_SECRET=""
JWT_EXPIRATION="7d"
PORT=3000
NODE_ENV="development"
CORS_ORIGIN=""
```

---

## Prisma Configuration

### 1. Initialize Prisma

```bash
npx prisma init
```

### 2. Update `prisma/schema.prisma`

Replace the content with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                String   @id @default(uuid())
  email             String   @unique
  password          String
  fullName          String   @map("full_name")
  collegeName       String?  @map("college_name")
  major             String?
  graduationYear    Int?     @map("graduation_year")
  bio               String   @default("")
  avatarUrl         String?  @map("avatar_url")
  photoUrls         Json     @default("[]") @map("photo_urls")
  interests         String[] @default([])
  collegeVerified   Boolean  @default(false) @map("college_verified")
  preferredLocations String[] @default([]) @map("preferred_locations")
  profileCompleted  Boolean  @default(false) @map("profile_completed")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  hostedEvents       Event[]            @relation("HostedEvents")
  sentInvitations    EventInvitation[]  @relation("SentInvitations")
  receivedInvitations EventInvitation[] @relation("ReceivedInvitations")
  eventAttendances   EventAttendee[]

  @@map("profiles")
}

model Event {
  id                String    @id @default(uuid())
  hostId            String    @map("host_id")
  name              String
  description       String?
  categoryId        String?   @map("category_id")
  locationName      String?   @map("location_name")
  locationLat       Float?    @map("location_lat")
  locationLng       Float?    @map("location_lng")
  eventDate         DateTime? @map("event_date") @db.Date
  startTime         DateTime? @map("start_time")
  endTime           DateTime? @map("end_time")
  photoUrls         Json      @default("[]") @map("photo_urls")
  interestTags      String[]  @default([]) @map("interest_tags")
  capacityLimit     Int?      @map("capacity_limit")
  isPublic          Boolean   @default(true) @map("is_public")
  status            String    @default("draft")
  cancellationReason String?  @map("cancellation_reason")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  host         User              @relation("HostedEvents", fields: [hostId], references: [id], onDelete: Cascade)
  category     EventCategory?    @relation(fields: [categoryId], references: [id])
  invitations  EventInvitation[]
  attendees    EventAttendee[]

  @@map("events")
}

model EventCategory {
  id        String   @id @default(uuid())
  name      String   @unique
  icon      String?
  createdAt DateTime @default(now()) @map("created_at")

  events Event[]

  @@map("event_categories")
}

model EventInvitation {
  id              String    @id @default(uuid())
  eventId         String    @map("event_id")
  inviterId       String    @map("inviter_id")
  inviteeId       String    @map("invitee_id")
  status          String    @default("pending")
  personalMessage String?   @map("personal_message")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  event    Event @relation(fields: [eventId], references: [id], onDelete: Cascade)
  inviter  User  @relation("SentInvitations", fields: [inviterId], references: [id], onDelete: Cascade)
  invitee  User  @relation("ReceivedInvitations", fields: [inviteeId], references: [id], onDelete: Cascade)

  @@unique([eventId, inviteeId])
  @@map("event_invitations")
}

model EventAttendee {
  id       String   @id @default(uuid())
  eventId  String   @map("event_id")
  userId   String   @map("user_id")
  joinedAt DateTime @default(now()) @map("joined_at")

  event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([eventId, userId])
  @@map("event_attendees")
}

model InterestCategory {
  id        String   @id @default(uuid())
  name      String   @unique
  createdAt DateTime @default(now()) @map("created_at")

  @@map("interest_categories")
}

model College {
  id        String   @id @default(uuid())
  name      String   @unique
  domain    String?
  location  String?
  createdAt DateTime @default(now()) @map("created_at")

  @@map("colleges")
}
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Create and Run Migrations

```bash
# Create migration
npx prisma migrate dev --name init

# If you need to reset database
npx prisma migrate reset
```

### 5. Seed Database (Optional)

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed Event Categories
  const categories = [
    { name: 'Study Session', icon: 'book' },
    { name: 'Party', icon: 'music' },
    { name: 'Sports & Fitness', icon: 'dumbbell' },
    { name: 'Food & Dining', icon: 'utensils' },
    { name: 'Outdoor Activity', icon: 'tree' },
    { name: 'Gaming', icon: 'gamepad' },
    { name: 'Movie Night', icon: 'film' },
    { name: 'Concert', icon: 'music' },
    { name: 'Networking', icon: 'users' },
    { name: 'Workshop', icon: 'briefcase' },
    { name: 'Volunteer', icon: 'heart' },
    { name: 'Social Gathering', icon: 'coffee' },
  ];

  for (const category of categories) {
    await prisma.eventCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  // Seed Interest Categories
  const interests = [
    'Sports & Fitness',
    'Arts & Music',
    'Technology & Gaming',
    'Food & Cooking',
    'Travel & Adventure',
    'Reading & Writing',
    'Movies & TV',
    'Business & Entrepreneurship',
    'Science & Research',
    'Social Justice & Activism',
    'Photography & Design',
    'Dance & Theater',
    'Outdoor Activities',
    'Volunteering',
    'Fashion & Beauty',
  ];

  for (const interest of interests) {
    await prisma.interestCategory.upsert({
      where: { name: interest },
      update: {},
      create: { name: interest },
    });
  }

  // Seed Colleges
  const colleges = [
    { name: 'Stanford University', domain: 'stanford.edu', location: 'Stanford, CA' },
    { name: 'Harvard University', domain: 'harvard.edu', location: 'Cambridge, MA' },
    { name: 'MIT', domain: 'mit.edu', location: 'Cambridge, MA' },
    { name: 'UC Berkeley', domain: 'berkeley.edu', location: 'Berkeley, CA' },
    { name: 'UCLA', domain: 'ucla.edu', location: 'Los Angeles, CA' },
    { name: 'Yale University', domain: 'yale.edu', location: 'New Haven, CT' },
    { name: 'Princeton University', domain: 'princeton.edu', location: 'Princeton, NJ' },
    { name: 'Columbia University', domain: 'columbia.edu', location: 'New York, NY' },
    { name: 'University of Chicago', domain: 'uchicago.edu', location: 'Chicago, IL' },
    { name: 'University of Pennsylvania', domain: 'upenn.edu', location: 'Philadelphia, PA' },
  ];

  for (const college of colleges) {
    await prisma.college.upsert({
      where: { name: college.name },
      update: {},
      create: college,
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

Install ts-node:

```bash
npm install -D ts-node
```

Run seed:

```bash
npx prisma db seed
```

---

## Project Structure

```
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── dto/
│   │   ├── register.dto.ts
│   │   ├── login.dto.ts
│   │   └── update-profile.dto.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   └── strategies/
│       └── jwt.strategy.ts
├── users/
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│   └── dto/
│       └── update-user.dto.ts
├── events/
│   ├── events.controller.ts
│   ├── events.service.ts
│   ├── events.module.ts
│   └── dto/
│       ├── create-event.dto.ts
│       └── update-event.dto.ts
├── invitations/
│   ├── invitations.controller.ts
│   ├── invitations.service.ts
│   ├── invitations.module.ts
│   └── dto/
│       ├── create-invitation.dto.ts
│       └── update-invitation.dto.ts
├── categories/
│   ├── categories.controller.ts
│   ├── categories.service.ts
│   └── categories.module.ts
├── prisma/
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── common/
│   ├── decorators/
│   │   └── current-user.decorator.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   └── interceptors/
│       └── transform.interceptor.ts
├── app.module.ts
└── main.ts
```

---

## Authentication Setup

### 1. Create Prisma Module

`src/prisma/prisma.service.ts`:

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

`src/prisma/prisma.module.ts`:

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### 2. Create Auth Module

`src/auth/dto/register.dto.ts`:

```typescript
import { IsEmail, IsString, MinLength, IsOptional, IsInt, IsArray } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  collegeName?: string;

  @IsOptional()
  @IsString()
  major?: string;

  @IsOptional()
  @IsInt()
  graduationYear?: number;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  interests?: string[];

  @IsOptional()
  @IsArray()
  preferredLocations?: string[];
}
```

`src/auth/dto/login.dto.ts`:

```typescript
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
```

`src/auth/strategies/jwt.strategy.ts`:

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
```

`src/auth/guards/jwt-auth.guard.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

`src/auth/auth.service.ts`:

```typescript
import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        fullName: dto.fullName,
        collegeName: dto.collegeName,
        major: dto.major,
        graduationYear: dto.graduationYear,
        bio: dto.bio || '',
        interests: dto.interests || [],
        preferredLocations: dto.preferredLocations || [],
      },
    });

    const { password, ...userWithoutPassword } = user;

    const token = this.generateToken(user.id, user.email);

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password, ...userWithoutPassword } = user;

    const token = this.generateToken(user.id, user.email);

    return {
      user: userWithoutPassword,
      token,
    };
  }

  private generateToken(userId: string, email: string) {
    return this.jwtService.sign({
      sub: userId,
      email,
    });
  }
}
```

`src/auth/auth.controller.ts`:

```typescript
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
```

`src/auth/auth.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

---

## API Modules

### Users Module

`src/users/users.service.ts`:

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string) {
    const where = search
      ? {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' as const } },
            { collegeName: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        fullName: true,
        collegeName: true,
        major: true,
        graduationYear: true,
        bio: true,
        avatarUrl: true,
        photoUrls: true,
        interests: true,
        preferredLocations: true,
        createdAt: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        collegeName: true,
        major: true,
        graduationYear: true,
        bio: true,
        avatarUrl: true,
        photoUrls: true,
        interests: true,
        preferredLocations: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        collegeName: true,
        major: true,
        graduationYear: true,
        bio: true,
        avatarUrl: true,
        photoUrls: true,
        interests: true,
        preferredLocations: true,
      },
    });
  }
}
```

`src/users/users.controller.ts`:

```typescript
import { Controller, Get, Param, Patch, Body, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll(@Query('search') search?: string) {
    return this.usersService.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.usersService.update(id, data);
  }
}
```

### Events Module

`src/events/dto/create-event.dto.ts`:

```typescript
import { IsString, IsOptional, IsBoolean, IsInt, IsArray, Min, Max, MinLength, MaxLength } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  @MinLength(50)
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  locationName?: string;

  @IsOptional()
  locationLat?: number;

  @IsOptional()
  locationLng?: number;

  @IsOptional()
  eventDate?: Date;

  @IsOptional()
  startTime?: Date;

  @IsOptional()
  endTime?: Date;

  @IsOptional()
  @IsArray()
  photoUrls?: string[];

  @IsOptional()
  @IsArray()
  interestTags?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  capacityLimit?: number;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsString()
  status?: string;
}
```

`src/events/events.service.ts`:

```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        ...dto,
        photoUrls: dto.photoUrls || [],
        hostId: userId,
      },
      include: {
        host: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        category: true,
      },
    });
  }

  async findAll(userId: string, status?: string) {
    return this.prisma.event.findMany({
      where: {
        OR: [
          { isPublic: true },
          { hostId: userId },
          {
            invitations: {
              some: {
                inviteeId: userId,
              },
            },
          },
        ],
        ...(status && { status }),
      },
      include: {
        host: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        category: true,
        _count: {
          select: {
            attendees: true,
            invitations: true,
          },
        },
      },
      orderBy: {
        eventDate: 'asc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            email: true,
          },
        },
        category: true,
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            invitations: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const hasAccess =
      event.isPublic ||
      event.hostId === userId ||
      event.invitations?.some((inv: any) => inv.inviteeId === userId);

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this event');
    }

    return event;
  }

  async update(id: string, userId: string, data: any) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.hostId !== userId) {
      throw new ForbiddenException('Only the host can update this event');
    }

    return this.prisma.event.update({
      where: { id },
      data,
      include: {
        host: true,
        category: true,
      },
    });
  }

  async delete(id: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.hostId !== userId) {
      throw new ForbiddenException('Only the host can delete this event');
    }

    await this.prisma.event.delete({
      where: { id },
    });

    return { message: 'Event deleted successfully' };
  }
}
```

`src/events/events.controller.ts`:

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateEventDto) {
    return this.eventsService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Request() req, @Query('status') status?: string) {
    return this.eventsService.findAll(req.user.id, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.eventsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req, @Body() data: any) {
    return this.eventsService.update(id, req.user.id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Request() req) {
    return this.eventsService.delete(id, req.user.id);
  }
}
```

### Invitations Module

`src/invitations/invitations.service.ts`:

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvitationsService {
  constructor(private prisma: PrismaService) {}

  async create(eventId: string, inviterId: string, inviteeId: string, message?: string) {
    const existing = await this.prisma.eventInvitation.findUnique({
      where: {
        eventId_inviteeId: {
          eventId,
          inviteeId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('User already invited to this event');
    }

    return this.prisma.eventInvitation.create({
      data: {
        eventId,
        inviterId,
        inviteeId,
        personalMessage: message,
      },
      include: {
        event: true,
        inviter: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        invitee: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async findMyInvitations(userId: string) {
    return this.prisma.eventInvitation.findMany({
      where: {
        inviteeId: userId,
      },
      include: {
        event: {
          include: {
            host: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
        inviter: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateStatus(id: string, userId: string, status: string) {
    const invitation = await this.prisma.eventInvitation.findUnique({
      where: { id },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.inviteeId !== userId) {
      throw new ConflictException('You can only update your own invitations');
    }

    return this.prisma.eventInvitation.update({
      where: { id },
      data: { status },
    });
  }
}
```

`src/invitations/invitations.controller.ts`:

```typescript
import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('invitations')
@UseGuards(JwtAuthGuard)
export class InvitationsController {
  constructor(private invitationsService: InvitationsService) {}

  @Post()
  create(@Request() req, @Body() body: { eventId: string; inviteeId: string; message?: string }) {
    return this.invitationsService.create(body.eventId, req.user.id, body.inviteeId, body.message);
  }

  @Get('my')
  findMyInvitations(@Request() req) {
    return this.invitationsService.findMyInvitations(req.user.id);
  }

  @Patch(':id')
  updateStatus(@Param('id') id: string, @Request() req, @Body() body: { status: string }) {
    return this.invitationsService.updateStatus(id, req.user.id, body.status);
  }
}
```

---

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Users

- `GET /users` - Get all users (with optional search)
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user profile

### Events

- `POST /events` - Create event
- `GET /events` - Get all accessible events
- `GET /events?status=active` - Filter by status
- `GET /events/:id` - Get event details
- `PATCH /events/:id` - Update event
- `DELETE /events/:id` - Delete event

### Invitations

- `POST /invitations` - Send invitation
- `GET /invitations/my` - Get my invitations
- `PATCH /invitations/:id` - Update invitation status

### Categories

- `GET /categories/events` - Get event categories
- `GET /categories/interests` - Get interest categories
- `GET /categories/colleges` - Get colleges

---

## Security & Best Practices

### 1. CORS Configuration

`src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get('CORS_ORIGIN'),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  console.log(`Application running on: http://localhost:${port}`);
}
bootstrap();
```

### 2. Rate Limiting

`src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { InvitationsModule } from './invitations/invitations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    EventsModule,
    InvitationsModule,
  ],
})
export class AppModule {}
```

### 3. Environment Variables

Never commit `.env` to git. Add to `.gitignore`:

```
.env
.env.local
.env.production
```

---

## Deployment

### Deploy to Render

1. Push code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Create new Web Service
4. Connect GitHub repo
5. Configure:
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && npm run start:prod`
   - **Environment Variables**: Add all from `.env`

### Deploy to Railway

1. Push code to GitHub
2. Go to [Railway](https://railway.app/)
3. Create new project from GitHub
4. Add Postgres database (or use Neon)
5. Set environment variables
6. Railway will auto-deploy

### Deploy to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create celia-backend

# Add Postgres
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=your-secret
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Run migrations
heroku run npx prisma migrate deploy
```

---

## Testing Your API

### Using curl

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get users (with auth token)
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman

1. Import collection from `docs/postman_collection.json`
2. Set environment variables
3. Test all endpoints

---

## Next Steps

1. Set up file upload for photos (AWS S3 or Cloudinary)
2. Add email notifications (SendGrid or Resend)
3. Add real-time features (WebSockets)
4. Add analytics and monitoring (Sentry)
5. Write tests (Jest)
6. Set up CI/CD pipeline

---

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Neon Documentation](https://neon.tech/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
