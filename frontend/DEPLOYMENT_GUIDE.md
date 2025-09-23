# Deployment Guide

This guide covers deploying the Vela landing page to various platforms.

## 🚀 Vercel Deployment (Recommended)

### 1. Prepare for Deployment

1. **Build the project locally** to ensure everything works:
   ```bash
   npm run build
   ```

2. **Set up environment variables** in Vercel:
   - Go to your Vercel project settings
   - Navigate to Environment Variables
   - Add all variables from your `.env.local` file

### 2. Deploy to Vercel

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts to configure your project
```

#### Option B: GitHub Integration
1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Vercel will automatically deploy on every push

### 3. Configure Environment Variables in Vercel

Add these environment variables in your Vercel dashboard:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_TOKEN=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
EMAILJS_SERVICE_ID=service_b3yn4ot
EMAILJS_TEMPLATE_WAITLIST=template_zlaheo4
EMAILJS_TEMPLATE_NEWSLETTER=template_your_newsletter_template
POLAR_ACCESS_TOKEN=your_polar_access_token
POLAR_WEBHOOK_SECRET=your_polar_webhook_secret
POLAR_PRODUCT_ID=vela-premium
POLAR_SUCCESS_URL=https://your-domain.vercel.app/success?checkout_id={CHECKOUT_ID}
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

### 4. Update Polar Webhook URL

1. Go to your Polar dashboard
2. Navigate to Settings → Webhooks
3. Update the webhook URL to: `https://your-domain.vercel.app/api/webhook/polar`

## 🌐 Netlify Deployment

### 1. Build Configuration

Create `netlify.toml` in your project root:

```toml
[build]
  command = "cd frontend && npm run build"
  publish = "frontend/.next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 2. Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `cd frontend && npm run build`
3. Set publish directory: `frontend/.next`
4. Add environment variables in Netlify dashboard

## 🐳 Docker Deployment

### 1. Create Dockerfile

Create `Dockerfile` in the frontend directory:

```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### 2. Build and Run

```bash
# Build the Docker image
docker build -t vela-landing .

# Run the container
docker run -p 3000:3000 --env-file .env.local vela-landing
```

## 🔧 Environment-Specific Configuration

### Development
```env
NODE_ENV=development
POLAR_SERVER=sandbox
```

### Production
```env
NODE_ENV=production
POLAR_SERVER=production
```

## 📊 Performance Optimization

### 1. Enable Compression
Add to `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  // ... other config
}

module.exports = nextConfig
```

### 2. Image Optimization
- Use Next.js Image component for all images
- Optimize images before uploading
- Use WebP format when possible

### 3. Caching
- Set up CDN caching for static assets
- Configure appropriate cache headers
- Use Vercel's edge caching

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit `.env.local` to version control
- Use different keys for development and production
- Rotate keys regularly

### 2. API Security
- Validate all webhook signatures
- Implement rate limiting
- Use HTTPS everywhere

### 3. Database Security
- Use Row Level Security (RLS) in Supabase
- Limit service role key permissions
- Regular security audits

## 📈 Monitoring and Analytics

### 1. Error Tracking
Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- Vercel Analytics for performance

### 2. Uptime Monitoring
- Set up uptime monitoring with services like UptimeRobot
- Monitor API endpoints
- Set up alerts for failures

## 🚨 Post-Deployment Checklist

- [ ] All environment variables are set correctly
- [ ] Database tables are created and seeded
- [ ] EmailJS templates are configured
- [ ] Polar webhooks are pointing to the correct URL
- [ ] Admin users can access the dashboard
- [ ] Waitlist signup is working
- [ ] Newsletter subscription is working
- [ ] Payment processing is working
- [ ] All forms are submitting successfully
- [ ] Mobile responsiveness is working
- [ ] Performance is acceptable
- [ ] SSL certificate is valid
- [ ] Domain is properly configured

## 🔄 Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./frontend
```

## 🆘 Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Environment Variable Issues**
   - Ensure all required variables are set
   - Check variable names match exactly
   - Verify no typos in values

3. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check if RLS policies are correct
   - Ensure tables exist

4. **Email/Webhook Issues**
   - Verify EmailJS configuration
   - Check Polar webhook URL
   - Test webhook endpoints

## 📞 Support

If you encounter deployment issues:

1. Check the Vercel/Netlify build logs
2. Verify all environment variables
3. Test locally with production environment variables
4. Check the troubleshooting section in the main setup guide

Happy deploying! 🚀
