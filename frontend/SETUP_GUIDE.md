# Vela Landing Page - Setup Guide

This guide will help you set up the Vela landing page with all its features including Supabase, EmailJS, Polar payments, and admin functionality.

## 📋 Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager
- Git installed
- A Supabase account
- An EmailJS account
- A Polar.sh account (for payments)

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install
```

### 2. Environment Variables Setup

Create a `.env.local` file in the `frontend` directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_TOKEN=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# EmailJS Configuration
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
EMAILJS_SERVICE_ID=service_b3yn4ot
EMAILJS_TEMPLATE_WAITLIST=template_zlaheo4
EMAILJS_TEMPLATE_NEWSLETTER=template_your_newsletter_template

# Polar Payments Configuration
POLAR_ACCESS_TOKEN=your_polar_access_token
POLAR_WEBHOOK_SECRET=your_polar_webhook_secret
POLAR_PRODUCT_ID=vela-premium
POLAR_SUCCESS_URL=https://your-domain.com/success?checkout_id={CHECKOUT_ID}

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## 🗄️ Database Setup (Supabase)

### 1. Create Tables

Run these SQL commands in your Supabase SQL editor:

```sql
-- Create waitlist table
CREATE TABLE waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'notified', 'converted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscribers table
CREATE TABLE subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'unsubscribed')),
  subscription_type TEXT DEFAULT 'weekly' CHECK (subscription_type IN ('weekly', 'daily', 'monthly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_users table
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);
```

### 2. Set Up Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for waitlist and subscribers
CREATE POLICY "Allow anonymous inserts on waitlist" ON waitlist
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts on subscribers" ON subscribers
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users to read all data
CREATE POLICY "Allow authenticated read on waitlist" ON waitlist
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read on subscribers" ON subscribers
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admin users policies
CREATE POLICY "Allow admin read on admin_users" ON admin_users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin insert on admin_users" ON admin_users
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### 3. Seed Data (Optional)

```sql
-- Seed waitlist data
INSERT INTO waitlist (email, name, status) VALUES
  ('john@example.com', 'John Doe', 'pending'),
  ('jane@example.com', 'Jane Smith', 'pending'),
  ('bob@example.com', 'Bob Johnson', 'notified');

-- Seed subscribers data
INSERT INTO subscribers (email, status, subscription_type) VALUES
  ('subscriber1@example.com', 'active', 'weekly'),
  ('subscriber2@example.com', 'active', 'daily'),
  ('subscriber3@example.com', 'active', 'monthly');
```

## 📧 EmailJS Setup

### 1. Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Create an account and verify your email
3. Create a new service (Gmail, Outlook, etc.)

### 2. Create Email Templates

#### Waitlist Confirmation Template
- **Template ID**: `template_zlaheo4`
- **Variables**: `{{name}}`, `{{email}}`
- **Subject**: "Welcome to Vela Waitlist!"
- **Content**: 
```
Hi {{name}},

Thank you for joining the Vela waitlist! We'll notify you as soon as we launch.

Best regards,
The Vela Team
```

#### Newsletter Welcome Template
- **Template ID**: `template_your_newsletter_template`
- **Variables**: `{{email}}`
- **Subject**: "Welcome to Vela Newsletter!"
- **Content**:
```
Hi there,

Welcome to the Vela newsletter! You'll receive weekly updates about productivity tips and Vela updates.

Best regards,
The Vela Team
```

### 3. Get EmailJS Public Key
1. Go to Account → API Keys
2. Copy your Public Key
3. Add it to your `.env.local` file

## 💳 Polar Payments Setup

### 1. Create Polar Account
1. Go to [Polar.sh](https://polar.sh/)
2. Create an account and complete verification
3. Set up your organization

### 2. Create Product
1. Go to Products → Create Product
2. Set product name: "Vela Premium"
3. Set price: $4.99/month
4. Copy the product ID

### 3. Get API Credentials
1. Go to Settings → API Keys
2. Create a new API key
3. Copy the access token
4. Add to your `.env.local` file

### 4. Set Up Webhooks
1. Go to Settings → Webhooks
2. Add webhook URL: `https://your-domain.com/api/webhook/polar`
3. Select events: `checkout.completed`, `checkout.failed`, `subscription.*`
4. Copy the webhook secret

## 👨‍💼 Admin Setup

### 1. Create Admin User

```bash
# Navigate to frontend directory
cd frontend

# Create an admin user
npm run admin:create -- --email admin@yourdomain.com --password yourpassword

# List all admin users
npm run admin:list

# Delete an admin user (if needed)
npm run admin:delete -- --email admin@yourdomain.com
```

### 2. Access Admin Dashboard
1. Go to `https://your-domain.com/admin`
2. Login with your admin credentials
3. Manage waitlist and subscribers

## 🚀 Development

### 1. Start Development Server

```bash
npm run dev
```

### 2. Build for Production

```bash
npm run build
npm start
```

## 🧪 Testing

### 1. Test Waitlist
1. Go to the landing page
2. Scroll to the waitlist section
3. Enter name and email
4. Check if email is sent and data is stored

### 2. Test Newsletter
1. Go to the newsletter section
2. Enter email address
3. Check if welcome email is sent

### 3. Test Payments
1. Click "Upgrade to Premium"
2. Complete the checkout flow
3. Check if webhook events are received

### 4. Test Admin
1. Go to `/admin`
2. Login with admin credentials
3. Verify you can see waitlist and subscriber data

## 🐛 Troubleshooting

### Common Issues

#### Supabase Connection Issues
- Verify your Supabase URL and keys
- Check if RLS policies are set correctly
- Ensure tables exist and have proper permissions

#### EmailJS Not Sending
- Verify your public key and service ID
- Check template variables match exactly
- Ensure templates are published

#### Polar Payments Not Working
- Verify access token is correct
- Check if product exists in Polar dashboard
- Ensure webhook URL is accessible

#### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Check TypeScript errors with `npm run build`
- Verify all environment variables are set

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── create-checkout/
│   │   │   ├── checkout-details/
│   │   │   └── webhook/
│   │   │       └── polar/
│   │   ├── admin/
│   │   ├── checkout/
│   │   └── success/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Testimonials.tsx
│   │   ├── Premium.tsx
│   │   ├── WaitlistSection.tsx
│   │   ├── Newsletter.tsx
│   │   ├── Footer.tsx
│   │   └── AdminLogin.tsx
│   └── lib/
│       ├── supabase.ts
│       ├── emailjs.ts
│       └── polar.ts
├── scripts/
│   └── create-admin.js
├── public/
│   └── logo.png
└── .env.local
```

## 🔧 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_TOKEN` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | EmailJS public key | Yes |
| `EMAILJS_SERVICE_ID` | EmailJS service ID | Yes |
| `EMAILJS_TEMPLATE_WAITLIST` | Waitlist email template ID | Yes |
| `EMAILJS_TEMPLATE_NEWSLETTER` | Newsletter email template ID | Yes |
| `POLAR_ACCESS_TOKEN` | Polar API access token | Yes |
| `POLAR_WEBHOOK_SECRET` | Polar webhook secret | Yes |
| `POLAR_PRODUCT_ID` | Polar product ID | Yes |
| `POLAR_SUCCESS_URL` | Success redirect URL | Yes |
| `NEXT_PUBLIC_SITE_URL` | Your site URL | Yes |

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Check the browser console for errors
4. Review the server logs for API errors

## 🎉 You're All Set!

Your Vela landing page should now be fully functional with:
- ✅ Waitlist signup with email notifications
- ✅ Newsletter subscription
- ✅ Premium payment processing
- ✅ Admin dashboard
- ✅ Responsive design
- ✅ Professional styling

Happy coding! 🚀
