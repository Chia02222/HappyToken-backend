import { Elysia } from 'elysia';
import { ResendService } from './resend.service';

const resendService = new ResendService();

export const resendRoutes = new Elysia({ prefix: '/resend' })
  .get('/', async () => {
    return { message: 'Resend service is available. Use POST endpoints to send emails.' };
  })
  
  .post('/send-custom-email', async ({ body }) => {
    const { to, subject, html } = body as { to: string; subject: string; html: string };
    return await resendService.sendCustomEmail(to, subject, html);
  });

