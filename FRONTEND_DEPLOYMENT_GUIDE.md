# Frontend Deployment Guide

## Table of Contents
1. [Deployment Options Overview](#deployment-options-overview)
2. [Render Deployment (Recommended)](#render-deployment-recommended)
3. [GitHub Pages Deployment (Alternative)](#github-pages-deployment-alternative)
4. [Troubleshooting](#troubleshooting)

---

## Deployment Options Overview

### Option 1: Render (RECOMMENDED) ✅
**Best for:** Full-featured Next.js applications with SSR, API routes, and dynamic features

**Pros:**
- ✅ Supports all Next.js features (SSR, ISR, API routes, middleware)
- ✅ Free tier available (750 hours/month)
- ✅ Automatic HTTPS/SSL
- ✅ Auto-deploy on git push
- ✅ Environment variables support
- ✅ Can connect to backend API easily
- ✅ No build configuration needed

**Cons:**
- ⚠️ Free tier spins down after 15 minutes of inactivity (30-60s cold start)
- ⚠️ Requires Node.js server running

**Cost:** $0/month (free tier)

---

### Option 2: GitHub Pages (NOT RECOMMENDED FOR THIS PROJECT) ⚠️
**Best for:** Static websites only (no server-side features)

**Pros:**
- ✅ Completely free forever
- ✅ No cold starts
- ✅ Fast CDN delivery
- ✅ Simple deployment

**Cons:**
- ❌ Cannot use Server-Side Rendering (SSR)
- ❌ Cannot use API routes
- ❌ Cannot use middleware
- ❌ Cannot use Next.js Image Optimization (without external service)
- ❌ Requires static export which limits features
- ❌ More complex CORS setup for API calls
- ❌ No environment variables at build time

**Cost:** $0/month (completely free)

---

## Why Render is Recommended for This Project

This driving school management application uses:
1. **Dynamic server-rendered pages** - Needs SSR for better SEO and performance
2. **API integration** - Connects to backend API (easier with server-side proxy)
3. **Authentication flows** - Benefits from server-side session handling
4. **Real-time data** - Dashboard needs fresh data on each visit

**Verdict:** ✅ Deploy on **Render** for full functionality

---

## Render Deployment (Recommended)

### Prerequisites
- GitHub account
- Render account (sign up at https://render.com)
- Backend API deployed and running

### Step 1: Verify Configuration

The repository is already configured for Render deployment:

✅ **Package.json** - Dependencies are correct
✅ **Next.js Config** - Production-optimized with standalone output
✅ **Environment Variables** - Template provided in `.env.example`
✅ **Build Commands** - Configured in `render.yaml`

### Step 2: Deploy Using render.yaml (Automatic)

1. **Login to Render:**
   - Go to https://render.com
   - Sign in with GitHub

2. **Create Blueprint:**
   - Click "New +" → "Blueprint"
   - Select repository: `Abderrahamane/driving-school-management`
   - Render will detect `render.yaml` automatically
   - Click "Apply"

3. **Wait for Build:**
   - Frontend will build automatically
   - Takes 2-5 minutes
   - Monitor progress in dashboard

### Step 3: Configure Environment Variables

After deployment, add these environment variables:

**In Render Dashboard → Frontend Service → Environment:**

| Variable | Value | Required |
|----------|-------|----------|
| `NODE_ENV` | `production` | Yes |
| `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com/api/v1` | Yes |

**Important:** Replace `your-backend.onrender.com` with your actual backend URL.

### Step 4: Update Backend CORS

In your backend service on Render:

1. Go to Backend Service → Environment
2. Update `CORS_ORIGIN` to: `https://your-frontend.onrender.com`
3. Click "Save Changes"
4. Backend will redeploy automatically

### Step 5: Verify Deployment

1. Open your frontend URL: `https://your-frontend.onrender.com`
2. Check that pages load correctly
3. Test API connections (login, dashboard, etc.)
4. Verify no CORS errors in browser console

### Build Commands Reference

These are already configured in `render.yaml`:

```yaml
buildCommand: cd frontend && npm install && npm run build
startCommand: cd frontend && npm start
```

### Manual Deployment (Alternative)

If Blueprint method doesn't work:

1. **Click "New +" → "Web Service"**
2. **Configuration:**
   - Name: `driving-school-frontend`
   - Region: `Oregon` (or same as backend)
   - Branch: `main`
   - Root Directory: `frontend`
   - Runtime: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: **Free**

3. **Add Environment Variables** (as shown above)
4. **Deploy**

---

## GitHub Pages Deployment (Alternative)

⚠️ **Warning:** This will disable several Next.js features!

### What You'll Lose:
- Server-Side Rendering (SSR)
- API Routes
- Middleware
- Image Optimization
- Dynamic imports
- Some performance optimizations

### If You Still Want to Deploy to GitHub Pages:

#### Step 1: Modify next.config.js

Replace the current config with:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Enable static export for GitHub Pages
    output: 'export',
    // Disable image optimization for static export
    images: {
        unoptimized: true,
    },
    // Set base path if not deploying to root (e.g., /driving-school-management)
    // basePath: '/driving-school-management',
    // assetPrefix: '/driving-school-management',
    // Environment variables (must be set at build time)
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://your-backend.onrender.com/api/v1',
    },
    // Trailing slash for GitHub Pages
    trailingSlash: true,
};

module.exports = nextConfig;
```

#### Step 2: Update package.json

Add export script:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "export": "next build"
  }
}
```

#### Step 3: Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci
      
      - name: Build with Next.js
        working-directory: ./frontend
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
        run: npm run build
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: ./frontend/out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

#### Step 4: Configure GitHub Repository

1. Go to repository Settings → Pages
2. Source: GitHub Actions
3. Add secret: Settings → Secrets → Actions → New repository secret
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://your-backend.onrender.com/api/v1`

#### Step 5: Deploy

1. Commit and push changes
2. GitHub Actions will automatically build and deploy
3. Site will be available at: `https://yourusername.github.io/driving-school-management/`

#### Step 6: Update Backend CORS

Add GitHub Pages URL to backend CORS_ORIGIN:
```
https://yourusername.github.io
```

---

## Troubleshooting

### Render Issues

#### Build Failed: "Cannot find module 'tailwindcss'"

**Solution:** ✅ Already fixed! TailwindCSS is now in `dependencies`.

#### Application Error 503

**Possible causes:**
1. Environment variables not set correctly
2. Backend API URL is wrong
3. CORS not configured

**Solution:**
1. Check Environment tab in Render dashboard
2. Verify `NEXT_PUBLIC_API_URL` includes `/api/v1`
3. Ensure backend `CORS_ORIGIN` matches frontend URL exactly

#### Cold Start (30-60 seconds)

**Cause:** Free tier spins down after 15 minutes

**Solutions:**
1. This is expected behavior on free tier
2. Use UptimeRobot (free) to ping every 14 minutes
3. Upgrade to paid tier ($7/month) for always-on service

#### CORS Errors

**Check:**
1. Backend `CORS_ORIGIN` = `https://your-frontend.onrender.com` (exact match)
2. No trailing slash
3. Includes `https://`
4. Backend has redeployed after changing CORS

### GitHub Pages Issues

#### 404 on Routes

**Cause:** GitHub Pages doesn't handle client-side routing

**Solution:**
1. Create `public/404.html` that redirects to index.html
2. Or use hash-based routing

#### Images Not Loading

**Cause:** Next.js image optimization disabled

**Solution:**
- Use regular `<img>` tags instead of `next/image`
- Or use external image CDN

#### API Calls Failing

**Possible causes:**
1. CORS not configured on backend
2. Environment variable not set
3. Mixed content (HTTP/HTTPS)

**Solution:**
1. Add GitHub Pages URL to backend CORS
2. Ensure API URL uses HTTPS
3. Check browser console for specific errors

---

## Comparison Summary

| Feature | Render | GitHub Pages |
|---------|--------|--------------|
| **SSR Support** | ✅ Yes | ❌ No |
| **API Routes** | ✅ Yes | ❌ No |
| **Image Optimization** | ✅ Yes | ❌ No |
| **Cold Starts** | ⚠️ Yes (free tier) | ✅ No |
| **Build Time** | ~3-5 min | ~2-3 min |
| **Setup Complexity** | ⭐⭐ Easy | ⭐⭐⭐ Medium |
| **Cost** | $0 (free tier) | $0 (forever) |
| **Best For** | Full apps | Static sites |

---

## Recommended Deployment Strategy

### For Development/Testing:
1. **Local Development:** `npm run dev`
2. **Test Build Locally:** `npm run build && npm start`

### For Production:
1. **Primary:** Deploy to Render (full features)
2. **Alternative:** GitHub Pages (if you only need static pages)

### Current Configuration:
✅ **Optimized for Render deployment**
- All dependencies are production-ready
- Standalone output enabled for better performance
- Environment variables configured
- Production optimizations enabled

---

## Environment Variables Reference

### Required:
- `NEXT_PUBLIC_API_URL` - Your backend API URL (must include `/api/v1`)
  - Example: `https://driving-school-backend.onrender.com/api/v1`

### Optional:
- `NODE_ENV` - Set to `production` (Render sets this automatically)

**Note:** All `NEXT_PUBLIC_*` variables are exposed to the browser. Never put secrets here!

---

## Build Commands Summary

### For Render (configured in render.yaml):
```bash
cd frontend && npm install && npm run build
cd frontend && npm start
```

### For Local Testing:
```bash
cd frontend
npm install
npm run build
npm start
```

### For GitHub Pages (if you choose this option):
```bash
cd frontend
npm install
npm run build  # Creates 'out' directory
```

---

## Next Steps After Deployment

1. ✅ Verify deployment is successful
2. ✅ Test all pages and features
3. ✅ Check API connectivity
4. ✅ Monitor application logs
5. ✅ Set up error tracking (optional - Sentry)
6. ✅ Configure uptime monitoring (optional - UptimeRobot)

---

## Getting Help

- **Render Documentation:** https://render.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **GitHub Pages:** https://docs.github.com/pages
- **Repository Issues:** Open an issue on GitHub

---

**Updated:** November 2025  
**Recommended:** Render deployment for this project  
**Status:** ✅ Ready to deploy
