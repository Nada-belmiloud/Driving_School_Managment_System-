# 🚀 Quick Deploy Guide - Render (Student Free Tier)

**Total Time: ~15 minutes | Cost: $0/month**

## Prerequisites Checklist
```
✅ GitHub account with Student Pro
✅ Render account (sign up with GitHub)
✅ MongoDB Atlas account (free)
```

---

## 🎯 Quick Steps

### 1️⃣ MongoDB Atlas (5 min)
```
1. Go to mongodb.com/cloud/atlas
2. Create FREE M0 cluster
3. Create database user (save password!)
4. Add IP: 0.0.0.0/0 (Network Access)
5. Copy connection string
   Format: mongodb+srv://user:pass@cluster.net/driving_school
```

### 2️⃣ Render Deployment (5 min)
```
1. Go to render.com
2. Click "New +" → "Blueprint"
3. Connect: Abderrahamane/driving-school-management
4. Click "Apply" (Render reads render.yaml automatically!)
```

### 3️⃣ Backend Environment Variables (3 min)
```
Go to backend service → Environment tab → Add:

NODE_ENV=production
PORT=10000
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<auto-generate-or-create-32-char-secret>
JWT_EXPIRE=7d
DEFAULT_PAGE_SIZE=10
MAX_PAGE_SIZE=100
CORS_ORIGIN=<will-update-after-frontend-deploys>
```

### 4️⃣ Frontend Environment Variables (2 min)
```
Go to frontend service → Environment tab → Add:

NODE_ENV=production
NEXT_PUBLIC_API_URL=https://<backend-url>.onrender.com/api/v1
```

### 5️⃣ Update CORS (1 min)
```
1. Copy frontend URL from Render dashboard
2. Update backend CORS_ORIGIN with frontend URL
3. Save (auto-redeploys)
```

---

## 🔍 Verification

### Backend Health Check
```bash
curl https://your-backend.onrender.com/health
# Should return: {"success":true,"message":"Server is running",...}
```

### Frontend
```
Open: https://your-frontend.onrender.com
Should load the application without errors
```

### Test API Connection
```
Open browser console on frontend
Should see successful API calls, no CORS errors
```

---

## 📝 URLs to Save

After deployment, save these:

```
Backend:  https://_____________________________.onrender.com
Frontend: https://_____________________________.onrender.com
API Docs: https://_____________________________.onrender.com/api-docs
MongoDB:  mongodb+srv://________________________________
```

---

## ⚠️ Common Issues & Quick Fixes

| Issue | Fix |
|-------|-----|
| Build fails | Check logs, verify package.json scripts |
| 503 error | Wait 30-60s (cold start on free tier) |
| CORS error | Update backend CORS_ORIGIN with exact frontend URL |
| Can't connect DB | Check MongoDB IP whitelist (0.0.0.0/0) |
| Env vars missing | Add in Render dashboard, save, redeploys automatically |

---

## 🔄 Auto-Deploy

After setup, just push to GitHub:
```bash
git add .
git commit -m "Your changes"
git push origin main
```
✨ Render automatically deploys!

---

## 🎓 Student Benefits

- ✅ **FREE** hosting (no credit card)
- ✅ **Auto-deploy** on git push
- ✅ **SSL** certificates included
- ✅ **750 hours/month** per service
- ✅ **Custom domain** support

---

## 📚 Full Documentation

- **Complete Guide**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Checklist**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- **Verify Setup**: Run `./verify-deploy.sh`

---

## 🆘 Need Help?

1. Read [DEPLOYMENT.md](DEPLOYMENT.md) for detailed steps
2. Check [Troubleshooting section](DEPLOYMENT.md#troubleshooting)
3. Visit [Render Docs](https://render.com/docs)
4. Check MongoDB Atlas [Connection Guide](https://docs.atlas.mongodb.com/connect-to-cluster/)

---

**Pro Tip**: Keep your app warm (no cold starts):
- Use [UptimeRobot](https://uptimerobot.com) (free)
- Ping backend every 14 minutes
- Free tier spins down after 15 min inactivity

---

Made with ❤️ for students | [Full README](README.md)
