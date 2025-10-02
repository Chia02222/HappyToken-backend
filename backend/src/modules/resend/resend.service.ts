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

    // Get contact information for email personalization
    const firstContact = corporate.contacts?.[0];
    const secUuid = (corporate as { secondary_approver_uuid?: unknown }).secondary_approver_uuid as string | undefined;
    const contacts = (corporate.contacts || []);
    const byId = contacts.find(c => String((c as { id?: unknown }).id) === String(secUuid));
    const byRole = contacts.find(c => (c as { system_role?: string }).system_role === 'secondary_approver');
    const fallback = contacts.length > 1 ? contacts[1] : undefined;
    const secondary = byId || byRole || fallback;

    // Resolve recipient based on approver
    let recipientEmail: string | undefined;
    if (approver === 'first') {
      recipientEmail = firstContact?.email; // primary contact as first approver
    } else {
      recipientEmail = secondary?.email;
    }
    if (recipientEmail) {
      // Sanitize recipientEmail to remove any non-standard email characters
      recipientEmail = recipientEmail.replace(/[^a-zA-Z0-9._%+-@]/g, '');
    }
    if (!recipientEmail || recipientEmail === 'N/A' || recipientEmail === '') {
      return { success: false, message: 'Recipient email not found or is invalid for corporate.' };
    }

    const sanitizedCorporateId = String((corporate as any).uuid ?? (corporate as any).id).replace(/[^a-zA-Z0-9-]/g, '');
    const mode = approver === 'first' ? 'approve' : 'approve-second';
    const corporateFormLink = `http://localhost:3000/corporate/${(corporate as any).uuid ?? (corporate as any).id}?mode=${mode}&step=2`;

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
          subject: 'Action Required: New Corporate Account Setup Requires Your Approval',
          html: approver === 'first'
            ? `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <p>Hi ${firstContact ? `${firstContact.first_name || ''} ${firstContact.last_name || ''}`.trim() : 'Approver'},</p>
                
                <p>An new corporate account has been created for your review and approval.</p>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p><strong>Company Name:</strong> ${corporate.company_name}</p>
                  <p><strong>Registration No.:</strong> ${corporate.reg_number}</p>
                </div>
                
                <p>You can review and take action by clicking the link below:</p>
                
                <p style="margin: 25px 0;">
                  <a href="${corporateFormLink}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Review Corporate Account</a>
                </p>
                
                <p>Thank you,<br/>Happie Token Team</p>
              </div>
            `
            : `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <p>Hello ${secondary ? `${secondary.first_name || ''} ${secondary.last_name || ''}`.trim() : '2nd Approver'},</p>
                
                <p>An new corporate account has been approved by the previous approver and now requires your review and final approval.</p>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p><strong>Company Name:</strong> ${corporate.company_name}</p>
                  <p><strong>Registration No.:</strong> ${corporate.reg_number}</p>
                  <p><strong>Previous Reviewer:</strong> ${firstContact ? `${firstContact.first_name || ''} ${firstContact.last_name || ''}`.trim() : 'First Approver'}</p>
                </div>
                
                <p>You can review and take action by clicking the link below:</p>
                
                <p style="margin: 25px 0;">
                  <a href="${corporateFormLink}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Review Corporate Account</a>
                </p>
                
                <p>Thank you,<br/>Happie Token Team</p>
              </div>
            `,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Failed to send email via Resend:', data);
        return { success: false, message: data.message || 'Failed to send email.' };
      }

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

      // Get the latest/pending amendment request from investigation logs
      const investigationLogs = await this.corporateService.getInvestigationLogs(corporateId);
      const latestAmendmentLog = investigationLogs.find((log: any) => log.to_status === 'Amendment Requested')
        || investigationLogs.find((log: { note?: string | null }) => log.note != null && log.note.includes('Amendment Request Submitted'));

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
      const corporateLink = (latestAmendmentLog as any)?.uuid
        ? `http://localhost:3000/crt/amendment/${(latestAmendmentLog as any).uuid}`
        : `http://localhost:3000/corporate/${corporateId}`;

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
          
          <p>Thank you,<br>Happie Token Team</p>
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
    const corporateLink = `http://localhost:3000/corporate/${corporateId}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Corporate Account Rejected</h2>
        
        <p>Dear CRT,</p>
        
        <p>The corporate account for <strong>${corporate.company_name}</strong> (Registration No: ${corporate.reg_number}) has been rejected.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Company:</strong> ${corporate.company_name}</p>
          <p><strong>Registration No.:</strong> ${corporate.reg_number}</p>
          <p><strong>Rejection Reason:</strong> ${note || 'No reason provided'}</p>
        </div>
        
        <p>You can review the corporate account details by clicking the link below:</p>
        
        <p style="margin: 25px 0;">
          <a href="${corporateLink}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Review Corporate Account</a>
        </p>
        
        <p>Thank you,<br/>Happie Token Team</p>
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

    if (!RESEND_API_KEY || !SENDER_EMAIL) {
      console.error('Resend API Key or Sender Email is not configured.');
      return { success: false, message: 'Resend API Key or Sender Email is not configured.' };
    }

    const corporate = await this.corporateService.findById(corporateId);
    if (!corporate) {
      return { success: false, message: 'Corporate not found.' };
    }

    // Determine recipient based on current status
    let recipientEmail: string | undefined;
    let approverName: string;
    
    if (corporate.status === 'Pending 2nd Approval') {
      // Send to second approver
      const secUuid = (corporate as { secondary_approver_uuid?: unknown }).secondary_approver_uuid as string | undefined;
      const contacts = (corporate.contacts || []);
      const byId = contacts.find(c => String((c as { id?: unknown }).id) === String(secUuid));
      const byRole = contacts.find(c => (c as { system_role?: string }).system_role === 'secondary_approver');
      const fallback = contacts.length > 1 ? contacts[1] : undefined;
      const secondary = byId || byRole || fallback;
      recipientEmail = secondary?.email;
      approverName = secondary ? `${secondary.first_name || ''} ${secondary.last_name || ''}`.trim() : 'Second Approver';
    } else {
      // Send to first approver
      const firstContact = corporate.contacts?.[0];
      recipientEmail = firstContact?.email;
      approverName = firstContact ? `${firstContact.first_name || ''} ${firstContact.last_name || ''}`.trim() : 'First Approver';
    }

    if (!recipientEmail || recipientEmail === 'N/A' || recipientEmail === '') {
      return { success: false, message: 'Recipient email not found for the appropriate approver.' };
    }

    const subject = `Amendment Rejected: ${corporate.company_name}`;
    const corporateLink = `http://localhost:3000/corporate/${(corporate as any).uuid ?? (corporate as any).id}?mode=approve&step=2`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Amendment Request Rejected</h2>
        
        <p>Dear ${approverName},</p>
        
        <p>An amendment request for <strong>${corporate.company_name}</strong> (Registration No: ${corporate.reg_number}) has been rejected by the CRT team.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Company:</strong> ${corporate.company_name}</p>
          <p><strong>Registration No.:</strong> ${corporate.reg_number}</p>
          <p><strong>Rejection Reason:</strong> ${note || 'No reason provided'}</p>
        </div>
        
        <p>The corporate account has been reverted to its previous status and you may need to take further action.</p>
        
        <p>You can review the corporate account by clicking the link below:</p>
        
        <p style="margin: 25px 0;">
          <a href="${corporateLink}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Review Corporate Account</a>
        </p>
        
        <p>Thank you,<br/>Happie Token Team</p>
      </div>
    `;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: SENDER_EMAIL, to: recipientEmail, subject, html })
    });
    const data = await resp.json();
    if (!resp.ok) {
      console.error('Failed to send amendment reject email:', data);
      return { success: false, message: data.message || 'Failed to send amendment reject email.' };
    }
    return { success: true, message: 'Amendment reject email sent to approver.' };
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

    const firstContact = corporate.contacts?.[0];
    const firstEmail = firstContact?.email;
    const secondary =
      (corporate.contacts || []).find(c => String((c as { id?: unknown }).id) === String((corporate as { secondary_approver_uuid?: unknown }).secondary_approver_uuid)) ||
      (corporate.contacts || []).find(c => c.system_role === 'secondary_approver');
    const secondEmail = secondary?.email;

    // Get approver names
    const firstApproverName = firstContact ? `${firstContact.first_name || ''} ${firstContact.last_name || ''}`.trim() : 'First Approver';
    const secondApproverName = secondary ? `${secondary.first_name || ''} ${secondary.last_name || ''}`.trim() : 'Second Approver';
    const createdBy = `${firstApproverName}, ${secondApproverName}`;

    const subject = `Welcome! Your Corporate Account is Ready – ${corporate.company_name}`;
    const portalLink = `http://localhost:3000/corporate/${(corporate as any).uuid ?? (corporate as any).id}`;

    const createEmailHtml = (userName: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Welcome! Your Corporate Account is Ready</h2>
        
        <p>Hello ${userName},</p>
        
        <p>We're pleased to inform you that your corporate account has been created successfully.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Company Name:</strong> ${corporate.company_name}</p>
          <p><strong>Created By:</strong> ${createdBy}</p>
        </div>
        
        <p>Get started by logging in to your corporate portal.</p>
        
        <p style="margin: 25px 0;">
          <a href="${portalLink}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Corporate Portal</a>
        </p>
        
        <p>Thank you for joining us,<br/>Happie Token Team</p>
      </div>
    `;

    const sendTo = async (to: string, userName: string) => {
      if (!to) return { success: false };
      // Try to generate backend PDF and attach; fallback to email without attachment
      let attachments: any[] | undefined;
      try {
        const pdfResp = await fetch(`http://localhost:3001/corporates/${(corporate as any).uuid ?? (corporate as any).id}/pdf`);
        if (pdfResp.ok) {
          const arrayBuf = await pdfResp.arrayBuffer();
          const base64 = Buffer.from(arrayBuf).toString('base64');
          const filename = `${(corporate.company_name || 'Corporate').replace(/[^a-zA-Z0-9 _.-]/g,'-')} - Happie Token.pdf`;
          attachments = [{ filename, content: base64 }];
        }
      } catch (e) {
        console.warn('PDF attach skipped:', e);
      }
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          from: SENDER_EMAIL, 
          to, 
          subject, 
          html: createEmailHtml(userName),
          attachments
        })
      });
      return { ok: resp.ok, data: await resp.json() };
    };

    const r1 = await sendTo(firstEmail || '', firstApproverName);
    const r2 = await sendTo(secondEmail || '', secondApproverName);
    if ((r1.ok === false && r2.ok === false)) {
      console.error('Failed to send account created emails:', r1.data, r2.data);
      return { success: false, message: 'Failed to send account created emails.' };
    }
    return { success: true, message: 'Account created emails sent.' };
  }
}