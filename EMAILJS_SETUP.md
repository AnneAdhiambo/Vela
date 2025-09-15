# EmailJS Setup for Vela Chrome Extension

This guide explains how to set up EmailJS for sending magic link authentication emails in the Vela Chrome Extension.

## 1. Create EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

## 2. Create Email Service

1. In your EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the setup instructions for your provider
5. Note down your **Service ID** (e.g., `service_vela`)

### Gmail Setup Example

### Custom Email Server Setup (Vela.top)

- Select **Other** or **Custom SMTP**
- Enter the following settings:
  - **Email**: `no-reply@vela.top`
  - **Password**: `tqoSxV+Up.K_Rw%D`
  - **SMTP Server**: `mail.vela.top`
  - **SMTP Port**: `465`
  - **Security**: SSL/TLS
- Test the connection
- Save the service with ID: `service_vela_mail`

### Alternative: Gmail Setup

- Select **Gmail**
- Click **Connect Account**
- Authorize EmailJS to access your Gmail
- Your service will be created automatically

## 3. Create Email Template

1. Go to **Email Templates** in your dashboard
2. Click **Create New Template**
3. Use the following template:

### Template Settings

- **Template Name**: `Vela Magic Link`
- **Template ID**: `template_vela_magic_link` (note this down)

### Email Template Content

**Subject**: `Sign in to Vela - Your Magic Link`

**HTML Content**:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sign in to Vela</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
          sans-serif;
        line-height: 1.6;
        color: #333;
        margin: 0;
        padding: 0;
        background-color: #f5f5f5;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background: white;
        padding: 40px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
      }
      .logo {
        font-size: 32px;
        font-weight: bold;
        color: #4f46e5;
        margin-bottom: 10px;
      }
      .button {
        display: inline-block;
        background: #4f46e5;
        color: white;
        padding: 15px 30px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
        margin: 20px 0;
      }
      .button:hover {
        background: #4338ca;
      }
      .footer {
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #eee;
        font-size: 14px;
        color: #666;
      }
      .warning {
        background: #fef3cd;
        border: 1px solid #fecaca;
        padding: 15px;
        border-radius: 6px;
        margin: 20px 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">Vela</div>
        <h1>Sign in to your account</h1>
      </div>

      <p>Hello,</p>

      <p>
        You requested to sign in to Vela. Click the button below to access your
        productivity dashboard:
      </p>

      <div style="text-align: center;">
        <a href="{{magic_link}}" class="button">Sign in to Vela</a>
      </div>

      <div class="warning">
        <strong>⚠️ Security Notice:</strong>
        <ul>
          <li>This link expires in {{expiry_minutes}} minutes</li>
          <li>Don't share this link with anyone</li>
          <li>If you didn't request this, you can safely ignore this email</li>
        </ul>
      </div>

      <p>
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p
        style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace;"
      >
        {{magic_link}}
      </p>

      <div class="footer">
        <p>
          This email was sent to {{to_email}} because you requested to sign in
          to {{app_name}}.
        </p>
        <p>If you have any questions, please contact our support team.</p>
      </div>
    </div>
  </body>
</html>
```

**Text Content** (fallback):

```
Sign in to Vela

Hello,

You requested to sign in to Vela. Click the link below to access your productivity dashboard:

{{magic_link}}

Security Notice:
- This link expires in {{expiry_minutes}} minutes
- Don't share this link with anyone
- If you didn't request this, you can safely ignore this email

This email was sent to {{to_email}} because you requested to sign in to {{app_name}}.
```

### Template Variables

Make sure these variables are configured:

- `{{to_email}}` - Recipient's email address
- `{{user_email}}` - User's email (same as to_email)
- `{{magic_link}}` - The magic link URL
- `{{app_name}}` - Application name (Vela)
- `{{expiry_minutes}}` - Link expiration time (15)

## 4. Get Your Public Key

1. Go to **Account** in your EmailJS dashboard
2. Find your **Public Key** (starts with something like `user_...`)
3. Note this down

## 5. Configure Environment Variables

Create a `.env` file in your project root:

```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_vela_mail
VITE_EMAILJS_TEMPLATE_ID=template_vela_magic_link
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

**For Vela Team:** Use the detailed setup guide in `VELA_EMAIL_SETUP.md` which includes the specific email server configuration and credentials.

Replace the values with your actual EmailJS credentials.

## 6. Test the Setup

1. Start your development server: `npm run dev`
2. Build the extension: `npm run build`
3. Load the extension in Chrome
4. Open a new tab and try to sign in with your email
5. Check your email for the magic link

## 7. Troubleshooting

### Common Issues

**Email not sending:**

- Check your EmailJS service is properly connected
- Verify your public key is correct
- Check browser console for errors
- Make sure your email service has sufficient quota

**Template not found:**

- Verify the template ID matches exactly
- Check that the template is published (not draft)

**Magic link not working:**

- Check that the link format is correct
- Verify the token is being generated properly
- Check browser console for authentication errors

### Testing Tips

1. **Use the EmailJS Test Feature:**

   - Go to your template in EmailJS dashboard
   - Click "Test it" to send a test email
   - Use sample data to verify the template works

2. **Check Browser Console:**

   - Open Chrome DevTools
   - Look for EmailJS-related errors
   - Check network tab for failed requests

3. **Verify Environment Variables:**
   - Make sure `.env` file is in the project root
   - Restart your development server after changing `.env`
   - Check that variables start with `VITE_`

## 8. Production Considerations

### Email Deliverability

- Use a professional email address for sending
- Set up SPF, DKIM, and DMARC records
- Monitor your sender reputation
- Consider using a dedicated email service for production

### Rate Limiting

- EmailJS has rate limits on free accounts
- Monitor your usage in the EmailJS dashboard
- Consider upgrading for higher limits in production

### Security

- Keep your EmailJS credentials secure
- Don't commit `.env` files to version control
- Use different credentials for development and production
- Monitor for suspicious authentication attempts

### Monitoring

- Set up alerts for failed email sends
- Monitor authentication success rates
- Track magic link click rates
- Log authentication attempts for security

## 9. Alternative Email Services

If you need more advanced features, consider these alternatives:

- **SendGrid** - Enterprise email delivery
- **Mailgun** - Developer-focused email API
- **AWS SES** - Amazon's email service
- **Postmark** - Transactional email service

Each requires more setup but offers better deliverability and features for production use.

## Support

If you encounter issues:

1. Check the [EmailJS Documentation](https://www.emailjs.com/docs/)
2. Review the browser console for errors
3. Test your EmailJS setup independently
4. Check your email service connection status
