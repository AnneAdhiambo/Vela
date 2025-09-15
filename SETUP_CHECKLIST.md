# Vela Chrome Extension Setup Checklist

## ✅ Prerequisites
- [ ] Node.js 18+ installed
- [ ] Chrome browser for testing
- [ ] EmailJS account created at [emailjs.com](https://emailjs.com)

## ✅ Installation Steps

### 1. Clone and Install
```bash
git clone <repository-url>
cd vela-chrome-extension
npm install
```

### 2. Configure EmailJS
- [ ] Follow the detailed guide in `VELA_EMAIL_SETUP.md`
- [ ] Set up email service with Vela email server credentials
- [ ] Create magic link email template
- [ ] Get your EmailJS public key

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your EmailJS credentials
VITE_EMAILJS_SERVICE_ID=service_vela_mail
VITE_EMAILJS_TEMPLATE_ID=template_vela_magic_link
VITE_EMAILJS_PUBLIC_KEY=your_actual_public_key_here
```

### 4. Validate Configuration
```bash
# Check if EmailJS is properly configured
npm run validate-emailjs
```

### 5. Build Extension
```bash
# Build the extension
npm run build
```

### 6. Load in Chrome
- [ ] Open `chrome://extensions/`
- [ ] Enable "Developer mode" (toggle in top right)
- [ ] Click "Load unpacked"
- [ ] Select the `dist` folder from your project

### 7. Test Authentication
- [ ] Open a new tab (should show Vela welcome screen)
- [ ] Enter your email address
- [ ] Check your email for the magic link
- [ ] Click the magic link to authenticate
- [ ] Verify you're logged into the dashboard

## ✅ Troubleshooting

### Common Issues

**Import Error: "@emailjs/browser" not found**
```bash
npm install @emailjs/browser
npm run build
```

**Environment variables not loading**
- Ensure `.env` file is in project root
- Restart development server after changes
- Verify variables start with `VITE_`

**Email not sending**
- Check EmailJS service configuration
- Verify email server credentials
- Test EmailJS service in dashboard

**Magic link not working**
- Check browser console for errors
- Verify link hasn't expired (15 minutes)
- Ensure correct template ID is used

### Validation Commands
```bash
# Check EmailJS configuration
npm run validate-emailjs

# Check TypeScript compilation
npx tsc --noEmit

# Run tests
npm test

# Check for linting issues
npm run lint
```

## ✅ Development Workflow

### Daily Development
```bash
# Start development server
npm run dev

# In another terminal, build extension
npm run build

# Reload extension in Chrome after changes
```

### Testing Changes
1. Make code changes
2. Run `npm run build`
3. Go to `chrome://extensions/`
4. Click reload button on Vela extension
5. Open new tab to test changes

### Before Committing
```bash
# Run all checks
npm run lint
npm test
npm run build
npm run validate-emailjs
```

## ✅ Production Deployment

### Pre-deployment Checklist
- [ ] All tests passing
- [ ] EmailJS service working
- [ ] Extension builds without errors
- [ ] Authentication flow tested
- [ ] Spotify integration tested (if applicable)
- [ ] All environment variables configured

### Build for Production
```bash
# Clean build
rm -rf dist/
npm run build

# Verify build contents
ls -la dist/
```

### Chrome Web Store Submission
- [ ] Update version in `manifest.json`
- [ ] Create extension package (zip dist folder)
- [ ] Submit to Chrome Web Store
- [ ] Test published extension

## ✅ Team Collaboration

### New Team Member Setup
1. Share this checklist
2. Provide EmailJS credentials (securely)
3. Walk through authentication test
4. Verify development environment works

### Sharing Credentials
- **Never commit `.env` files**
- Share EmailJS credentials through secure channels
- Use different credentials for development/production

### Code Review Checklist
- [ ] No hardcoded credentials
- [ ] EmailJS integration working
- [ ] Authentication flow tested
- [ ] Error handling implemented
- [ ] TypeScript types updated
- [ ] Tests added/updated

## ✅ Support Resources

### Documentation
- `VELA_EMAIL_SETUP.md` - Detailed EmailJS setup
- `EMAILJS_SETUP.md` - General EmailJS guide
- `setup-emailjs.md` - Quick setup reference
- `TESTING.md` - Testing guide

### Commands Reference
```bash
npm run dev              # Start development server
npm run build           # Build extension
npm run test            # Run tests
npm run lint            # Check code quality
npm run validate-emailjs # Check EmailJS config
```

### Getting Help
1. Check browser console for errors
2. Run validation commands
3. Review setup documentation
4. Check EmailJS dashboard for service status
5. Test with different email addresses

## ✅ Success Criteria

Your setup is complete when:
- [ ] Extension loads without errors
- [ ] Welcome screen appears for new users
- [ ] Magic link emails are sent successfully
- [ ] Authentication works end-to-end
- [ ] Dashboard loads after authentication
- [ ] Settings and preferences work
- [ ] Timer and task functionality works
- [ ] Spotify integration works (optional)

🎉 **Congratulations!** Your Vela Chrome Extension is ready for development!