# Quick EmailJS Setup for Vela

## Prerequisites
- EmailJS account created
- Vela email service configured in EmailJS

## Quick Setup Steps

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Update .env with your EmailJS credentials:**
   ```env
   VITE_EMAILJS_SERVICE_ID=service_vela_mail
   VITE_EMAILJS_TEMPLATE_ID=template_vela_magic_link
   VITE_EMAILJS_PUBLIC_KEY=your_actual_public_key_from_emailjs
   ```

3. **Install dependencies and build:**
   ```bash
   npm install
   npm run build
   ```

4. **Load extension in Chrome:**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

5. **Test authentication:**
   - Open new tab
   - Enter email address
   - Check email for magic link
   - Click link to authenticate

## Email Server Details (Already Configured)
- **Service**: no-reply@vela.top
- **SMTP**: mail.vela.top:465 (SSL/TLS)
- **Status**: ✅ Ready to use

## Need Help?
- See `VELA_EMAIL_SETUP.md` for detailed setup
- See `EMAILJS_SETUP.md` for general EmailJS guide
- Check browser console for errors