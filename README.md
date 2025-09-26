# Goia - Coming Soon

A modern, responsive landing page for Goia's upcoming US launch.

## 🚀 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/goia-soon)

## 🛠️ Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/goia-soon.git
   cd goia-soon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:9002](http://localhost:9002)

## 📦 Manual Deployment to Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Follow the prompts** to connect your GitHub repository

## 🔧 Environment Variables

For basic functionality, no environment variables are required. However, to enable email collection with Supabase database integration, you'll need to set up:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed setup instructions.

## 🎯 Features

- ✅ Responsive design
- ✅ Vercel Analytics integration
- ✅ Custom Goia branding
- ✅ Social media integration
- ✅ Gmail integration
- ✅ Email signup for early adopters
- ✅ Supabase database integration
- ✅ Optimized for performance

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # Root layout with analytics
│   ├── page.tsx        # Main landing page
│   └── globals.css     # Global styles
├── components/         # Reusable UI components
└── lib/               # Utility functions
```

## 🚀 Deployment Checklist

- [x] Vercel configuration (`vercel.json`)
- [x] Next.js optimization (`next.config.ts`)
- [x] Image optimization for Google Drive
- [x] Analytics integration
- [x] Custom favicon
- [x] Security headers
- [x] Performance optimization

## 📞 Support

For questions or support, contact: youssef.talaat@goia.app
