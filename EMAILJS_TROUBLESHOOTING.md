# EmailJS Troubleshooting Guide

## Common Error: 422 "The recipients address is empty"

This error occurs when EmailJS cannot find the recipient email address in the template parameters.

### ✅ Quick Fix

1. **Check your EmailJS template configuration:**
   - Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
   - Open your template (`template_vela_magic_link`)
   - Make sure the "To Email" field is set to `{{to_email}}`

2. **Verify template variables:**
   Your template should use these variables:
   ```
   To: {{to_email}}
   From: {{from_name}}
   Reply-to: {{reply_to}}
   Subject: Your subject here
   ```

3. **Check template content:**
   Make sure your email template includes `{{to_email}}` in the recipient field, not just in the content.

### 🔧 Step-by-Step Fix

#### 1. EmailJS Service Setup
- Service ID: `service_vela_mail`
- Email: `no-reply@vela.top`
- SMTP Server: `mail.vela.top:465` (SSL/TLS)

#### 2. EmailJS Template Setup
- Template ID: `template_vela_magic_link`
- **Important**: In the template settings, set:
  - **To Email**: `{{to_email}}`
  - **From Name**: `{{from_name}}`
  - **Reply To**: `{{reply_to}}`

#### 3. Template Variables
Based on your template, make sure these variables are available:
```
{{to_name}} - Recipient name
{{magic_link}} - The authentication link
{{expiry_minutes}} - Link expiration time (15)
{{to_email}} - Recipient email (REQUIRED)
{{email}} - Recipient email (alternative parameter)
```

**Important**: Your template expects both `{{to_email}}` and `{{email}}` parameters. Make sure both are configured in the EmailJS template settings.

### 🐛 Other Common Issues

#### Error: "Service not found"
- Check `VITE_EMAILJS_SERVICE_ID` in your `.env` file
- Verify the service exists in your EmailJS dashboard
- Make sure the service is active

#### Error: "Template not found"
- Check `VITE_EMAILJS_TEMPLATE_ID` in your `.env` file
- Verify the template exists and is published (not draft)
- Make sure template ID matches exactly

#### Error: "Invalid public key"
- Check `VITE_EMAILJS_PUBLIC_KEY` in your `.env` file
- Get the correct key from EmailJS Account settings
- Make sure there are no extra spaces or characters

#### Error: "CORS policy"
- EmailJS should work from Chrome extensions
- If testing locally, make sure you're using `http://localhost` or `http://127.0.0.1`
- Check if your domain is allowed in EmailJS settings

### 🧪 Testing Steps

1. **Test EmailJS configuration:**
   ```bash
   npm run test-emailjs
   ```

2. **Test in EmailJS dashboard:**
   - Go to your template
   - Click "Test it"
   - Use sample data to verify it works

3. **Test in extension:**
   - Build and load extension
   - Try to sign in with your email
   - Check browser console for detailed errors

### 🔍 Debugging Tips

1. **Check browser console:**
   - Look for EmailJS-related errors
   - Check network tab for failed requests
   - Verify template parameters are correct

2. **Verify environment variables:**
   ```bash
   # Check if variables are loaded
   console.log(import.meta.env.VITE_EMAILJS_SERVICE_ID)
   console.log(import.meta.env.VITE_EMAILJS_TEMPLATE_ID)
   console.log(import.meta.env.VITE_EMAILJS_PUBLIC_KEY)
   ```

3. **Test with minimal template:**
   Create a simple test template with just:
   ```
   To: {{to_email}}
   Subject: Test
   Message: Hello {{to_name}}!
   ```

### 📋 Checklist for 422 Error

- [ ] EmailJS service is created and active
- [ ] Template exists and is published
- [ ] Template "To Email" field is set to `{{to_email}}`
- [ ] All required variables are in `.env` file
- [ ] Environment variables are loaded correctly
- [ ] Template parameters match what's being sent
- [ ] No typos in variable names
- [ ] EmailJS public key is correct

### 🆘 Still Having Issues?

1. **Check EmailJS service status:**
   - Go to EmailJS dashboard
   - Verify service connection
   - Test email sending manually

2. **Verify email server:**
   - Test SMTP connection independently
   - Check if email server is accessible
   - Verify credentials are correct

3. **Contact support:**
   - EmailJS support: https://www.emailjs.com/docs/
   - Check EmailJS community forums
   - Review EmailJS documentation

### 📧 Working Template Example

Here's a minimal working template configuration:

**Template Settings:**
```
Template Name: Vela Magic Link
Template ID: template_vela_magic_link
To Email: {{to_email}}
From Name: {{from_name}}
Reply To: {{reply_to}}
```

**Subject:**
```
🔐 Your Vela Sign-in Link
```

**Content:**
```html
Hello {{to_name}},

Click here to sign in: {{magic_link}}

This link expires in {{expiry_minutes}} minutes.

Best regards,
{{from_name}}
```

This should resolve the 422 error and allow emails to be sent successfully.