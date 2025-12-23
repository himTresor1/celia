import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as morgan from 'morgan';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Add Morgan logging
  app.use(morgan('dev'));

  // Register global exception filter for standardized error responses
  app.useGlobalFilters(new AllExceptionsFilter());

  // Register global interceptor for standardized success responses
  app.useGlobalInterceptors(new TransformInterceptor());

  app.enableCors({
    origin: configService
      .get('CORS_ORIGIN', '*')
      .split(',')
      .map((origin: string) => origin.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('CELIA API')
    .setDescription(
      'CELIA Event Management Platform - API Documentation\n\n' +
        'This API provides endpoints for managing events, user profiles, invitations, and more for college students.\n\n' +
        '## Authentication\n' +
        'Most endpoints require authentication using JWT Bearer tokens. ' +
        'Register or login to get your access token, then include it in the Authorization header:\n' +
        '```\nAuthorization: Bearer YOUR_TOKEN_HERE\n```\n\n' +
        '## Features\n' +
        '- User registration and authentication\n' +
        '- Profile management with photos and interests\n' +
        '- Event creation and management\n' +
        '- Event invitations (single and bulk)\n' +
        '- Event attendance tracking\n' +
        '- College and interest categories\n\n' +
        '## Rate Limiting\n' +
        'API requests are limited to 100 requests per minute per IP address.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'User registration and login endpoints')
    .addTag('Users', 'User profile management')
    .addTag('Events', 'Event creation, management, and attendance')
    .addTag('Invitations', 'Event invitation management')
    .addTag(
      'Categories & Reference Data',
      'Event categories, interests, and colleges',
    )
    .setContact('CELIA Support', 'https://celia.app', 'support@celia.app')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'CELIA API Documentation',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #6366f1 }
    `,
    customfavIcon: 'https://celia.app/favicon.ico',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai',
      },
    },
  });

  const port = configService.get('PORT', 3000);
  await app.listen(port, '0.0.0.0');

  console.log(`
  ╔═══════════════════════════════════════════════════════╗
  ║                                                       ║
  ║   🚀 CELIA API Server Started Successfully!          ║
  ║                                                       ║
  ║   🌐 Server:      http://localhost:${port}              ║
  ║   📚 API Docs:    http://localhost:${port}/api/docs     ║
  ║   📖 Swagger:     http://localhost:${port}/api/docs     ║
  ║   🔧 Environment: ${configService.get('NODE_ENV', 'development').padEnd(11)}              ║
  ║                                                       ║
  ║   ⚠️  API PREFIX: /api (all endpoints start with /api) ║
  ║   ✅ Database:   ${configService.get('DATABASE_URL') ? 'Connected' : 'NOT CONFIGURED'.padEnd(9)}              ║
  ║   ✅ JWT Secret: ${configService.get('JWT_SECRET') ? 'Configured' : 'NOT CONFIGURED'}            ║
  ║                                                       ║
  ╚═══════════════════════════════════════════════════════╝
  `);

  console.log('\n📝 Logging enabled for authentication and requests');
  console.log(`💡 Frontend should connect to: http://localhost:${port}\n`);
}

bootstrap();
