"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const corsOrigin = configService.get('CORS_ORIGIN', '');
    const allowedOrigins = corsOrigin
        ? corsOrigin
            .split(',')
            .map(o => o.trim())
            .filter(Boolean)
        : true;
    app.enableCors({
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });
    app.setGlobalPrefix('api');
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Grow Fitness API')
        .setDescription(`API documentation for Grow Fitness Platform.

## Public Endpoints (no auth required)
- **GET /api/sessions/free** - List free sessions (isFreeSession: true)
- **POST /api/requests/free-sessions** - Create free session request
- **GET /api/requests/free-sessions** - List free session requests
- **GET /api/testimonials** - List testimonials (paginated)
- **GET /api/testimonials/:id** - Get testimonial by ID
- **GET /api/locations** - List locations
- **GET /api/banners** - List banners

## Authenticated Endpoints
Most endpoints require JWT Bearer token. Roles: ADMIN, PARENT, COACH (varies by endpoint).

## Notifications
- **GET /api/notifications** - List notifications for current user (paginated, optional read filter)
- **GET /api/notifications/unread-count** - Unread count for badge
- **PATCH /api/notifications/:id/read** - Mark one as read
- **PATCH /api/notifications/read-all** - Mark all as read
- **DELETE /api/notifications/clear-all** - Clear all notifications for current user
- **DELETE /api/notifications/:id** - Clear one notification`)
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
        .addTag('health', 'Health check endpoints')
        .addTag('auth', 'Authentication endpoints')
        .addTag('users', 'User management endpoints')
        .addTag('kids', 'Kid management endpoints')
        .addTag('sessions', 'Session management. GET /sessions/free is public.')
        .addTag('requests', 'Request management: free sessions, reschedules, extra sessions, user registrations')
        .addTag('invoices', 'Invoice management endpoints')
        .addTag('locations', 'Location management endpoints')
        .addTag('banners', 'Banner management endpoints')
        .addTag('quizzes', 'Quiz management endpoints')
        .addTag('testimonials', 'Testimonials CRUD. GET list and GET by ID are public.')
        .addTag('dashboard', 'Dashboard endpoints')
        .addTag('audit', 'Audit log endpoints')
        .addTag('notifications', 'In-app notifications: list, unread count, mark read. Used by admin-web and client-web.')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    const port = configService.get('PORT', 3000);
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}/api`);
    console.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map