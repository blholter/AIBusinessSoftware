# 🚀 Production Deployment Checklist

## ✅ Pre-Deployment (Local)

- [x] **Build successful** - `npm run build` completed without errors
- [x] **Database working** - Supabase connection tested locally
- [x] **All features tested** - Login, admin panel, blog, app submission
- [x] **Environment variables** - Production values ready

## 🔧 Environment Setup

- [ ] **Copy environment template:**
  ```bash
  cp production.env.example .env
  ```

- [ ] **Fill in production values:**
  - [ ] `DATABASE_URL` - Your Supabase connection string
  - [ ] `SESSION_SECRET` - Strong random secret (32+ characters)
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=5000` (or your preferred port)

## 🌐 Choose Your Deployment Platform

### Option A: Railway (Recommended - Easy)
- [ ] Create Railway account
- [ ] Connect GitHub repository
- [ ] Set environment variables in Railway dashboard
- [ ] Deploy (automatic from Procfile)

### Option B: Render
- [ ] Create Render account
- [ ] Connect GitHub repository
- [ ] Set environment variables
- [ ] Deploy

### Option C: VPS/Cloud Server
- [ ] Set up server (DigitalOcean, AWS, etc.)
- [ ] Install Node.js 18+
- [ ] Upload files: `dist/`, `package.json`, `package-lock.json`, `.env`
- [ ] Run: `npm ci --only=production`
- [ ] Start: `npm start`

### Option D: Heroku
- [ ] Create Heroku account
- [ ] Install Heroku CLI
- [ ] Connect repository
- [ ] Set environment variables
- [ ] Deploy

## 🔒 Security & Domain

- [ ] **SSL Certificate** - Set up HTTPS (Let's Encrypt is free)
- [ ] **Domain Configuration** - Point domain to your server
- [ ] **Environment Variables** - Never commit `.env` to Git
- [ ] **Database Security** - Supabase connection secured

## 🧪 Post-Deployment Testing

- [ ] **Homepage loads** - No 404 errors
- [ ] **User registration** - Can create new accounts
- [ ] **User login** - Existing users can log in
- [ ] **Admin panel** - Accessible for admin users
- [ ] **Blog functionality** - Posts load and display
- [ ] **App submission** - Users can submit new apps
- [ ] **API endpoints** - All `/api/*` routes working
- [ ] **Database operations** - CRUD operations working

## 📊 Monitoring & Maintenance

- [ ] **Set up logging** - Monitor server logs
- [ ] **Database monitoring** - Check Supabase dashboard
- [ ] **Performance monitoring** - Monitor response times
- [ ] **Backup strategy** - Database backups configured
- [ ] **Update strategy** - Plan for future updates

## 🚨 Emergency Contacts

- **Database Issues:** Check Supabase dashboard
- **Server Issues:** Check platform logs (Railway/Render/etc.)
- **Domain Issues:** Check DNS settings
- **SSL Issues:** Check certificate renewal

## 📝 Quick Commands

```bash
# Build for production
npm run build

# Test production build locally
NODE_ENV=production node dist/index.js

# Deploy to Railway (if using Railway)
railway up

# Check logs
railway logs
```

## 🎯 Success Criteria

Your app is live when:
- ✅ Domain resolves to your app
- ✅ HTTPS works (green lock in browser)
- ✅ All core features work
- ✅ Admin panel accessible
- ✅ Database operations successful
- ✅ No console errors in browser

---

**Need help?** Check the `deploy.md` file for detailed instructions! 