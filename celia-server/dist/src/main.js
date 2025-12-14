"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.enableCors({
        origin: configService
            .get('CORS_ORIGIN', '*')
            .split(',')
            .map((origin) => origin.trim()),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.setGlobalPrefix('api');
    const config = new swagger_1.DocumentBuilder()
        .setTitle('CELIA API')
        .setDescription('CELIA Event Management Platform - API Documentation\n\n' +
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
        'API requests are limited to 100 requests per minute per IP address.')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('Authentication', 'User registration and login endpoints')
        .addTag('Users', 'User profile management')
        .addTag('Events', 'Event creation, management, and attendance')
        .addTag('Invitations', 'Event invitation management')
        .addTag('Categories & Reference Data', 'Event categories, interests, and colleges')
        .setContact('CELIA Support', 'https://celia.app', 'support@celia.app')
        .setLicense('MIT', 'https://opensource.org/licenses/MIT')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
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
    console.log('💡 Frontend should connect to: http://localhost:${port}\n');
}
bootstrap();
//# sourceMappingURL=main.js.map