# Vela Landing Page

This is the marketing website for Vela, a Chrome extension that transforms your new tab into a productivity hub.

## Features

- 🎨 **Modern Design** - Clean, professional UI with Manrope font and purple theme
- 📧 **Waitlist System** - Collect user interest with Supabase integration
- 📰 **Newsletter Signup** - Weekly newsletter subscription with EmailJS
- 🔐 **Admin Dashboard** - Protected admin panel for managing users
- 💳 **Payment Integration** - Polar.sh integration for premium features
- 📱 **Responsive** - Mobile-first design that works on all devices
- 🚀 **Chrome Extension** - Landing page for Vela Chrome extension

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Email**: EmailJS
- **Payments**: Polar.sh
- **Icons**: Lucide React
- **Font**: Manrope (Google Fonts)
- **Deployment**: Vercel

## 📚 Documentation

- **[Setup Guide](./SETUP_GUIDE.md)** - Complete setup instructions with database setup, EmailJS configuration, and more
- **[Admin Commands](./ADMIN_COMMANDS.md)** - Admin user management commands
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Deployment instructions for Vercel, Netlify, and Docker

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note**: For complete setup instructions including database configuration, see the [Setup Guide](./SETUP_GUIDE.md).

## Environment Variables

Create a `.env.local` file with:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_TOKEN=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# EmailJS Configuration (optional)
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_emailjs_public_key_here

# Polar.sh Configuration (optional)
POLAR_ACCESS_TOKEN=your_polar_access_token_here
POLAR_PRODUCT_ID=your_polar_product_id_here
POLAR_SUCCESS_URL=your_success_url_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Admin Commands

```bash
# Create admin user
npm run admin:create -- --email admin@example.com --password mypassword123

# List admin users
npm run admin:list

# Delete admin user
npm run admin:delete -- --email admin@example.com
```

## Admin Dashboard

Access the admin dashboard at `/admin` with your admin credentials to:
- View waitlist entries
- Manage newsletter subscribers
- Update user statuses
- View analytics

## Deployment

The site is configured for easy deployment to Vercel:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## SEO & Performance

- Optimized meta tags and Open Graph data
- Responsive design for all devices
- Fast loading with Next.js optimization
- Semantic HTML for accessibility

## Assets Needed

- Logo files (SVG, PNG)
- Favicon set (16x16, 32x32, 180x180)
- Screenshots of the extension
- Open Graph image (1200x630)
- App store badges and icons