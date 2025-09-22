import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { CorporateService } from '../corporate/corporate.service';

@Injectable()
export class ResendService {
  constructor(
    @Inject(forwardRef(() => CorporateService))
    private readonly corporateService: CorporateService,
  ) {}

  async sendCustomEmail(to: string, subject: string, html: string) {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const SENDER_EMAIL = process.env.SENDER_EMAIL;

    if (!RESEND_API_KEY || !SENDER_EMAIL) {
      console.error('Resend API Key or Sender Email is not configured.');
      return { success: false, message: 'Resend API Key or Sender Email is not configured.' };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: SENDER_EMAIL,
          to: to,
          subject: subject,
          html: html,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Failed to send custom email via Resend:', data);
        return { success: false, message: data.message || 'Failed to send custom email.' };
      }

      console.log(`Custom email sent to ${to} with subject: ${subject}`);
      return { success: true, message: `Custom email sent to ${to}.` };
    } catch (error) {
      console.error('Error sending custom email via Resend:', error);
      return { success: false, message: 'Error sending custom email.' };
    }
  }

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

    let recipientEmail = corporate.contacts?.[0]?.email; // Assuming first contact is the primary recipient
    if (recipientEmail) {
      // Sanitize recipientEmail to remove any non-standard email characters
      recipientEmail = recipientEmail.replace(/[^a-zA-Z0-9._%+-@]/g, '');
    }
    if (!recipientEmail || recipientEmail === 'N/A' || recipientEmail === '') {
      return { success: false, message: 'Recipient email not found or is invalid for corporate.' };
    }

    const corporateFormLink = `http://localhost:3002/corporate/${corporate.id}?mode=approve`;

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
          html: `<p>Click <a href="${corporateFormLink}">here</a> to view the corporate form for approval.</p>`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Failed to send email via Resend:', data);
        return { success: false, message: data.message || 'Failed to send email.' };
      }

      console.log(`Email sent to ${recipientEmail} for corporate ID: ${id}`);
      return { success: true, message: `Registration link sent to ${recipientEmail}.` };
    } catch (error) {
      console.error('Error sending email via Resend:', error);
      return { success: false, message: 'Error sending email.' };
    }
  }
}