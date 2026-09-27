import nodemailer from 'nodemailer';
import { Resend } from 'resend';

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface SendResetCodeParams {
  to: string;
  fullName?: string;
  code: string;
}

export interface EmailSendResult {
  sent: boolean;
  provider: 'resend' | 'gmail_smtp' | 'smtp';
  messageId?: string;
  error?: string;
}

/**
 * Validates if Resend API is configured in apps/web/.env.local
 */
export function isResendConfigured(): boolean {
  const key = process.env.RESEND_API_KEY?.trim();
  return Boolean(
    key &&
    key.startsWith('re_') &&
    key !== 're_your_resend_api_key_here' &&
    !key.includes('your_resend')
  );
}

/**
 * Validates if Gmail SMTP credentials (EMAIL_USER and EMAIL_APP_PASSWORD) are set
 */
export function isGmailSmtpConfigured(): boolean {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_APP_PASSWORD?.trim();
  return Boolean(user && pass && user !== 'yourwebsite@gmail.com' && !pass.includes('xxxx'));
}

export function isEmailServiceConfigured(): boolean {
  return isResendConfigured() || isGmailSmtpConfigured() || Boolean(process.env.SMTP_HOST);
}

/**
 * Creates and returns an authenticated Nodemailer transporter for Gmail SMTP
 */
export function createGmailTransporter() {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_APP_PASSWORD?.replace(/\s+/g, '').trim();

  if (!user || !pass) {
    throw new Error('EMAIL_USER and EMAIL_APP_PASSWORD must be configured in apps/web/.env.local');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });
}

/**
 * General purpose email sender:
 * Supports sending messages, notifications, welcome emails, or alerts.
 * Prioritizes Resend API when configured, with seamless Gmail SMTP fallback.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
}: SendEmailParams): Promise<EmailSendResult> {
  const recipientList = Array.isArray(to) ? to : [to];

  // ─── 1. RESEND API DISPATCH ───
  if (isResendConfigured()) {
    try {
      const apiKey = process.env.RESEND_API_KEY!.trim();
      const resend = new Resend(apiKey);
      const senderFrom = from || process.env.RESEND_FROM || 'Talent5 Support <onboarding@resend.dev>';

      console.log(`[Talent5 Mailer] Sending via Resend API to: ${recipientList.join(', ')}...`);

      const { data, error } = await resend.emails.send({
        from: senderFrom,
        to: recipientList,
        subject,
        html,
        text: text || html.replace(/<[^>]+>/g, ''),
      });

      if (error) {
        console.error('[Talent5 Mailer] Resend API error:', error.message);
        // If Resend fails (e.g. testing with unverified domain), try Gmail SMTP if configured
        if (isGmailSmtpConfigured()) {
          console.log('[Talent5 Mailer] Falling back to Gmail SMTP...');
        } else {
          return {
            sent: false,
            provider: 'resend',
            error: `Resend API error: ${error.message}`,
          };
        }
      } else if (data?.id) {
        console.log(`[Talent5 Mailer] Real email sent via Resend API. Resend ID: ${data.id}`);
        return {
          sent: true,
          provider: 'resend',
          messageId: data.id,
        };
      }
    } catch (resendErr: any) {
      console.error('[Talent5 Mailer] Resend exception:', resendErr.message);
      if (!isGmailSmtpConfigured()) {
        return {
          sent: false,
          provider: 'resend',
          error: `Resend delivery failed: ${resendErr.message}`,
        };
      }
    }
  }

  // ─── 2. GMAIL SMTP DISPATCH ───
  if (isGmailSmtpConfigured()) {
    try {
      const user = process.env.EMAIL_USER!.trim();
      const senderFrom = from || process.env.EMAIL_FROM || `"Talent5 Support" <${user}>`;
      const transporter = createGmailTransporter();

      await transporter.verify();
      console.log('[Talent5 Mailer] Gmail SMTP connection verified successfully.');

      const info = await transporter.sendMail({
        from: senderFrom,
        to: recipientList.join(', '),
        replyTo: user,
        subject,
        text: text || html.replace(/<[^>]+>/g, ''),
        html,
        priority: 'high',
        headers: {
          'X-Priority': '1',
          'Importance': 'high',
        },
      });

      console.log(`[Talent5 Mailer] Real email sent via Gmail SMTP to: ${recipientList.join(', ')} (MessageId: ${info.messageId})`);
      return {
        sent: true,
        provider: 'gmail_smtp',
        messageId: info.messageId,
      };
    } catch (smtpErr: any) {
      console.error('[Talent5 Mailer] Gmail SMTP send failed:', smtpErr.message);
      return {
        sent: false,
        provider: 'gmail_smtp',
        error: `Gmail SMTP failed: ${smtpErr.message}`,
      };
    }
  }

  // ─── 3. NO PROVIDER CONFIGURED ───
  console.error('[Talent5 Mailer] Neither Resend API (RESEND_API_KEY) nor Gmail SMTP (EMAIL_USER/EMAIL_APP_PASSWORD) are configured.');
  return {
    sent: false,
    provider: 'resend',
    error: 'Email service credentials not configured. Please add RESEND_API_KEY or EMAIL_APP_PASSWORD in apps/web/.env.local.',
  };
}

/**
 * Sends a password reset verification code email.
 * Strictly adheres to security requirements:
 * - Never prints the OTP or passwords to the terminal logs
 * - Returns no mock or demo codes
 * - Formats responsive HTML email
 */
