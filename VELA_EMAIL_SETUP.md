# Vela Email Setup Guide

This guide walks you through setting up EmailJS with the Vela email server for magic link authentication.

## Email Server Details

- **Email Address**: `no-reply@vela.top`
- **Password**: `tqoSxV+Up.K_Rw%D`
- **SMTP Server**: `mail.vela.top`
- **SMTP Port**: `465` (SSL/TLS)
- **IMAP Server**: `mail.vela.top`
- **IMAP Port**: `993`

## Step-by-Step Setup

### 1. Create EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address
4. Log in to your dashboard

### 2. Add Email Service

1. In your EmailJS dashboard, click **Email Services**
2. Click **Add New Service**
3. Select **Other** (for custom SMTP)
4. Fill in the service details:

   **Service Configuration:**

   ```
   Service Name: Vela Mail Service
   Service ID: service_vela_mail

   SMTP Settings:
   Email: no-reply@vela.top
   Password: tqoSxV+Up.K_Rw%D
   SMTP Server: mail.vela.top
   Port: 465
   Security: SSL/TLS
   ```

5. Click **Test Connection** to verify the settings
6. If successful, click **Create Service**
7. Note down the **Service ID**: `service_vela_mail`

### 3. Create Email Template

1. Go to **Email Templates**
2. Click **Create New Template**
3. Configure the template:

   **Template Settings:**

   ```
   Template Name: Vela Magic Link Authentication
   Template ID: template_vela_magic_link
   ```

