# Render Deployment Architecture

This document explains how the application is deployed on Render.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          INTERNET                                │
│                            (Users)                               │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS (SSL Auto)
                         │
        ┌────────────────┴────────────────┐
        │                                  │
        │                                  │
┌───────▼───────┐                 ┌───────▼────────┐
│   Frontend    │                 │    Backend     │
│  (Render Web) │◄───────────────►│  (Render Web)  │
│               │    API Calls    │                │
│  Next.js App  │                 │  Express API   │
│               │                 │                │
│ Port: 10000   │                 │  Port: 10000   │
└───────────────┘                 └────────┬───────┘
                                           │
                                           │ MongoDB Connection
                                           │
                                  ┌────────▼────────┐
                                  │  MongoDB Atlas  │
                                  │   (Database)    │
                                  │                 │
                                  │   M0 Free Tier  │
                                  │    512 MB       │
                                  └─────────────────┘
```

## Service Details

### Frontend Service
- **Type**: Web Service
- **Runtime**: Node.js
- **Framework**: Next.js 15
- **Build**: `npm install && npm run build`
- **Start**: `npm start`
- **Port**: 10000 (Render default)
- **Region**: Oregon (US West)
- **Plan**: Free (750 hours/month)

**Environment Variables:**
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://backend-url.onrender.com/api/v1
```

### Backend Service
- **Type**: Web Service
- **Runtime**: Node.js
- **Framework**: Express.js
- **Build**: `npm install`
- **Start**: `npm start`
- **Port**: 10000 (Render default)
- **Region**: Oregon (US West) 
- **Plan**: Free (750 hours/month)

**Environment Variables:**
```
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://...
JWT_SECRET=auto-generated-secret
JWT_EXPIRE=7d
DEFAULT_PAGE_SIZE=10
MAX_PAGE_SIZE=100
CORS_ORIGIN=https://frontend-url.onrender.com
```

### Database (MongoDB Atlas)
- **Type**: Database Service
- **Provider**: MongoDB Atlas
- **Tier**: M0 Free
- **Storage**: 512 MB
- **Backup**: Daily automatic backups included
- **Region**: Same as Render services (recommended)

## Data Flow

### 1. User Request Flow
```
User Browser
    │
    │ 1. HTTPS Request
    ▼
Frontend (Render)
    │
    │ 2. Render serves Next.js pages
    │    (Server-side rendering)
    ▼
User receives HTML/CSS/JS
```

### 2. API Request Flow
```
User Interaction
    │
    │ 1. API Call (fetch/axios)
    ▼
Frontend (Render)
    │
    │ 2. HTTPS Request to Backend
    ▼
Backend (Render)
    │
    │ 3. Authenticate/Process
    ▼
MongoDB Atlas
    │
    │ 4. Query/Update Data
    ▼
Backend (Render)
    │
    │ 5. JSON Response
    ▼
Frontend (Render)
    │
    │ 6. Update UI
    ▼
User sees updated data
```

## Deployment Pipeline

### Automatic Deployment (Continuous Deployment)

```
Developer
    │
    │ git push origin main
    ▼
GitHub Repository
    │
    │ Webhook triggers Render
    ▼
Render Build System
    │
    ├─► Backend Build
    │   ├── cd backend
    │   ├── npm install
    │   ├── Health check
    │   └── Deploy ✓
    │
    └─► Frontend Build
        ├── cd frontend
        ├── npm install
        ├── npm run build
        ├── Health check
        └── Deploy ✓
```

### Build Process

**Backend:**
1. Clone repository
2. Navigate to `backend/` directory
3. Run `npm install`
4. Start server with `npm start`
5. Health check on `/health` endpoint
6. Route traffic to new instance
7. Shutdown old instance

**Frontend:**
1. Clone repository
2. Navigate to `frontend/` directory
3. Run `npm install`
4. Run `npm run build` (creates production build)
5. Start server with `npm start`
6. Health check
7. Route traffic to new instance
8. Shutdown old instance

## Security Features

### Render Platform Security
- ✅ Automatic SSL/TLS certificates
- ✅ DDoS protection
- ✅ Environment variable encryption
- ✅ Private networking between services (optional)
- ✅ Automatic security updates
- ✅ Web Application Firewall (WAF)

### Application Security
- ✅ Helmet.js (security headers)
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ MongoDB sanitization
- ✅ XSS protection
- ✅ JWT authentication
- ✅ Request validation

