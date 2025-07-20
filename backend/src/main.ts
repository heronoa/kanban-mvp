import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { AllExceptionsFilter } from './infrastructure/filters/all-exceptions.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

function configureCors(app: INestApplication) {
  app.enableCors({
    origin: process.env?.FRONTEND_URL ?? '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
}

function setGlobalPrefix(app: INestApplication) {
  app.setGlobalPrefix('api/v1');
}

function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Kanban API')
    .setDescription('Documentação da API de Kanban')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);
}

function useGlobalPipes(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((error) => {
          const messages = error.constraints
            ? Object.values(error.constraints).join(', ')
            : 'Unknown error';

          return {
            field: error.property,
            message: messages,
          };
        });

        return new BadRequestException({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Validation failed',
          errors: formattedErrors,
        });
      },
    }),
  );
}

function useGlobalFilters(app: INestApplication) {
  app.useGlobalFilters(new AllExceptionsFilter());
}

function configureHelmet(app: INestApplication) {
  if (process.env.NODE_ENV === 'production') {
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
          },
        },
        frameguard: {
          action: 'deny',
        },
        dnsPrefetchControl: {
          allow: false,
        },
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
        },
        xssFilter: true,
      }),
    );
  } else {
    app.use(
      helmet({
        contentSecurityPolicy: false,
        frameguard: { action: 'sameorigin' },
        hsts: false,
        xssFilter: false,
      }),
    );
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureCors(app);
  setGlobalPrefix(app);
  setupSwagger(app);
  useGlobalPipes(app);
  useGlobalFilters(app);
  configureHelmet(app);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
