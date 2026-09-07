import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

/**
 * Configure Nodemailer Transporter
 */
let transporter = null;
const isEmailConfigured = Boolean(env.EMAIL_USER && env.EMAIL_PASS);

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_PORT === 465,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  });
  console.log(`📧 Nodemailer configured with host: ${env.EMAIL_HOST}`);
} else {
  console.log('ℹ️ Nodemailer: EMAIL_USER/EMAIL_PASS not configured. Simulated delivery active.');
}

/**
 * Send Interview Invitation Email to Candidate
 */
export const sendInterviewInvitationEmail = async ({
  candidateEmail,
  candidateName,
  recruiterName,
  companyName,
  jobTitle,
  date,
  time,
  meetingLink,
  notes = '',
}) => {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const subject = `Interview Invitation: ${jobTitle} at ${companyName || 'CareerPilot AI'}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; color: #f1f5f9; margin: 0; padding: 24px; }
          .container { max-width: 600px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%); padding: 32px 24px; text-align: center; }
          .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
          .header p { margin: 6px 0 0 0; color: #e0e7ff; font-size: 14px; }
          .content { padding: 32px 24px; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; background-color: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); color: #818cf8; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 16px; }
          .greeting { font-size: 18px; font-weight: 600; color: #ffffff; margin-bottom: 12px; }
          .lead-text { font-size: 14px; line-height: 1.6; color: #94a3b8; margin-bottom: 24px; }
          .details-card { background-color: #1e293b; border-radius: 12px; border: 1px solid #334155; padding: 20px; margin-bottom: 28px; }
          .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
          .detail-row:last-child { margin-bottom: 0; }
          .label { color: #64748b; font-weight: 500; }
          .value { color: #f8fafc; font-weight: 600; text-align: right; }
          .btn-container { text-align: center; margin: 32px 0; }
          .btn-join { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 15px; border-radius: 10px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4); }
          .notes-box { background-color: rgba(6, 182, 212, 0.05); border-left: 3px solid #06b6d4; padding: 14px 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px; }
          .notes-title { font-size: 13px; font-weight: 600; color: #22d3ee; margin-bottom: 4px; }
          .notes-text { font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0; }
          .footer { border-top: 1px solid #1e293b; padding: 20px 24px; text-align: center; font-size: 12px; color: #475569; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CareerPilot AI</h1>
            <p>Intelligent Career & Recruitment Platform</p>
          </div>
          <div class="content">
            <span class="badge">Interview Scheduled</span>
            <div class="greeting">Hello ${candidateName || 'Candidate'},</div>
            <p class="lead-text">
              Great news! <strong>${recruiterName || 'The hiring team'}</strong> from <strong>${companyName || 'the recruiting organization'}</strong> has scheduled an interview with you for the <strong>${jobTitle}</strong> position.
            </p>

            <div class="details-card">
              <div class="detail-row">
                <span class="label">Position:</span>
                <span class="value">${jobTitle}</span>
              </div>
              <div class="detail-row">
                <span class="label">Company:</span>
                <span class="value">${companyName || 'Hiring Partner'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Interviewer:</span>
                <span class="value">${recruiterName || 'Recruitment Team'}</span>
              </div>
              <div class="detail-row">
                <span class="label">Date:</span>
                <span class="value">${formattedDate}</span>
              </div>
              <div class="detail-row">
                <span class="label">Time:</span>
                <span class="value">${time}</span>
              </div>
            </div>

            ${
              notes
                ? `
              <div class="notes-box">
                <div class="notes-title">Notes & Instructions from Interviewer:</div>
                <p class="notes-text">${notes}</p>
              </div>
            `
                : ''
            }

            <div class="btn-container">
              <a href="${meetingLink}" target="_blank" class="btn-join">
                🎥 Join Interview Meeting
              </a>
            </div>

            <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 8px;">
              Meeting Link: <a href="${meetingLink}" style="color: #38bdf8;">${meetingLink}</a>
            </p>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} CareerPilot AI. All rights reserved.</p>
            <p>Best of luck with your interview preparation! You can practice ahead of time in our AI Mock Interview studio.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  if (!isEmailConfigured || !transporter) {
    console.log(`[SIMULATED EMAIL] To: ${candidateEmail} | Subject: ${subject}`);
    console.log(`[SIMULATED EMAIL] Meeting Link: ${meetingLink} | Date: ${formattedDate} at ${time}`);
    return {
      success: true,
      simulated: true,
      messageId: `simulated-${Date.now()}`,
    };
  }

  try {
    const info = await transporter.sendMail({
      from: `"CareerPilot AI" <${env.EMAIL_USER}>`,
      to: candidateEmail,
      subject,
      html: htmlContent,
    });
    console.log(`📧 Interview invitation sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId, simulated: false };
  } catch (error) {
    console.error(`⚠️ Failed to dispatch interview invitation email:`, error.message);
    return { success: false, error: error.message, simulated: false };
  }
};

/**
 * Send Interview Status Update Email (Rescheduled / Cancelled)
 */
export const sendInterviewStatusUpdateEmail = async ({
  candidateEmail,
  candidateName,
  recruiterName,
  companyName,
  jobTitle,
  status,
  reason = '',
  date,
  time,
  meetingLink,
}) => {
  const isRescheduled = status === 'Rescheduled';
  const subject = `Update: Interview for ${jobTitle} has been ${status}`;

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
        <style>
          body { font-family: sans-serif; background-color: #090d16; color: #f1f5f9; padding: 24px; margin: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 32px 24px; }
          .title { font-size: 20px; font-weight: 700; color: ${isRescheduled ? '#38bdf8' : '#f43f5e'}; margin-bottom: 12px; }
          .text { font-size: 14px; color: #94a3b8; line-height: 1.6; }
          .card { background-color: #1e293b; border-radius: 10px; padding: 16px; margin: 20px 0; border: 1px solid #334155; }
          .btn { display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #fff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="title">Interview Status: ${status}</div>
          <p class="text">Hello ${candidateName || 'Candidate'},</p>
          <p class="text">
            Your scheduled interview for the position <strong>${jobTitle}</strong> at <strong>${companyName || 'the company'}</strong> has been <strong>${status.toLowerCase()}</strong> by ${recruiterName || 'the recruiter'}.
          </p>
          ${reason ? `<div class="card"><p style="margin: 0; font-size: 13px; color: #cbd5e1;"><strong>Reason / Note:</strong> ${reason}</p></div>` : ''}
          ${
            isRescheduled
              ? `
            <div class="card">
              <p style="margin: 0 0 6px 0; font-size: 13px; color: #cbd5e1;"><strong>New Schedule:</strong> ${formattedDate} at ${time}</p>
              <a href="${meetingLink}" class="btn">Join Updated Meeting</a>
            </div>
          `
              : ''
          }
          <p class="text" style="margin-top: 24px; font-size: 12px; color: #64748b;">
            Log in to your CareerPilot AI dashboard to review your full interview calendar.
          </p>
        </div>
      </body>
    </html>
  `;

  if (!isEmailConfigured || !transporter) {
    console.log(`[SIMULATED EMAIL] Status Update to: ${candidateEmail} | Status: ${status}`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"CareerPilot AI" <${env.EMAIL_USER}>`,
      to: candidateEmail,
      subject,
      html: htmlContent,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`⚠️ Failed to send interview status update email:`, error.message);
    return { success: false, error: error.message };
  }
};
