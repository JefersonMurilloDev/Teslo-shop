import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('bootstrap');

  // Helmet: Protección con headers de seguridad HTTP
  app.use(helmet());

  // Permitir todos los orígenes en desarrollo, restringir en producción
  if (process.env.STAGE === 'prod') {
    app.enableCors({
      origin: process.env.CORS_ORIGIN?.split(',') || [],
      credentials: true,
    });
  } else {
    app.enableCors(); // Permite todo en desarrollo
  }

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ========== SWAGGER CONFIG ==========
  if (process.env.STAGE !== 'prod') {
    const config = new DocumentBuilder()
      .setTitle('Teslo RESTFul API')
      .setDescription('Teslo shop endpoints')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }
  // ====================================

  await app.listen(process.env.PORT || 3000);
  logger.log(`App running on port ${process.env.PORT || 3000}`);
}
bootstrap();
