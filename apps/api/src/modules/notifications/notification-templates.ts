/**
 * Centralized templates for Grow Fitness notifications.
 * Exports HTML and text formats for professional email and SMS alerts.
 */

interface HtmlTemplateOptions {
  title: string;
  preheader?: string;
  greeting: string;
  body: string;
  actionUrl?: string;
  actionText?: string;
}

export function getHtmlTemplate(options: HtmlTemplateOptions): string {
  const preheaderHtml = options.preheader
    ? `<div style="display: none; max-height: 0px; overflow: hidden; opacity: 0;">${options.preheader}</div>`
    : '';

  const actionButtonHtml = (options.actionUrl && options.actionText)
    ? `
    <div style="margin: 30px 0; text-align: center;">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${options.actionUrl}" style="height:48px;v-text-anchor:middle;width:200px;" arcsize="13%" stroke="f" fillcolor="#10b981">
        <w:anchorlock/>
        <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">${options.actionText}</center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-->
      <a href="${options.actionUrl}" target="_blank" style="background-color: #10b981; color: #ffffff; text-decoration: none; padding: 12px 30px; font-weight: bold; border-radius: 6px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px;">
        ${options.actionText}
      </a>
      <!--<![endif]-->
    </div>
    `
    : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title}</title>
  <style>
    body {
      background-color: #f6f9fc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f6f9fc;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }
    .header {
      background-color: #0f172a;
      color: #ffffff;
      padding: 30px 40px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .content {
      padding: 40px;
      color: #334155;
      line-height: 1.6;
      font-size: 16px;
    }
    .content h2 {
      color: #0f172a;
      font-size: 20px;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 25px 40px;
      text-align: center;
      color: #64748b;
      font-size: 14px;
      border-top: 1px solid #e2e8f0;
    }
    p {
      margin-top: 0;
      margin-bottom: 20px;
    }
    .highlight-box {
      background-color: #f8fafc;
      border-left: 4px solid #10b981;
      padding: 20px;
      margin: 20px 0;
      border-radius: 0 6px 6px 0;
    }
  </style>
</head>
<body>
  ${preheaderHtml}
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>Grow Fitness</h1>
      </div>
      <div class="content">
        <h2>${options.title}</h2>
        <p>${options.greeting}</p>
        <div>
          ${options.body}
        </div>
        ${actionButtonHtml}
        <p style="margin-top: 30px; margin-bottom: 0;">Best regards,<br><strong>Grow Fitness Team</strong></p>
      </div>
      <div class="footer">
        <p style="margin: 0 0 10px 0;">&copy; ${new Date().getFullYear()} Grow Fitness. All rights reserved.</p>
        <p style="font-size: 12px; margin: 0;">You are receiving this email because you are registered with Grow Fitness.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// 1. Password Reset
export function getPasswordResetEmail(userName: string, resetUrl: string, expiryHours: number) {
  const title = 'Reset Your Password';
  const greeting = `Hello ${userName},`;
  const body = `
    <p>You requested to reset the password for your Grow Fitness account.</p>
    <p>Please click the button below to choose a new password. This link will remain active for <strong>${expiryHours} hour${expiryHours !== 1 ? 's' : ''}</strong>.</p>
    <p>If you did not request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    <p style="font-size: 12px; color: #64748b; margin-top: 20px;">For security reasons, do not share this link with anyone.</p>
  `;
  const text = `Hello ${userName},

You requested to reset your password for your Grow Fitness account.

Click the link below to reset your password:
${resetUrl}

This link will expire in ${expiryHours} hour${expiryHours !== 1 ? 's' : ''}.

If you did not request this password reset, please ignore this email. Your password will remain unchanged.

Best regards,
Grow Fitness Team`;

  return {
    subject: 'Reset Your Password - Grow Fitness',
    html: getHtmlTemplate({ title, greeting, body, actionUrl: resetUrl, actionText: 'Reset Password' }),
    text,
  };
}

// 2. Coach Account Created
export function getCoachAccountCreatedEmail(coachName: string, email: string, loginUrl: string) {
  const title = 'Welcome to Grow Fitness';
  const greeting = `Hello ${coachName},`;
  const body = `
    <p>Welcome to the Grow Fitness team! An administrator has created your coach account.</p>
    <p>You can now log in to the Coach Portal to view schedules, manage client sessions, and track your payouts.</p>
    <div class="highlight-box">
      <strong>Your Account Details:</strong><br>
      Email Address: <code>${email}</code><br>
      Password: <em>(Please use the password shared by your administrator)</em>
    </div>
    <p>We recommend resetting your password after logging in for the first time by using the "Forgot password" link on the login page.</p>
  `;
  const text = `Hello ${coachName},

Your Grow Fitness coach account has been created. You can sign in at:
${loginUrl}

Use your email address (${email}) and the password your administrator shared with you. If you need to reset your password, use "Forgot password" on the login page.

Best regards,
Grow Fitness Team`;

  return {
    subject: 'Your Grow Fitness Coach Account is Ready',
    html: getHtmlTemplate({ title, greeting, body, actionUrl: loginUrl, actionText: 'Log In to Coach Portal' }),
    text,
  };
}

export function getCoachAccountCreatedSMS(coachName: string, loginUrl: string): string {
  return `Hi ${coachName}, your Grow Fitness coach account is ready. Sign in: ${loginUrl} — use your email and the password from your administrator.`;
}

// 3. Parent Registration Received
export function getParentRegistrationReceivedEmail(parentName: string) {
  const title = 'Registration Request Received';
  const greeting = `Hello ${parentName},`;
  const body = `
    <p>Thank you for registering with Grow Fitness!</p>
    <p>We have successfully received your application. Our team is currently reviewing your profile and children's enrollment details.</p>
    <p>We will send you an email confirmation as soon as your account is approved. Once approved, you can log in to schedule classes, coordinate with coaches, and pay invoices.</p>
    <p>If you have any questions in the meantime, feel free to reply to this email.</p>
  `;
  const text = `Hello ${parentName},

Thank you for registering with Grow Fitness. We have received your request to join, and our team is currently reviewing it.

We will notify you via email as soon as your account has been approved.

Best regards,
Grow Fitness Team`;

  return {
    subject: 'Registration Request Received - Grow Fitness',
    html: getHtmlTemplate({ title, greeting, body }),
    text,
  };
}

// 4. Parent Registration Approved
export function getParentRegistrationApprovedEmail(parentName: string, portalUrl: string) {
  const title = 'Account Approved';
  const greeting = `Hello ${parentName},`;
  const body = `
    <p>We are delighted to inform you that your Grow Fitness account has been approved!</p>
    <p>You can now log in to the Parent Portal to view schedules, manage enrollments, and check invoice statuses.</p>
  `;
  const text = `Hello ${parentName}, your Grow Fitness account has been approved. You can now sign in at: ${portalUrl}`;

  return {
    subject: 'Account Approved - Welcome to Grow Fitness!',
    html: getHtmlTemplate({ title, greeting, body, actionUrl: portalUrl, actionText: 'Go to Parent Portal' }),
    text,
  };
}

export function getParentRegistrationApprovedSMS(parentName: string, portalUrl: string): string {
  return `Hello ${parentName}, your Grow Fitness account has been approved! You can now sign in at: ${portalUrl}`;
}

// 5. Parent Registration Rejected
export function getParentRegistrationRejectedEmail(parentName: string) {
  const title = 'Registration Status Update';
  const greeting = `Hello ${parentName},`;
  const body = `
    <p>Thank you for your interest in Grow Fitness.</p>
    <p>We have reviewed your registration request, and unfortunately, we are unable to approve your application at this time.</p>
    <p>If you believe this is in error or would like to submit additional information, please feel free to reach out to our support team.</p>
  `;
  const text = `Hello ${parentName}, your account registration request could not be approved at this time. Please contact support if you have any questions.`;

  return {
    subject: 'Registration Update - Grow Fitness',
    html: getHtmlTemplate({ title, greeting, body }),
    text,
  };
}

export function getParentRegistrationRejectedSMS(parentName: string): string {
  return `Hi ${parentName}, unfortunately your Grow Fitness registration request could not be approved at this time. Please contact support for assistance.`;
}

// 6. Free Session Confirmed
export function getFreeSessionConfirmationEmail(
  parentName: string,
  kidName: string,
  dateTimeStr: string,
  locationName: string,
  locationAddress: string,
  portalUrl: string
) {
  const title = 'Free Session Confirmed';
  const greeting = `Hello ${parentName},`;
  const body = `
    <p>We are pleased to confirm that the free session request for <strong>${kidName}</strong> has been scheduled successfully!</p>
    <div class="highlight-box">
      <strong>Session Details:</strong><br>
      Student: ${kidName}<br>
      Date & Time: ${dateTimeStr}<br>
      Location: ${locationName}<br>
      Address: ${locationAddress}
    </div>
    <p>We look forward to seeing ${kidName} there! Please make sure to arrive 10 minutes early. If you need to make changes, you can manage your bookings in the portal.</p>
  `;
  const text = `Hello ${parentName}, your free session request for ${kidName} has been confirmed!
Date & Time: ${dateTimeStr}
Location: ${locationName} (${locationAddress})

Log in to manage: ${portalUrl}`;

  return {
    subject: 'Free Session Confirmed - Grow Fitness',
    html: getHtmlTemplate({ title, greeting, body, actionUrl: portalUrl, actionText: 'Go to Portal' }),
    text,
  };
}

export function getFreeSessionConfirmationSMS(
  parentName: string,
  kidName: string,
  dateTimeStr: string,
  locationName: string,
  locationAddress: string,
  portalUrl: string
): string {
  return `Hi ${parentName}, your free session request for ${kidName} is confirmed for ${dateTimeStr} at ${locationName} (${locationAddress}). Manage at: ${portalUrl}`;
}

// 7. Session Schedule Update
export function getSessionUpdateEmail(
  recipientName: string,
  sessionTitle: string,
  dateTimeStr: string,
  locationName: string,
  changesStr: string
) {
  const title = 'Session Updated';
  const greeting = `Hello ${recipientName},`;
  const body = `
    <p>This email is to notify you that details for the session "<strong>${sessionTitle}</strong>" have been updated.</p>
    <div class="highlight-box">
      <strong>Session Information:</strong><br>
      Title: ${sessionTitle}<br>
      Date & Time: ${dateTimeStr}<br>
      Location: ${locationName}<br>
      <span style="color: #e11d48; font-weight: bold;">Applied Changes: ${changesStr}</span>
    </div>
    <p>Please review these changes carefully. If this new time or venue conflicts with your schedule, please access your portal dashboard or get in touch with us immediately.</p>
  `;
  const text = `Hello ${recipientName}, the session "${sessionTitle}" has been updated: ${changesStr}.
Current Date/Time: ${dateTimeStr}
Location: ${locationName}`;

  return {
    subject: `Session Update: ${sessionTitle}`,
    html: getHtmlTemplate({ title, greeting, body }),
    text,
  };
}

export function getSessionUpdateSMS(
  sessionTitle: string,
  dateTimeStr: string,
  changesStr: string,
  portalUrl: string
): string {
  return `Grow Fitness: Session "${sessionTitle}" (${dateTimeStr}) has been updated: ${changesStr}. Please log in to view: ${portalUrl}`;
}

// 8. Urgent Session Cancelled
export function getSessionCancelledEmail(
  recipientName: string,
  sessionTitle: string,
  dateTimeStr: string,
  locationName: string
) {
  const title = 'URGENT: Session Cancelled';
  const greeting = `Hello ${recipientName},`;
  const body = `
    <p style="color: #e11d48; font-weight: bold; font-size: 16px;">Please note that the following scheduled session has been cancelled:</p>
    <div class="highlight-box" style="border-left-color: #e11d48;">
      <strong>Cancelled Session Details:</strong><br>
      Title: ${sessionTitle}<br>
      Scheduled Date & Time: ${dateTimeStr}<br>
      Location: ${locationName}
    </div>
    <p>We apologize for any inconvenience this cancellation may cause. If this is part of a recurring schedule or if you wish to re-enroll or schedule a makeup class, please check options in your portal.</p>
  `;
  const text = `URGENT: The session "${sessionTitle}" scheduled on ${dateTimeStr} at ${locationName} has been CANCELLED. We apologize for the inconvenience.`;

  return {
    subject: `URGENT: Session Cancelled - ${sessionTitle}`,
    html: getHtmlTemplate({ title, greeting, body }),
    text,
  };
}

export function getSessionCancelledSMS(sessionTitle: string, dateTimeStr: string): string {
  return `URGENT: Grow Fitness session "${sessionTitle}" on ${dateTimeStr} has been CANCELLED. Check portal for reschedule options.`;
}

// 9. Session Deleted
export function getSessionDeletedEmail(
  recipientName: string,
  sessionTitle: string,
  dateTimeStr: string,
  locationName: string
) {
  const title = 'Session Cancelled & Removed';
  const greeting = `Hello ${recipientName},`;
  const body = `
    <p>The session "<strong>${sessionTitle}</strong>" has been cancelled and removed from the active schedule.</p>
    <div class="highlight-box">
      <strong>Removed Session Details:</strong><br>
      Title: ${sessionTitle}<br>
      Originally Scheduled: ${dateTimeStr}<br>
      Location: ${locationName}
    </div>
    <p>If you have any questions or require makeup session options, please check your portal or contact administrative support.</p>
  `;
  const text = `The session "${sessionTitle}" scheduled on ${dateTimeStr} at ${locationName} has been deleted. Please check your portal for details.`;

  return {
    subject: `Session Removed: ${sessionTitle}`,
    html: getHtmlTemplate({ title, greeting, body }),
    text,
  };
}

export function getSessionDeletedSMS(sessionTitle: string, dateTimeStr: string): string {
  return `Grow Fitness: Session "${sessionTitle}" on ${dateTimeStr} has been cancelled and removed from the schedule.`;
}

// 10. New Invoice Issued
export function getNewInvoiceEmail(
  recipientName: string,
  invoiceId: string,
  amount: number,
  dueDateStr: string,
  portalUrl: string
) {
  const title = 'New Invoice Issued';
  const greeting = `Hello ${recipientName},`;
  const body = `
    <p>A new invoice has been issued for your Grow Fitness sessions.</p>
    <div class="highlight-box">
      <strong>Invoice Summary:</strong><br>
      Invoice Reference: <code>${invoiceId}</code><br>
      Amount Due: LKR ${amount.toFixed(2)}<br>
      Due Date: ${dueDateStr}
    </div>
    <p>Please log in to the Parent Portal to view detailed itemization and submit your payment. Thank you for your continued support!</p>
  `;
  const text = `Hello ${recipientName}, you have a new invoice from Grow Fitness.
Invoice Reference: ${invoiceId}
Amount Due: LKR ${amount.toFixed(2)}
Due Date: ${dueDateStr}

Log in to pay: ${portalUrl}`;

  return {
    subject: `New Grow Fitness Invoice - Due ${dueDateStr}`,
    html: getHtmlTemplate({ title, greeting, body, actionUrl: portalUrl, actionText: 'View & Pay Invoice' }),
    text,
  };
}

export function getNewInvoiceSMS(
  invoiceId: string,
  amount: number,
  dueDateStr: string,
  portalUrl: string
): string {
  return `Grow Fitness: New invoice ${invoiceId.substring(invoiceId.length - 6)} (LKR ${amount.toFixed(2)}) is due on ${dueDateStr}. Pay here: ${portalUrl}`;
}

// 11. Invoice Update / Payment Status Updated
export function getInvoiceUpdateEmail(
  recipientName: string,
  invoiceId: string,
  status: string,
  amount: number,
  portalUrl: string
) {
  const title = 'Invoice Status Updated';
  const greeting = `Hello ${recipientName},`;
  
  const isPaid = status === 'PAID';
  const statusColor = isPaid ? '#10b981' : '#f59e0b';
  const body = `
    <p>We are writing to let you know that the status of your invoice has been updated.</p>
    <div class="highlight-box">
      <strong>Invoice Details:</strong><br>
      Invoice Reference: <code>${invoiceId}</code><br>
      Amount: LKR ${amount.toFixed(2)}<br>
      Current Status: <span style="color: ${statusColor}; font-weight: bold;">${status}</span>
    </div>
    ${isPaid 
      ? '<p>Thank you very much for your payment! A receipt has been issued and is available for download in your portal account.</p>' 
      : '<p>Please log in to your Parent Portal to complete any pending balance.</p>'
    }
  `;
  const text = `Hello ${recipientName}, your Grow Fitness invoice ${invoiceId} status has been updated to: ${status}.
Total Amount: LKR ${amount.toFixed(2)}
Portal: ${portalUrl}`;

  return {
    subject: `Invoice Status Update (${status}) - Grow Fitness`,
    html: getHtmlTemplate({ title, greeting, body, actionUrl: portalUrl, actionText: 'Go to Portal' }),
    text,
  };
}

export function getInvoiceUpdateSMS(invoiceId: string, status: string, portalUrl: string): string {
  const shortId = invoiceId.substring(invoiceId.length - 6);
  return `Grow Fitness: Invoice status for #${shortId} has been updated to ${status}. Details: ${portalUrl}`;
}

// 12. Payout Processed (Coach)
export function getCoachPayoutPaidEmail(
  coachName: string,
  invoiceId: string,
  amount: number,
  paymentDateStr: string
) {
  const title = 'Monthly Payout Processed';
  const greeting = `Hello ${coachName},`;
  const body = `
    <p>We are pleased to inform you that your monthly payout has been successfully processed and marked as paid.</p>
    <div class="highlight-box">
      <strong>Payout Details:</strong><br>
      Invoice/Payout Reference: <code>${invoiceId}</code><br>
      Total Amount: LKR ${amount.toFixed(2)}<br>
      Payment Date: ${paymentDateStr}
    </div>
    <p>Thank you for your outstanding contribution and dedication to our athletes! The payment has been sent to your bank account on file. Payout receipts are available in the Coach Portal.</p>
  `;
  const text = `Hello ${coachName}, your monthly payment of LKR ${amount.toFixed(2)} (Ref: ${invoiceId}) has been processed on ${paymentDateStr}. Thank you for your work!`;

  return {
    subject: 'Payout Processed - Grow Fitness',
    html: getHtmlTemplate({ title, greeting, body }),
    text,
  };
}

export function getCoachPayoutPaidSMS(coachName: string, invoiceId: string, amount: number): string {
  const shortId = invoiceId.substring(invoiceId.length - 6);
  return `Hi ${coachName}, your monthly payout of LKR ${amount.toFixed(2)} (Payout Ref: #${shortId}) has been processed. Thank you for your dedication!`;
}

// 13. Balance / Payment Reminder
export function getPaymentReminderEmail(
  recipientName: string,
  invoiceId: string,
  amount: number,
  dueDateStr: string,
  portalUrl: string
) {
  const title = 'Outstanding Invoice Reminder';
  const greeting = `Hello ${recipientName},`;
  const body = `
    <p>This is a friendly reminder that you have an outstanding invoice with Grow Fitness.</p>
    <div class="highlight-box">
      <strong>Pending Balance Summary:</strong><br>
      Invoice Reference: <code>${invoiceId}</code><br>
      Amount Outstanding: LKR ${amount.toFixed(2)}<br>
      Due Date: ${dueDateStr}
    </div>
    <p>Please log in to your Parent Portal to complete this payment before the end of the month to maintain uninterrupted access to scheduled sessions.</p>
  `;
  const text = `Friendly reminder: Grow Fitness invoice ${invoiceId} (LKR ${amount.toFixed(2)}) is outstanding. Please log in to complete your payment before month-end.
Pay here: ${portalUrl}`;

  return {
    subject: 'Reminder: Outstanding Grow Fitness Invoice',
    html: getHtmlTemplate({ title, greeting, body, actionUrl: portalUrl, actionText: 'Pay Invoice' }),
    text,
  };
}

export function getPaymentReminderSMS(
  invoiceId: string,
  amount: number,
  dueDateStr: string,
  portalUrl: string
): string {
  const shortId = invoiceId.substring(invoiceId.length - 6);
  return `Friendly reminder: Grow Fitness invoice #${shortId} (LKR ${amount.toFixed(2)}) is outstanding. Please log in before month-end to pay: ${portalUrl}`;
}
