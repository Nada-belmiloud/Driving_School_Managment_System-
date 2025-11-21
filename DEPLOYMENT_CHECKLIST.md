# Pre-Deployment Checklist

Use this checklist before deploying to ensure everything is configured correctly.

## Repository Setup

- [ ] All code is committed and pushed to GitHub
- [ ] `render.yaml` is present in root directory
- [ ] `.env.example` files exist for both frontend and backend
- [ ] `.gitignore` properly excludes `.env` files and `node_modules`
- [ ] `package.json` has correct `start` scripts
  - Backend: `"start": "node src/server.js"`
  - Frontend: `"start": "next start"` and `"build": "next build"`

## MongoDB Atlas Setup

- [ ] MongoDB Atlas account created
- [ ] Free M0 cluster created
- [ ] Database user created with username and password saved
- [ ] IP whitelist configured (0.0.0.0/0 for Render access)
- [ ] Connection string obtained and saved securely
- [ ] Connection string includes database name
- [ ] Tested connection string locally (optional but recommended)

## Render Account Setup

- [ ] Render account created (signed up with GitHub)
- [ ] GitHub connected to Render
- [ ] Repository access granted to Render

## Backend Deployment

- [ ] Backend service created on Render
- [ ] Service name set (e.g., `driving-school-backend`)
- [ ] Region selected (e.g., Oregon US West)
- [ ] Root directory set to `backend`
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Free plan selected
- [ ] Auto-deploy enabled

### Backend Environment Variables

- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `10000`
- [ ] `MONGO_URI` = Your MongoDB Atlas connection string
- [ ] `JWT_SECRET` = Generated secure secret (32+ characters)
- [ ] `JWT_EXPIRE` = `7d`
- [ ] `DEFAULT_PAGE_SIZE` = `10`
- [ ] `MAX_PAGE_SIZE` = `100`
- [ ] `CORS_ORIGIN` = Frontend URL (to be added after frontend deploys)

### Backend Verification

- [ ] Build completed successfully
- [ ] Service is running (green status)
- [ ] Backend URL copied (e.g., `https://driving-school-backend.onrender.com`)
- [ ] Health endpoint works: `https://your-backend.onrender.com/health`
- [ ] API docs accessible: `https://your-backend.onrender.com/api-docs`
- [ ] No errors in logs

## Frontend Deployment

- [ ] Frontend service created on Render
- [ ] Service name set (e.g., `driving-school-frontend`)
- [ ] Same region as backend selected
- [ ] Root directory set to `frontend`
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `npm start`
- [ ] Free plan selected
- [ ] Auto-deploy enabled

### Frontend Environment Variables

- [ ] `NODE_ENV` = `production`
- [ ] `NEXT_PUBLIC_API_URL` = Backend URL + `/api/v1`
  - Example: `https://driving-school-backend.onrender.com/api/v1`

### Frontend Verification

- [ ] Build completed successfully
- [ ] Service is running (green status)
- [ ] Frontend URL copied (e.g., `https://driving-school-frontend.onrender.com`)
- [ ] Application loads in browser
- [ ] No console errors in browser dev tools
- [ ] Can navigate between pages

## Cross-Service Configuration

- [ ] Backend `CORS_ORIGIN` updated with frontend URL
- [ ] Backend redeployed after CORS update
- [ ] Frontend can successfully call backend API
- [ ] No CORS errors in browser console

## Final Verification

- [ ] Both services are running (green status)
- [ ] Health check passes on backend
- [ ] Frontend loads without errors
- [ ] API calls from frontend work correctly
- [ ] Test creating/reading data (e.g., create a test student)
- [ ] Data persists in MongoDB Atlas
- [ ] Authentication works (if implemented)
- [ ] All main features functional

## Post-Deployment

- [ ] Auto-deploy is enabled on both services
- [ ] Monitoring is set up (optional)
- [ ] Custom domain configured (optional)
- [ ] SSL certificates are active (automatic on Render)
- [ ] Team members notified of deployment URLs
- [ ] Documentation updated with live URLs
- [ ] Default admin password changed (IMPORTANT!)

## Optional Enhancements

- [ ] Set up UptimeRobot to prevent cold starts (ping every 14 minutes)
- [ ] Configure custom domain
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Add monitoring dashboard
- [ ] Configure backup strategy
- [ ] Set up staging environment

## Troubleshooting Completed

If you encountered issues, mark what you fixed:

- [ ] Build failures resolved
- [ ] Connection issues fixed
- [ ] CORS errors resolved
- [ ] Environment variables corrected
- [ ] MongoDB connection working
- [ ] Cold start behavior understood

## Documentation

- [ ] Deployment guide reviewed: [DEPLOYMENT.md](DEPLOYMENT.md)
- [ ] Team trained on deployment process
- [ ] Rollback procedure documented
- [ ] Support contacts identified

---

**Deployment Status: ________________**

**Deployment Date: ________________**

**Deployed By: ________________**

**Backend URL: ________________**

**Frontend URL: ________________**

**Notes:**
_________________________________________
_________________________________________
_________________________________________
