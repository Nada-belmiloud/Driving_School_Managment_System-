# Deployment Guide: Render (Free Tier with GitHub Student Pro)

This guide walks you through deploying the Driving School Management System to Render's free tier, which is perfect for students with GitHub Pro accounts.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Step 1: Set Up MongoDB Atlas (Free)](#step-1-set-up-mongodb-atlas-free)
- [Step 2: Prepare Your Repository](#step-2-prepare-your-repository)
- [Step 3: Deploy to Render](#step-3-deploy-to-render)
- [Step 4: Configure Environment Variables](#step-4-configure-environment-variables)
- [Step 5: Verify Deployment](#step-5-verify-deployment)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

✅ **What You Need:**
- GitHub account with GitHub Pro (Student)
- Render account (sign up with GitHub for easy integration)
- MongoDB Atlas account (free)
- Git installed on your computer

✅ **What You Get with GitHub Student Pack:**
- Free hosting on Render
- Free domain options
- Free SSL certificates
- Automatic deployments

---

## Step 1: Set Up MongoDB Atlas (Free)

MongoDB Atlas provides a free tier (512 MB storage) perfect for development and small applications.

### 1.1 Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Try Free"** and sign up
3. Choose **"FREE"** tier (M0 Sandbox)
4. Select a cloud provider and region (choose one close to your Render region)

### 1.2 Create a Cluster

1. Click **"Build a Database"**
2. Choose **"M0 FREE"** tier
3. Select your preferred cloud provider (AWS, Google Cloud, or Azure)
4. Choose a region (e.g., `us-east-1` for Oregon)
5. Name your cluster (e.g., `driving-school-cluster`)
6. Click **"Create"**

### 1.3 Configure Database Access

1. **Create Database User:**
   - Go to **Database Access** → **Add New Database User**
   - Choose **Password** authentication
   - Username: `dbadmin` (or your choice)
   - Password: Use **Autogenerate Secure Password** and **SAVE IT**
   - Database User Privileges: Select **"Read and write to any database"**
   - Click **"Add User"**

2. **Whitelist IP Addresses:**
   - Go to **Network Access** → **Add IP Address**
   - Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This is necessary for Render to connect
   - Click **"Confirm"**

### 1.4 Get Your Connection String

1. Go to **Database** → **Connect**
2. Choose **"Connect your application"**
3. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. **Replace:**
   - `<username>` with your database username
   - `<password>` with your database password
   - Add your database name after `.net/`: `driving_school`

**Final connection string example:**
```
mongodb+srv://dbadmin:YourPassword123@cluster0.xxxxx.mongodb.net/driving_school?retryWrites=true&w=majority
```

**⚠️ IMPORTANT:** Save this connection string - you'll need it for Render!

---

## Step 2: Prepare Your Repository

### 2.1 Verify Your Repository Structure

Make sure your repository has the correct structure:
```
driving-school-management/
├── backend/
│   ├── src/
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── package.json
│   └── .env.local
├── render.yaml
└── DEPLOYMENT.md (this file)
```

### 2.2 Commit and Push Changes

If you made any changes, commit and push them:
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

---

## Step 3: Deploy to Render

### 3.1 Create Render Account

1. Go to [Render](https://render.com)
2. Click **"Get Started for Free"**
3. **Sign up with GitHub** (recommended for easy integration)
4. Authorize Render to access your repositories

### 3.2 Deploy Using render.yaml (Blueprint Method)

This is the easiest method - Render will automatically set up both frontend and backend!

1. **In Render Dashboard:**
   - Click **"New +"** → **"Blueprint"**
   - Connect your GitHub repository: `Abderrahamane/driving-school-management`
   - Render will detect the `render.yaml` file
   - Click **"Apply"**

2. **Review Services:**
   - You should see two services being created:
     - `driving-school-backend` (Web Service)
     - `driving-school-frontend` (Web Service)

3. **Wait for Initial Build:**
   - Backend will start deploying first (takes 2-5 minutes)
   - Frontend will follow
   - You can monitor progress in the dashboard

### 3.3 Alternative: Manual Deployment (If Blueprint Doesn't Work)

If the Blueprint method fails, you can deploy manually:

#### Deploy Backend:
1. Click **"New +"** → **"Web Service"**
2. Connect repository: `Abderrahamane/driving-school-management`
3. **Configuration:**
   - Name: `driving-school-backend`
   - Region: `Oregon (US West)`
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: **Free**
4. Click **"Create Web Service"**

#### Deploy Frontend:
1. Click **"New +"** → **"Web Service"**
2. Connect repository: `Abderrahamane/driving-school-management`
3. **Configuration:**
   - Name: `driving-school-frontend`
   - Region: `Oregon (US West)` (same as backend)
   - Branch: `main`
   - Root Directory: `frontend`
   - Runtime: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: **Free**
4. Click **"Create Web Service"**

---

## Step 4: Configure Environment Variables

You need to add environment variables for both services.

### 4.1 Backend Environment Variables

1. Go to your **backend service** in Render dashboard
2. Click **"Environment"** tab
3. Add the following environment variables:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Sets production mode |
| `PORT` | `10000` | Render uses this port |
| `MONGO_URI` | `your-mongodb-atlas-connection-string` | Paste the connection string from Step 1.4 |
| `JWT_SECRET` | `auto-generated-or-your-secret-32-chars` | Render can auto-generate or use your own |
| `JWT_EXPIRE` | `7d` | Token expiration time |
| `DEFAULT_PAGE_SIZE` | `10` | Pagination default |
| `MAX_PAGE_SIZE` | `100` | Max items per page |
| `CORS_ORIGIN` | `https://your-frontend-url.onrender.com` | Update after frontend deploys |

**To get your frontend URL:**
- After frontend deploys, copy its URL from the Render dashboard
- Update `CORS_ORIGIN` in backend with this URL
- Example: `https://driving-school-frontend.onrender.com`

4. Click **"Save Changes"**
5. Service will automatically redeploy

### 4.2 Frontend Environment Variables

1. Go to your **frontend service** in Render dashboard
2. Click **"Environment"** tab
3. Add the following environment variables:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Sets production mode |
| `NEXT_PUBLIC_API_URL` | `https://your-backend-url.onrender.com/api/v1` | Your backend URL + `/api/v1` |

**To get your backend URL:**
- After backend deploys, copy its URL from the Render dashboard
- Add `/api/v1` to the end
- Example: `https://driving-school-backend.onrender.com/api/v1`

4. Click **"Save Changes"**
5. Service will automatically redeploy

### 4.3 Important Notes on URLs

- ⚠️ **You need to update URLs after both services are deployed**
- Backend needs frontend URL for CORS
- Frontend needs backend URL for API calls
- After adding these, both services will redeploy automatically

---

## Step 5: Verify Deployment

### 5.1 Check Backend Health

1. Open your backend URL: `https://your-backend-url.onrender.com/health`
2. You should see:
   ```json
   {
     "success": true,
     "message": "Server is running",
     "timestamp": "2025-11-18T...",
     "environment": "production",
     "uptime": 123.45
   }
   ```

### 5.2 Check Backend API Documentation

1. Open: `https://your-backend-url.onrender.com/api-docs`
2. You should see Swagger API documentation
3. Test some endpoints to verify they work

### 5.3 Check Frontend

1. Open your frontend URL: `https://your-frontend-url.onrender.com`
2. The application should load
3. Try navigating through different pages
4. Check if API calls work properly

### 5.4 Test Full Stack Integration

1. Try creating a test student or instructor
2. Verify data is saved to MongoDB
3. Check if you can retrieve the data
4. Test authentication if implemented

---

## Post-Deployment

### Configure Custom Domain (Optional)

With GitHub Student Pack, you get free custom domains:

1. In Render Dashboard, go to your service
2. Click **"Settings"** → **"Custom Domain"**
3. Add your domain
4. Update DNS records as shown
5. SSL certificate is automatic!

### Enable Auto-Deploy

Auto-deploy should be enabled by default (via `render.yaml`). To verify:

1. Go to service settings
2. Check **"Auto-Deploy"** is set to **"Yes"**
3. Now, every push to `main` branch will trigger a deployment

### Monitor Your Application

1. **Logs:** View real-time logs in the Render dashboard
2. **Metrics:** Check CPU, memory usage
3. **Health Checks:** Render automatically monitors `/health` endpoint

### Free Tier Limitations

Be aware of free tier limits:
- **750 hours/month** of runtime per service
- Services **spin down** after 15 minutes of inactivity
- **Cold starts** take 30-60 seconds when service wakes up
- Limited to **100 GB bandwidth/month**

**Tip:** For better performance, consider upgrading to paid tier ($7/month per service) when ready.

---

## Troubleshooting

### Issue: "Build Failed"

**Symptoms:** Deployment fails during build

**Solutions:**
1. Check build logs in Render dashboard
2. Verify `package.json` has correct scripts:
   - Backend: `"start": "node src/server.js"`
   - Frontend: `"build": "next build"` and `"start": "next start"`
3. Make sure all dependencies are in `dependencies`, not just `devDependencies`
4. Check Node.js version compatibility

### Issue: "Application Error" or 503

**Symptoms:** Service deploys but shows error when accessing

**Solutions:**
1. Check if MongoDB connection string is correct
2. Verify environment variables are set correctly
3. Check application logs for errors
4. Ensure `PORT` is set to `10000` for backend
5. Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`

### Issue: "CORS Error"

**Symptoms:** Frontend can't connect to backend, CORS errors in browser console

**Solutions:**
1. Verify `CORS_ORIGIN` in backend matches frontend URL exactly
2. Make sure URL includes `https://` and has no trailing slash
3. Check browser console for exact error message
4. Redeploy backend after updating CORS_ORIGIN

### Issue: "Service Unavailable" (Cold Start)

**Symptoms:** First request takes 30-60 seconds

**Solutions:**
- This is expected behavior on free tier
- Service spins down after 15 minutes of inactivity
- Consider upgrading to paid tier for always-on service
- Use a service like [UptimeRobot](https://uptimerobot.com) to ping every 14 minutes (keeps it warm)

### Issue: "MongoDB Connection Timeout"

**Symptoms:** Backend can't connect to MongoDB

**Solutions:**
1. Verify MongoDB Atlas connection string is correct
2. Check username and password are properly URL-encoded
3. Ensure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
4. Verify database name in connection string
5. Test connection string locally first

### Issue: "Environment Variable Not Found"

**Symptoms:** Application crashes with missing env var error

**Solutions:**
1. Double-check all environment variables are added in Render dashboard
2. Make sure variable names match exactly (case-sensitive)
3. After adding variables, click "Save Changes"
4. Service should automatically redeploy

### Issue: Frontend Shows "Failed to Fetch"

**Symptoms:** API calls from frontend fail

**Solutions:**
1. Verify `NEXT_PUBLIC_API_URL` is correct and includes `/api/v1`
2. Check backend is actually running (visit health endpoint)
3. Verify CORS is configured correctly
4. Check browser console for exact error
5. Use browser dev tools Network tab to inspect failed requests

### Getting Help

If you're still stuck:

1. **Check Render Documentation:** https://render.com/docs
2. **MongoDB Atlas Docs:** https://docs.atlas.mongodb.com/
3. **Render Community:** https://community.render.com/
4. **Check Logs:** Always check application logs first - they often reveal the issue
5. **GitHub Issues:** Open an issue in the repository

---

## Deployment Checklist

Use this checklist to ensure everything is set up correctly:

**MongoDB Atlas:**
- [ ] Created free cluster
- [ ] Created database user with password
- [ ] Added IP whitelist (0.0.0.0/0)
- [ ] Obtained connection string
- [ ] Tested connection string works

**Render Backend:**
- [ ] Service created and deployed
- [ ] All environment variables added
- [ ] `MONGO_URI` set correctly
- [ ] `CORS_ORIGIN` set to frontend URL
- [ ] Health check passes (`/health` endpoint)
- [ ] API documentation accessible (`/api-docs`)

**Render Frontend:**
- [ ] Service created and deployed
- [ ] `NEXT_PUBLIC_API_URL` set to backend URL + `/api/v1`
- [ ] Application loads successfully
- [ ] Can navigate through pages
- [ ] API calls work properly

**Final Verification:**
- [ ] Backend and frontend can communicate
- [ ] Data persists to MongoDB
- [ ] Authentication works (if implemented)
- [ ] No CORS errors
- [ ] Auto-deploy enabled

---

## Next Steps

After successful deployment:

1. **Secure Your Application:**
   - Change default admin password
   - Review security settings
   - Set up monitoring

2. **Performance Optimization:**
   - Set up caching if needed
   - Optimize images and assets
   - Consider CDN for static files

3. **Monitoring:**
   - Set up error tracking (e.g., Sentry)
   - Configure uptime monitoring
   - Review logs regularly

4. **Backup Strategy:**
   - MongoDB Atlas has automatic backups
   - Export important data periodically
   - Document recovery procedures

---

## Cost Breakdown (Free Tier)

| Service | Cost | Notes |
|---------|------|-------|
| Render Backend | **$0** | 750 hours/month free |
| Render Frontend | **$0** | 750 hours/month free |
| MongoDB Atlas | **$0** | 512 MB storage, M0 tier |
| SSL Certificates | **$0** | Automatic via Render |
| Custom Domain | **$0** | Via GitHub Student Pack |
| **Total** | **$0/month** | Perfect for students! |

**When to Upgrade:**
- Need 24/7 uptime (no cold starts)
- Need more than 512 MB database storage
- Traffic exceeds free tier limits
- Want custom domain without GitHub connection

---

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [GitHub Student Developer Pack](https://education.github.com/pack)
- [Express.js Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

---

**Congratulations! 🎉** Your Driving School Management System is now deployed and accessible worldwide!

For questions or issues, refer to the troubleshooting section or open an issue in the GitHub repository.
