// Mailer simulator with in-memory inbox for development & learning
export const mailbox = [];

export async function sendPasswordResetEmail({ to, name, resetUrl, rawToken }) {
  const mailObject = {
    id: 'mail_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    to,
    recipientName: name,
    subject: '🔐 Reset your AuthShield password',
    resetUrl,
    token: rawToken,
    sentAt: new Date().toISOString(),
    html: `
      <div style="font-family: sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #4f46e5; margin-top: 0;">Password Reset Request</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>We received a request to reset your password. Click the button below to choose a new password. This link is valid for <strong>15 minutes</strong>.</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Reset My Password</a>
        </div>
        <p style="color: #64748b; font-size: 14px;">Or copy and paste this link into your browser:</p>
        <code style="display: block; background: #f1f5f9; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px; color: #334155;">${resetUrl}</code>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `
  };

  // Add to in-memory mailbox (keep latest 30 emails)
  mailbox.unshift(mailObject);
  if (mailbox.length > 30) mailbox.pop();

  console.log('\n================== ✉️ SIMULATED EMAIL SENT ==================');
  console.log(`To: ${to}`);
  console.log(`Subject: ${mailObject.subject}`);
  console.log(`Reset Link: ${resetUrl}`);
  console.log('=============================================================\n');

  return mailObject;
}

export function getInbox() {
  return mailbox;
}

export function clearInbox() {
  mailbox.length = 0;
}

