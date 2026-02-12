import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // CORS - Allow all origins
  app.enableCors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Swagger/OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('Grow Fitness API')
    .setDescription(
      `API documentation for Grow Fitness Platform.

## Public Endpoints (no auth required)
- **GET /api/sessions/free** - List free sessions (isFreeSession: true)
- **POST /api/requests/free-sessions** - Create free session request
- **GET /api/requests/free-sessions** - List free session requests
- **GET /api/testimonials** - List testimonials (paginated)
- **GET /api/testimonials/:id** - Get testimonial by ID
- **GET /api/locations** - List locations
- **GET /api/banners** - List banners

## Authenticated Endpoints
Most endpoints require JWT Bearer token. Roles: ADMIN, PARENT, COACH (varies by endpoint).`
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth' // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
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
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
  console.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
}

bootstrap();
