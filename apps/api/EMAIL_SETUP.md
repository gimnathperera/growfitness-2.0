# Gmail Email Setup Guide

This guide explains how to configure Gmail SMTP to send emails from your application.

## Required Information

To use Gmail SMTP, you need the following:

1. **Gmail Address**: Your company Gmail account (e.g., `yourcompany@gmail.com`)
2. **Gmail App Password**: A special password generated for applications (NOT your regular Gmail password)

## Step-by-Step Setup

### 1. Enable 2-Step Verification

Gmail requires 2-Step Verification to be enabled before you can generate an App Password.

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left sidebar
3. Under "Signing in to Google", find **2-Step Verification**
4. Follow the prompts to enable 2-Step Verification (if not already enabled)

### 2. Generate App Password

1. Go back to **Security** settings
2. Under "Signing in to Google", find **App passwords** (this appears after enabling 2-Step Verification)
3. Click on **App passwords**
4. Select **Mail** as the app
5. Select **Other (Custom name)** as the device
6. Enter a name like "Grow Fitness API" or "Company Email Service"
7. Click **Generate**
8. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)
   - ⚠️ **Important**: This password will only be shown once. Save it securely!

### 3. Configure Environment Variables

Add the following to your `.env` file in `apps/api/`:

```env
# Email configuration (Gmail SMTP)
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=yourcompany@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
SMTP_FROM=yourcompany@gmail.com
```

**Important Notes:**
- Replace `yourcompany@gmail.com` with your actual Gmail address
- Replace `abcd efgh ijkl mnop` with the App Password you generated (you can include or remove spaces - both work)
- `SMTP_FROM` is the "From" address shown in emails (usually same as `SMTP_USER`)

### 4. Test Email Configuration

After configuring, restart your API server. The email provider will:
- Initialize the SMTP transporter on startup
- Log success or error messages in the console
- Fall back to console logging if email is disabled or misconfigured

## Troubleshooting

### "Invalid login" or "Authentication failed"
- Make sure you're using an **App Password**, not your regular Gmail password
- Verify 2-Step Verification is enabled
- Check that the App Password was copied correctly (no extra spaces)

### "Connection timeout" or "Connection refused"
- Check your firewall/network settings
- Verify `SMTP_PORT=587` (or try `465` for SSL)
- Some networks block SMTP ports - you may need to whitelist `smtp.gmail.com`

### Emails not sending but no errors
- Check `EMAIL_ENABLED=true` in your `.env` file
- Check server logs for email-related messages
- Verify all SMTP variables are set correctly

### Using a Google Workspace Account

If you're using Google Workspace (formerly G Suite):
- The setup process is the same
- Use your Google Workspace email address (e.g., `admin@yourcompany.com`)
- App Passwords work the same way
- Make sure your admin hasn't disabled App Passwords for your organization

## Security Best Practices

1. **Never commit `.env` file** - Keep your App Password secret
2. **Use environment-specific passwords** - Generate separate App Passwords for dev/staging/production
3. **Rotate passwords regularly** - Regenerate App Passwords periodically
4. **Monitor email usage** - Check Google Account activity for suspicious email sending

## Alternative: Using OAuth2 (Advanced)

For production applications, OAuth2 is more secure than App Passwords but requires more setup:
- Requires Google Cloud Console project setup
- Requires OAuth2 credentials (Client ID, Client Secret)
- More complex token management

For most use cases, App Passwords are sufficient and easier to set up.