### MongoDB Atlas Security
- ✅ Encryption at rest
- ✅ Encryption in transit (TLS/SSL)
- ✅ Network isolation
- ✅ IP whitelist
- ✅ Authentication required
- ✅ Role-based access control

## Performance Considerations

### Free Tier Characteristics

**Cold Starts:**
- Services spin down after **15 minutes** of inactivity
- Wake up time: **30-60 seconds**
- First request after sleep will be slow
- Subsequent requests are fast

**Solution:**
```bash
# Use UptimeRobot to ping every 14 minutes
# GET https://your-backend.onrender.com/health
```

**Resource Limits:**
- **750 hours/month** per service
- Shared CPU (not dedicated)
- 512 MB RAM per service
- 100 GB bandwidth/month

### Optimization Tips

1. **Minimize Build Size:**
   - Use `.renderignore` to exclude unnecessary files
   - Clean up `node_modules` with `npm prune --production`

2. **Cache Static Assets:**
   - Next.js automatically optimizes assets
   - Use CDN for images (optional)

3. **Database Indexes:**
   - Add MongoDB indexes for frequently queried fields
   - Use MongoDB Atlas performance advisor

4. **Monitor Performance:**
   - Check Render metrics dashboard
   - Monitor MongoDB Atlas metrics
   - Set up error tracking (optional)

## Monitoring & Logs

### Render Dashboard

**Available Metrics:**
- CPU usage
- Memory usage
- Request count
- Response time
- Error rate

**Logs:**
- Real-time log streaming
- Historical logs (7 days on free tier)
- Search and filter capability

### MongoDB Atlas

**Available Metrics:**
- Connection count
- Operation count
- Query execution time
- Storage used
- Index usage

## Backup & Recovery

### MongoDB Atlas Backups
- **Automatic backups**: Daily (included in free tier)
- **Retention**: 2 days on free tier
- **Restore**: Through MongoDB Atlas dashboard

### Application Code
- **Version control**: GitHub repository
- **Deployment history**: Render keeps deployment history
- **Rollback**: Deploy previous commit from Render dashboard

## Scaling Strategy

### When to Upgrade from Free Tier

**Indicators:**
1. **Consistent traffic** (no need for cold starts)
2. **150+ GB bandwidth/month** needed
3. **Need more than 512 MB database** storage
4. **Business/production** use case
5. **Custom domain** without limitations

### Upgrade Options

| Tier | Frontend | Backend | Database | Total |
|------|----------|---------|----------|-------|
| **Free** | $0 | $0 | $0 (Atlas M0) | **$0** |
| **Starter** | $7/mo | $7/mo | $9/mo (Atlas M2) | **$23/mo** |
| **Standard** | $25/mo | $25/mo | $25/mo (Atlas M10) | **$75/mo** |

**Starter Benefits:**
- No cold starts (always on)
- Dedicated CPU and memory
- More bandwidth
- Faster performance

## Cost Breakdown (Free Tier)

```
┌─────────────────────────────────────────┐
│  Service          │  Cost    │  Limits  │
├───────────────────┼──────────┼──────────┤
│  Backend (Render) │  $0/mo   │  750 hrs │
│  Frontend (Render)│  $0/mo   │  750 hrs │
│  Database (Atlas) │  $0/mo   │  512 MB  │
│  SSL Certificates │  $0/mo   │  Auto    │
│  Bandwidth        │  $0/mo   │  100 GB  │
├───────────────────┼──────────┼──────────┤
│  Total            │  $0/mo   │          │
└─────────────────────────────────────────┘
```

**Perfect for:**
- Development and testing
- Student projects
- Portfolio applications
- Low-traffic production apps

## Troubleshooting

### Common Issues

**1. Service Won't Start**
- Check build logs for errors
- Verify `package.json` scripts
- Check environment variables

**2. Database Connection Failed**
- Verify MongoDB URI is correct
- Check IP whitelist (must include 0.0.0.0/0)
- Verify username/password

**3. CORS Errors**
- Update backend `CORS_ORIGIN` with exact frontend URL
- No trailing slash in URLs
- Redeploy after changing

**4. Slow Response Time**
- First request after cold start is slow (expected)
- Use UptimeRobot to prevent sleep
- Consider upgrading to paid tier

## Support Resources

- **Render Docs**: https://render.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **Community**: https://community.render.com/
- **Status Page**: https://status.render.com/

---

**Last Updated**: November 2025
