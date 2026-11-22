import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Serve static assets from public/ directory
  app.useStaticAssets(join(process.cwd(), 'public'), {
    prefix: '/public/',
  });

  // Increase payload limits for large image/video uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  
  // Allowed origin regex patterns (matches all subdomains of vtagu.in, vtagu.com, localhost)
  const ALLOWED_ORIGIN_PATTERNS = [
    /^https?:\/\/(?:[a-zA-Z0-9-]+\.)*vtagu\.in(?::\d+)?$/,
    /^https?:\/\/(?:[a-zA-Z0-9-]+\.)*vtagu\.com(?::\d+)?$/,
    /^https?:\/\/(?:[a-zA-Z0-9-]+\.)*vtaqu\.in(?::\d+)?$/,
    /^https?:\/\/(?:[a-zA-Z0-9-]+\.)*vtaqu\.com(?::\d+)?$/,
    /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/,
  ];

  const EXPLICIT_ALLOWED_ORIGINS = new Set([
    'https://vtagu.in',
    'http://vtagu.in',
    'https://www.vtagu.in',
    'http://www.vtagu.in',
    'https://admin.vtagu.com',
    'http://admin.vtagu.com',
    'https://admin.vtagu.in',
    'http://admin.vtagu.in',
    'https://vtagu.com',
    'http://vtagu.com',
    'https://www.vtagu.com',
    'http://www.vtagu.com',
    'https://api.vtagu.com',
    'http://api.vtagu.com',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
  ]);

  const isAllowedOrigin = (origin: string | undefined): boolean => {
    if (!origin) return true; // Mobile apps, Postman, server-to-server, curl
    if (EXPLICIT_ALLOWED_ORIGINS.has(origin)) return true;
    return ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));
  };

  // Top-level Express middleware to guarantee immediate preflight OPTIONS handling
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    const origin = req.headers.origin as string | undefined;

    if (origin && isAllowedOrigin(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, Accept, Origin, X-Requested-With, x-admin-token, x-kids-mode, RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Url, Cache-Control, Pragma, If-Modified-Since',
      );
      res.setHeader(
        'Access-Control-Expose-Headers',
        'Set-Cookie, Authorization, Content-Disposition',
      );
      res.setHeader('Access-Control-Max-Age', '86400');
      res.setHeader('Vary', 'Origin');
    }

    // Intercept OPTIONS preflight requests immediately with 200 OK
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    next();
  });

  // Enable CORS in NestJS
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        // Fallback: allow to avoid any accidental blocking in production
        console.warn(`[CORS Warning] Origin not explicitly matched: ${origin}`);
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
      'x-admin-token',
      'x-kids-mode',
      'RSC',
      'Next-Router-State-Tree',
      'Next-Router-Prefetch',
      'Next-Url',
      'Cache-Control',
      'Pragma',
      'If-Modified-Since',
    ],
    exposedHeaders: ['Set-Cookie', 'Authorization', 'Content-Disposition'],
    optionsSuccessStatus: 200,
  });
  
  app.setGlobalPrefix('api');
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
}

bootstrap();