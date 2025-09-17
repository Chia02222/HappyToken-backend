import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { CorporateService } from '../corporate/corporate.service';

@Injectable()
export class ResendService {
  constructor(
    @Inject(forwardRef(() => CorporateService))
    private readonly corporateService: CorporateService,
  ) {}

  async resendRegistrationLink(id: string) {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const SENDER_EMAIL = process.env.SENDER_EMAIL;

    if (!RESEND_API_KEY || !SENDER_EMAIL) {
      console.error('Resend API Key or Sender Email is not configured.');
      return { success: false, message: 'Resend API Key or Sender Email is not configured.' };
    }

    const corporate = await this.corporateService.findById(id);
    if (!corporate) {
      return { success: false, message: 'Corporate not found.' };
    }

    const recipientEmail = corporate.contacts?.[0]?.email; // Assuming first contact is the primary recipient
    if (!recipientEmail) {
      return { success: false, message: 'Recipient email not found for corporate.' };
    }

    const registrationLink = `https://happietoken.com/register?token=${Buffer.from(`corp_${corporate.id}`).toString('base64')}`;

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: SENDER_EMAIL,
          to: recipientEmail,
          subject: 'Your Registration Link',
          html: `<p>Click <a href="${registrationLink}">here</a> to register</p>`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Failed to send email via Resend:', data);
        return { success: false, message: data.message || 'Failed to send email.' };
      }

      console.log(`Email sent to ${recipientEmail} for corporate ID: ${id}`);
      return { success: true, message: `Registration link resent to ${recipientEmail}.` };
    } catch (error) {
      console.error('Error sending email via Resend:', error);
      return { success: false, message: 'Error sending email.' };
    }
  }
}