export async function sendPasswordResetEmail({
  to,
  fullName,
  code,
}: SendResetCodeParams): Promise<EmailSendResult> {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Talent5 Verification Code</title>
</head>
<body style="margin:0;padding:0;background-color:#080b11;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f3f4f6;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#080b11;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:540px;background:#101725;border:1px solid rgba(245,158,11,0.3);border-radius:24px;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,0.6);">
          
          <!-- Header Banner -->
          <tr>
            <td style="padding:32px 32px 20px;text-align:center;background:linear-gradient(180deg, rgba(245,158,11,0.15) 0%, rgba(16,23,37,0) 100%);">
              <div style="display:inline-block;padding:10px 18px;background:linear-gradient(135deg, #f59e0b, #d97706);border-radius:14px;font-size:18px;font-weight:900;color:#080b11;letter-spacing:1px;margin-bottom:12px;">
                🎵 TALENT5
              </div>
              <h1 style="margin:8px 0 4px;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                Password Reset Verification
              </h1>
              <p style="margin:0;font-size:13px;color:#9ca3af;">
                Real Voices. Original Stories. Desi Talent.
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:24px 36px 36px;">
              <p style="font-size:14px;line-height:1.6;color:#e5e7eb;margin:0 0 16px;">
                Hello <strong>${fullName || 'there'}</strong>,
              </p>
              <p style="font-size:13px;line-height:1.6;color:#9ca3af;margin:0 0 24px;">
                We received a request to reset your password. Please enter the following 6-digit verification code to verify your identity:
              </p>

              <!-- 6-Digit Code Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:20px 0;">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background:rgba(245,158,11,0.12);border:2px dashed #f59e0b;border-radius:18px;padding:20px 40px;text-align:center;">
                      <div style="font-size:11px;font-weight:800;color:#f59e0b;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;">
                        Verification Code
                      </div>
                      <div style="font-size:40px;font-weight:900;font-family:Consolas,Monaco,monospace;letter-spacing:12px;color:#ffffff;text-shadow:0 0 20px rgba(245,158,11,0.5);">
                        ${code}
                      </div>
                      <div style="font-size:11px;color:#9ca3af;margin-top:8px;">
                        ⏱️ Valid for 10 minutes
                      </div>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="font-size:11px;color:#6b7280;margin:24px 0 0;text-align:center;line-height:1.5;">
                If you did not request this verification code, please ignore this email. Your Talent5 account remains completely secure.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:18px 36px;background:#0b101c;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
              <p style="margin:0;font-size:11px;color:#6b7280;line-height:1.5;">
                This is an automated security email from Talent5 Music Platform.<br/>
                © 2026 Talent5. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return sendEmail({
    to,
    subject: `${code} is your Talent5 verification code`,
    text: `Hello ${fullName || 'there'},\n\nYour 6-digit Talent5 verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.\n\nTalent5 Team`,
    html: htmlContent,
  });
}
