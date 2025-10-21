import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { staticPlugin } from '@elysiajs/static';
import * as dotenv from 'dotenv';
import { createServer } from 'http';
import { databaseService } from './database/database.service';
import { corporateRoutes } from './modules/corporate/corporate.routes';
import { contactsRoutes } from './modules/contacts/contacts.routes';
import { subsidiariesRoutes } from './modules/subsidiaries/subsidiaries.routes';
import { resendRoutes } from './modules/resend/resend.routes';
import { seedRoutes } from './seed/seed.routes';
import { appRoutes } from './app.routes';
import { initializeScheduler } from './scheduler';

dotenv.config();

const app = new Elysia()
  .use(cors())
  .use(swagger({
    documentation: {
      info: {
        title: 'HappyToken Backend API',
        version: '1.0.0',
        description: 'API for HappyToken corporate management system'
      }
    }
  }))
  .use(staticPlugin())
  .use(appRoutes)
  .use(corporateRoutes)
  .use(contactsRoutes)
  .use(subsidiariesRoutes)
  .use(resendRoutes)
  .use(seedRoutes)
  .onError(({ error, set }) => {
    console.error('Error:', error);
    set.status = 500;
    return { error: 'Internal Server Error', message: String(error) };
  });

// Initialize database and scheduler
databaseService.initialize().then(() => {
  initializeScheduler();
}).catch(console.error);

// Start the server using Node.js http with Elysia's fetch handler
const server = createServer(async (req, res) => {
  // Read the request body if present
  let body: string | undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    body = Buffer.concat(chunks).toString();
  }

  const response = await app.fetch(
    new Request(`http://localhost:${process.env.PORT ?? 3001}${req.url}`, {
      method: req.method,
      headers: req.headers as any,
      body: body,
    })
  );

  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  if (response.body) {
    const reader = response.body.getReader();
    const pump = async () => {
      const { done, value } = await reader.read();
      if (done) {
        res.end();
        return;
      }
      res.write(value);
      return pump();
    };
    await pump();
  } else {
    res.end();
  }
});

server.listen(process.env.PORT ?? 3001, () => {
  console.log(`🚀 Server is running at http://localhost:${process.env.PORT ?? 3001}`);
});
