# Vela Landing Page Deployment Guide

## Prerequisites

1. Node.js 18+ installed
2. Vercel account (free tier available)
3. Domain name (optional)
4. Supabase project for newsletter functionality

## Local Development

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Setup**
   Create `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_id (optional)
   NEXT_PUBLIC_PLAUSIBLE_DOMAIN=your_domain (optional)
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## Vercel Deployment

### Option 1: GitHub Integration (Recommended)

1. Push code to GitHub repository
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Option 2: Vercel CLI

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project directory
3. Follow prompts to deploy

## Domain Configuration

1. Add custom domain in Vercel dashboard
2. Update DNS records as instructed
3. SSL certificate is automatically provisioned

## Environment Variables

Set these in Vercel dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` (optional)
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (optional)

## Performance Optimization

- Images are optimized with Next.js Image component
- CSS is automatically minified and optimized
- JavaScript is code-split and tree-shaken
- Static pages are pre-rendered at build time

## SEO Checklist

- [x] Meta tags configured
- [x] Open Graph data set
- [x] Structured data ready
- [x] Sitemap generated
- [x] Robots.txt configured
- [ ] Google Search Console setup
- [ ] Analytics integration

## Monitoring

1. **Vercel Analytics**: Built-in performance monitoring
2. **Google Analytics**: User behavior tracking
3. **Plausible**: Privacy-friendly analytics alternative
4. **Sentry**: Error tracking (optional)

## Security

- HTTPS enforced
- Security headers configured
- Content Security Policy ready
- No sensitive data in client-side code

## Post-Deployment

1. Test all functionality
2. Verify mobile responsiveness
3. Check page load speeds
4. Test form submissions
5. Validate SEO meta tags
6. Set up monitoring alerts