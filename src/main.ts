import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.use((req: any, res: any, next: any) => {
    const startedAt = Date.now();
    console.log(`[http] ${req.method} ${req.url} start`);
    res.on('finish', () => {
      const durationMs = Date.now() - startedAt;
      console.log(`[http] ${req.method} ${req.url} -> ${res.statusCode} ${durationMs}ms`);
    });
    res.on('close', () => {
      const durationMs = Date.now() - startedAt;
      console.log(
        `[http] ${req.method} ${req.url} close finished=${res.writableEnded} ${durationMs}ms`,
      );
    });
    next();
  });
  await app.listen(3000, '0.0.0.0');
}

void bootstrap();
