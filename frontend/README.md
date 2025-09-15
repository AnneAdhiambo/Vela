# Vela Landing Page

This is the marketing website for Vela, a Chrome extension that transforms your new tab into a productivity hub.

## Features

- **Hero Section**: Compelling headline with Chrome Web Store CTA
- **Features Grid**: Showcases core app functionality
- **How It Works**: 3-step onboarding flow
- **Testimonials**: Social proof and trust badges
- **Premium Pricing**: Subscription plans with Polar integration
- **Newsletter Signup**: Supabase magic-link authentication
- **Legal Pages**: Privacy policy and terms of service

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Authentication**: Supabase (for newsletter)
- **Deployment**: Vercel
- **Analytics**: Ready for Plausible/GA integration

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

## Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

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