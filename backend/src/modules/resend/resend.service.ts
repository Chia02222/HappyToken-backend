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

  async sendEcommericialTermlink(id: string, approver: 'first' | 'second' = 'first') {
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

    // Resolve recipient based on approver
    let recipientEmail: string | undefined;
    if (approver === 'first') {
      recipientEmail = corporate.contacts?.[0]?.email; // primary contact as first approver
    } else {
      const secId = (corporate as { secondary_approver_id?: unknown }).secondary_approver_id;
      const contacts = (corporate.contacts || []);
      const byId = contacts.find(c => Number((c as { id?: unknown }).id) === Number(secId));
      const byRole = contacts.find(c => (c as { system_role?: string }).system_role === 'secondary_approver');
      const fallback = contacts.length > 1 ? contacts[1] : undefined;
      const secondary = byId || byRole || fallback;
      recipientEmail = secondary?.email;
    }
    if (recipientEmail) {
      // Sanitize recipientEmail to remove any non-standard email characters
      recipientEmail = recipientEmail.replace(/[^a-zA-Z0-9._%+-@]/g, '');
    }
    if (!recipientEmail || recipientEmail === 'N/A' || recipientEmail === '') {
      return { success: false, message: 'Recipient email not found or is invalid for corporate.' };
    }

    const sanitizedCorporateId = String(corporate.id).replace(/[^a-zA-Z0-9]/g, '');
    const mode = approver === 'first' ? 'approve' : 'approve-second';
    const corporateFormLink = `http://localhost:3000/corporate/${corporate.id}?mode=${mode}&step=2`;

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
          subject: approver === 'first' ? 'First Approval Required' : 'Second Approval Required',
          html: approver === 'first'
            ? `<p>Hi,</p><p>Please review and approve the E-Commercial Terms: <a href="${corporateFormLink}">Open Link</a></p>`
            : `<p>Hi,</p><p>Please perform second approval for E-Commercial Terms: <a href="${corporateFormLink}">Open Link</a></p>`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Failed to send email via Resend:', data);
        return { success: false, message: data.message || 'Failed to send email.' };
      }

      console.log(`E-Commercial Terms link email sent to ${recipientEmail} for corporate ID: ${id}`);
      return { success: true, message: `E-Commercial Terms link sent to ${recipientEmail}.` };
    } catch (error) {
      console.error('Error sending email via Resend:', error);
      return { success: false, message: 'Error sending email.' };
    }
  }

  async sendAmendmentRequestEmail(corporateId: string) {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const SENDER_EMAIL = process.env.SENDER_EMAIL;

    if (!RESEND_API_KEY || !SENDER_EMAIL) {
      console.error('Resend API Key or Sender Email is not configured.');
      return { success: false, message: 'Resend API Key or Sender Email is not configured.' };
    }

    try {
      // Get corporate details
      const corporate = await this.corporateService.findById(corporateId);
      if (!corporate) {
        return { success: false, message: 'Corporate not found.' };
      }

      // Get the latest amendment request from investigation logs
      const investigationLogs = await this.corporateService.getInvestigationLogs(corporateId);
      const latestAmendmentLog = investigationLogs.find((log: { note?: string | null }) => 
        log.note != null && log.note.includes('Amendment Request Submitted')
      );

      if (!latestAmendmentLog) {
        return { success: false, message: 'No amendment request found in investigation logs.' };
      }

      // Extract data from the investigation log with tolerance for formatting
      const noteContent = latestAmendmentLog.note ?? '';
      
      // Parse with tolerance for spaces, case, and HTML tags
      const requestedChangesMatch = noteContent.match(/Requested Changes:\s*([^<]+?)(?:<br>|$)/i);
      const reasonMatch = noteContent.match(/Reason:\s*([^<]+?)(?:<br>|$)/i);
      const submittedByMatch = noteContent.match(/Submitted by:\s*([^<]+?)(?:<br>|$)/i);

      const requestedChanges = requestedChangesMatch ? requestedChangesMatch[1].trim() : 'Not specified';
      const reason = reasonMatch ? reasonMatch[1].trim() : 'Not specified';
      const submittedBy = submittedByMatch ? submittedByMatch[1].trim() : 'Unknown';

      // CRT email configuration
      const crtEmail = process.env.CRT_EMAIL || 'wanjun123@1utar.my';
      const subject = `Action Required: Amendment Request for ${corporate.company_name}`;
      const corporateLink = `http://localhost:3000/corporate/${corporateId}`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Action Required: Amendment Request</h2>
          <p>Hi CRT Team,</p>
          <p>An amendment request has been submitted and requires your action.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Request Details:</h3>
            <p><strong>Company:</strong> ${corporate.company_name}</p>
            <p><strong>Requested Changes:</strong> ${requestedChanges}</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <p><strong>Requested By:</strong> ${submittedBy}</p>
            <p><strong>Created By:</strong> CRT Team</p>
          </div>
          
          <p>You can review and update the request by clicking the link below:</p>
          <p><a href="${corporateLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Review Amendment Request</a></p>
          
          <p>Thank you,<br>Happy Token Team</p>
        </div>
      `;

      // Send email via Resend
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: SENDER_EMAIL,
          to: crtEmail,
          subject: subject,
          html: html,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Failed to send amendment request email via Resend:', data);
        return { success: false, message: data.message || 'Failed to send amendment request email.' };
      }

      console.log(`Amendment request email sent to ${crtEmail} for corporate ID: ${corporateId}`);
      return { success: true, message: `Amendment request email sent to ${crtEmail}.` };
    } catch (error) {
      console.error('Error sending amendment request email via Resend:', error);
      return { success: false, message: 'Error sending amendment request email.' };
    }
  }

  async sendRejectEmail(corporateId: string, note?: string) {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const SENDER_EMAIL = process.env.SENDER_EMAIL;
    const CRT_EMAIL = process.env.CRT_EMAIL || 'wanjun123@1utar.my';

    if (!RESEND_API_KEY || !SENDER_EMAIL) {
      console.error('Resend API Key or Sender Email is not configured.');
      return { success: false, message: 'Resend API Key or Sender Email is not configured.' };
    }

    const corporate = await this.corporateService.findById(corporateId);
    if (!corporate) {
      return { success: false, message: 'Corporate not found.' };
    }

    const subject = `Corporate Rejected: ${corporate.company_name}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <p>Dear CRT,</p>
        <p>The corporate account for <strong>${corporate.company_name}</strong> (Reg No: ${corporate.reg_number}) has been rejected.</p>
        <p><strong>Reason:</strong> ${note || 'N/A'}</p>
        <p>Regards,<br/>HappyToken</p>
      </div>
    `;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: SENDER_EMAIL, to: CRT_EMAIL, subject, html })
    });
    const data = await resp.json();
    if (!resp.ok) {
      console.error('Failed to send reject email:', data);
      return { success: false, message: data.message || 'Failed to send reject email.' };
    }
    return { success: true, message: 'Reject email sent.' };
  }

  async sendAmendRejectEmail(corporateId: string, note?: string) {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const SENDER_EMAIL = process.env.SENDER_EMAIL;
    const CRT_EMAIL = process.env.CRT_EMAIL || 'wanjun123@1utar.my';

    if (!RESEND_API_KEY || !SENDER_EMAIL) {
      console.error('Resend API Key or Sender Email is not configured.');
      return { success: false, message: 'Resend API Key or Sender Email is not configured.' };
    }

    const corporate = await this.corporateService.findById(corporateId);
    if (!corporate) {
      return { success: false, message: 'Corporate not found.' };
    }

    const subject = `Amendment Rejected: ${corporate.company_name}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <p>Dear CRT,</p>
        <p>An amendment request for <strong>${corporate.company_name}</strong> was rejected.</p>
        <p><strong>Reason:</strong> ${note || 'N/A'}</p>
        <p>Regards,<br/>HappyToken</p>
      </div>
    `;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: SENDER_EMAIL, to: CRT_EMAIL, subject, html })
    });
    const data = await resp.json();
    if (!resp.ok) {
      console.error('Failed to send amendment reject email:', data);
      return { success: false, message: data.message || 'Failed to send amendment reject email.' };
    }
    return { success: true, message: 'Amendment reject email sent.' };
  }

  async sendExpiredEmail(corporateId: string, note?: string) {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const SENDER_EMAIL = process.env.SENDER_EMAIL;
    const CRT_EMAIL = process.env.CRT_EMAIL || 'wanjun123@1utar.my';

    if (!RESEND_API_KEY || !SENDER_EMAIL) {
      console.error('Resend API Key or Sender Email is not configured.');
      return { success: false, message: 'Resend API Key or Sender Email is not configured.' };
    }

    const corporate = await this.corporateService.findById(corporateId);
    if (!corporate) {
      return { success: false, message: 'Corporate not found.' };
    }

    const subject = `Corporate Expired: ${corporate.company_name}`;
    const html = `
      <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">\n        <p>Dear CRT,</p>\n        <p>The corporate account for <strong>${corporate.company_name}</strong> has expired.</p>\n        <p><strong>Details:</strong> ${note || 'Auto-expired by system.'}</p>\n        <p>Regards,<br/>HappyToken</p>\n      </div>
    `;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: SENDER_EMAIL, to: CRT_EMAIL, subject, html })
    });
    const data = await resp.json();
    if (!resp.ok) {
      console.error('Failed to send expired email:', data);
      return { success: false, message: data.message || 'Failed to send expired email.' };
    }
    return { success: true, message: 'Expired email sent.' };
  }

  async sendAccountCreatedSuccessEmail(corporateId: string) {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const SENDER_EMAIL = process.env.SENDER_EMAIL;
    if (!RESEND_API_KEY || !SENDER_EMAIL) {
      console.error('Resend API Key or Sender Email is not configured.');
      return { success: false, message: 'Resend API Key or Sender Email is not configured.' };
    }

    const corporate = await this.corporateService.findById(corporateId);
    if (!corporate) {
      return { success: false, message: 'Corporate not found.' };
    }

    const firstEmail = corporate.contacts?.[0]?.email;
    const secondary =
      (corporate.contacts || []).find(c => (c as { id?: unknown }).id === (corporate as { secondary_approver_id?: unknown }).secondary_approver_id) ||
      (corporate.contacts || []).find(c => c.system_role === 'secondary_approver');
    const secondEmail = secondary?.email;

    const subject = `Account Created Successfully: ${corporate.company_name}`;
    const link = `http://localhost:3002/corporate/${corporate.id}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color:#333;">Account Created Successfully</h2>
        <p>The corporate account <strong>${corporate.company_name}</strong> has been approved.</p>
        <p>You can view the corporate details here: <a href="${link}">Open Corporate</a></p>
        <p>Regards,<br/>HappyToken</p>
      </div>
    `;

    const sendTo = async (to?: string) => {
      if (!to) return { success: false };
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: SENDER_EMAIL, to, subject, html })
      });
      return { ok: resp.ok, data: await resp.json() };
    };

    const r1 = await sendTo(firstEmail);
    const r2 = await sendTo(secondEmail);
    if ((r1.ok === false && r2.ok === false)) {
      console.error('Failed to send account created emails:', r1.data, r2.data);
      return { success: false, message: 'Failed to send account created emails.' };
    }
    return { success: true, message: 'Account created emails sent.' };
  }
}