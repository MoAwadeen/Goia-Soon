# 🚀 Vercel Deployment Guide

## Quick Start

### Option 1: Deploy with Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Go to [vercel.com](https://vercel.com)**
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your repository

3. **Configure the project**
   - Framework Preset: Next.js
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your site will be live at `https://your-project.vercel.app`

### Option 2: Deploy with Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Follow the prompts**
   - Link to existing project or create new
   - Confirm settings
   - Deploy

## Environment Variables

No environment variables are required for this project.

## Custom Domain

1. **In Vercel Dashboard**
   - Go to your project settings
   - Navigate to "Domains"
   - Add your custom domain

2. **DNS Configuration**
   - Add the provided DNS records to your domain provider
   - Wait for DNS propagation (up to 48 hours)

## Performance Optimization

✅ **Already configured:**
- Image optimization for Google Drive images
- Compression enabled
- Security headers
- Console removal in production
- Static generation for landing page

## Monitoring

- **Analytics**: Vercel Analytics is already integrated
- **Performance**: Check Vercel Analytics dashboard
- **Uptime**: Monitor in Vercel dashboard

## Troubleshooting

### Build Errors
- Ensure all dependencies are in `package.json`
- Check for TypeScript errors: `npm run typecheck`
- Verify Next.js configuration

### Image Loading Issues
- Images are configured for Google Drive URLs
- Check if images are publicly accessible
- Verify image URLs are correct

### Analytics Not Working
- Ensure Vercel Analytics is enabled in project settings
- Check browser console for errors
- Verify deployment is live

## Support

For deployment issues:
1. Check Vercel documentation
2. Review build logs in Vercel dashboard
3. Contact: youssef.talaat@goia.app