4. Set up the email content:

   **Subject Line:**

   ```
   🔐 Your Vela Sign-in Link - Expires in 15 minutes
   ```

   **HTML Content:**

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
           background-color: #f8fafc;
         }
         .container {
           max-width: 600px;
           margin: 0 auto;
           background: white;
           padding: 40px;
           border-radius: 12px;
           box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
           margin-top: 20px;
         }
         .header {
           text-align: center;
           margin-bottom: 30px;
           padding-bottom: 20px;
           border-bottom: 2px solid #e2e8f0;
         }
         .logo {
           font-size: 36px;
           font-weight: bold;
           color: #4f46e5;
           margin-bottom: 10px;
           letter-spacing: -1px;
         }
         .subtitle {
           color: #64748b;
           font-size: 16px;
           margin: 0;
         }
         .button {
           display: inline-block;
           background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
           color: white;
           padding: 16px 32px;
           text-decoration: none;
           border-radius: 8px;
           font-weight: 600;
           margin: 25px 0;
           font-size: 16px;
           box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
           transition: all 0.2s ease;
         }
         .button:hover {
           background: linear-gradient(135deg, #4338ca 0%, #6d28d9 100%);
           transform: translateY(-1px);
           box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
         }
         .footer {
           margin-top: 40px;
           padding-top: 20px;
           border-top: 1px solid #e2e8f0;
           font-size: 14px;
           color: #64748b;
           text-align: center;
         }
         .warning {
           background: linear-gradient(135deg, #fef3cd 0%, #fde68a 100%);
           border: 1px solid #f59e0b;
           padding: 20px;
           border-radius: 8px;
           margin: 25px 0;
         }
         .warning-title {
           color: #92400e;
           font-weight: 600;
           margin-bottom: 10px;
           display: flex;
           align-items: center;
           gap: 8px;
         }
         .warning ul {
           margin: 10px 0 0 0;
           padding-left: 20px;
           color: #92400e;
         }
         .link-box {
           background: #f1f5f9;
           padding: 15px;
           border-radius: 6px;
           border-left: 4px solid #4f46e5;
           margin: 20px 0;
           word-break: break-all;
           font-family: "Monaco", "Menlo", monospace;
           font-size: 13px;
           color: #475569;
         }
       </style>
     </head>
     <body>
       <div class="container">
         <div class="header">
           <div class="logo">⚡ Vela</div>
           <p class="subtitle">Productivity Dashboard</p>
           <h1 style="margin: 20px 0 0 0; color: #1e293b;">Welcome back!</h1>
         </div>

         <p style="font-size: 16px; margin-bottom: 20px;">
           Hello {{to_name}}! 👋
         </p>

         <p style="font-size: 16px; line-height: 1.6;">
           You requested to sign in to your Vela productivity dashboard. Click
           the button below to access your focus sessions, tasks, and progress
           tracking:
         </p>

         <div style="text-align: center; margin: 30px 0;">
           <a href="{{magic_link}}" class="button">🚀 Sign in to Vela</a>
         </div>

         <div class="warning">
           <div class="warning-title">🔒 Security Notice</div>
           <ul>
             <li>
               This link expires in <strong>{{expiry_minutes}} minutes</strong>
             </li>
             <li>Don't share this link with anyone</li>
             <li>
               If you didn't request this, you can safely ignore this email
             </li>
             <li>Only use this link if you initiated the sign-in process</li>
           </ul>
         </div>

         <p style="font-size: 14px; color: #64748b; margin: 25px 0;">
           <strong>Button not working?</strong> Copy and paste this link into
           your browser:
         </p>

         <div class="link-box">{{magic_link}}</div>

         <div class="footer">
           <p>
             This email was sent to <strong>{{to_email}}</strong> because you
             requested to sign in to Vela.
           </p>
           <p style="margin-top: 15px;">
             Questions? Contact us at
             <a href="mailto:support@vela.top" style="color: #4f46e5;"
               >support@vela.top</a
             >
           </p>
           <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">
             © 2024 Vela. All rights reserved.
           </p>
         </div>
       </div>
     </body>
   </html>
   ```

   **Plain Text Content (Fallback):**

   ```
   Welcome to Vela!

   You requested to sign in to your Vela productivity dashboard.

   Click this link to sign in: {{magic_link}}

   Security Notice:
   - This link expires in {{expiry_minutes}} minutes
   - Don't share this link with anyone
   - If you didn't request this, you can safely ignore this email

   This email was sent to {{to_email}} because you requested to sign in to Vela.

   Questions? Contact us at support@vela.top

   © 2024 Vela. All rights reserved.
   ```

5. **Configure Template Variables:**
   Make sure these variables are set up in your EmailJS template:

   - `{{to_name}}` - Recipient's name (extracted from email)
   - `{{to_email}}` - Recipient's email address
   - `{{from_name}}` - Sender name (Vela Team)
   - `{{reply_to}}` - Reply-to address (no-reply@vela.top)
   - `{{user_email}}` - User's email (same as to_email)
   - `{{magic_link}}` - The magic link URL
   - `{{app_name}}` - Application name (Vela)
   - `{{expiry_minutes}}` - Link expiration time (15)
   - `{{message}}` - Fallback message with link

6. Click **Save** to create the template

### 4. Get Your Public Key

1. Go to **Account** in your EmailJS dashboard
2. Find your **Public Key** (starts with something like `user_...`)
3. Copy this key

### 5. Update Environment Variables

Update your `.env` file with the EmailJS credentials:

```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_vela_mail
VITE_EMAILJS_TEMPLATE_ID=template_vela_magic_link
VITE_EMAILJS_PUBLIC_KEY=your_actual_public_key_here
```

### 6. Test the Setup

1. **Build and run the extension:**

   ```bash
   npm install
   npm run build
   ```

2. **Load in Chrome:**

   - Go to `chrome://extensions/`
   - Enable Developer mode
   - Click "Load unpacked"
   - Select the `dist` folder

3. **Test authentication:**
   - Open a new tab
   - Enter your email address
   - Check your email for the magic link
   - Click the link to sign in

## Troubleshooting

### Common Issues

**1. Email not sending:**

- Verify SMTP settings are correct
- Check that the email server is accessible
- Ensure the password is entered correctly
- Test the EmailJS service connection

**2. Template not found:**

- Verify the template ID matches exactly: `template_vela_magic_link`
- Make sure the template is published (not in draft)

**3. Magic link not working:**

- Check browser console for errors
- Verify the link format is correct
- Ensure the token hasn't expired (15 minutes)

**4. Environment variables not loading:**

- Make sure `.env` file is in the project root
- Restart your development server after changing `.env`
- Verify variables start with `VITE_`

### Testing Tips

1. **Use EmailJS Test Feature:**

   - Go to your template in EmailJS dashboard
   - Click "Test it" to send a test email
   - Use sample data to verify the template works

2. **Check Browser Console:**

   - Open Chrome DevTools (F12)
   - Look for EmailJS-related errors
   - Check network tab for failed requests

3. **Verify Email Delivery:**
   - Check spam/junk folders
   - Verify the email address is correct
   - Test with different email providers

## Security Notes

- The email credentials are stored securely in EmailJS
- Magic links expire after 15 minutes for security
- Each magic link can only be used once
- Users are automatically logged out after 30 days of inactivity

## Production Considerations

- Monitor email delivery rates
- Set up email authentication (SPF, DKIM, DMARC)
- Consider upgrading EmailJS plan for higher limits
- Monitor for suspicious authentication attempts
- Set up backup email delivery methods

## Support

If you encounter issues:

1. Check the EmailJS dashboard for service status
2. Verify your email server is working
3. Test the SMTP connection independently
4. Check the browser console for detailed error messages
5. Contact EmailJS support if needed
