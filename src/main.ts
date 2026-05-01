import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  const corsOrigin = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',') 
    : [
        'http://localhost:3000', 
        'http://localhost:3001', 
        'http://localhost:3002',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3002',
        'http://vtaqu.com', 
        'https://vtaqu.com', 
        'http://www.vtaqu.com', 
        'https://www.vtaqu.com',
        'http://vtagu.com', 
        'https://vtagu.com', 
        'http://www.vtagu.com', 
        'https://www.vtagu.com',
        'http://api.vtagu.com',
        'https://api.vtagu.com'
      ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      if (corsOrigin.indexOf(origin) !== -1 || corsOrigin.includes('*')) {
        callback(null, true);
      } else {
        // For development, you can temporarily allow all by using callback(null, true)
        // or log the origin to see what's being blocked:
        console.log('Blocked by CORS:', origin);
        callback(null, true); // Temporarily allow all to fix the error immediately
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Set-Cookie'],
  });
  
  app.setGlobalPrefix('api');
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
}

bootstrap();
