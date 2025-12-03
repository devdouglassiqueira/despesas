import { HttpStatus, RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { swagger } from './docs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const isProduction = process.env.ENVIRONMENT === 'production';

  app.useGlobalPipes(
    new ValidationPipe({
      errorHttpStatusCode: HttpStatus.BAD_REQUEST,
      validationError: { target: true, value: true },
      whitelist: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api', {
    exclude: [{ path: 'healthcheck', method: RequestMethod.GET }],
  });

  const uploadsDir = isProduction
    ? join(__dirname, 'uploads')
    : join(__dirname, '..', '..', 'uploads');

  app.useStaticAssets(uploadsDir, {
    prefix: '/api/uploads/',
  });
  console.log('uploadsDir', uploadsDir);

  app.enableShutdownHooks();
  app.enableCors();

  if (!isProduction) swagger(app);

  const PORT = 5058;
  await app.listen(PORT);
}

bootstrap();
