# Production Deployment Guide

## Prerequisites
- Your domain is ready
- Supabase database is set up and working
- Node.js 18+ installed on your server

## Step 1: Prepare Your Environment

1. **Copy production environment template:**
   ```bash
   cp production.env.example .env
   ```

2. **Fill in your actual values in `.env`:**
   - `DATABASE_URL`: Your Supabase connection string
   - `SESSION_SECRET`: Generate a strong random secret (use a password generator)
   - Set `NODE_ENV=production`

## Step 2: Build for Production

```bash
npm run build
```

This will:
- Build the React frontend
- Bundle the server code
- Create a `dist/` folder with production-ready files

## Step 3: Deploy to Your Server

### Option A: VPS/Cloud Server (DigitalOcean, AWS, etc.)

1. **Upload files to your server:**
   - `dist/` folder
   - `package.json`
   - `package-lock.json`
   - `.env` file

2. **Install dependencies:**
   ```bash
   npm ci --only=production
   ```

3. **Start the application:**
   ```bash
   npm start
   ```

### Option B: Railway/Render/Heroku

1. **Connect your GitHub repository**
2. **Set environment variables** in the platform dashboard
3. **Deploy** - the platform will use the `Procfile`

### Option C: Vercel/Netlify (Frontend) + Railway/Render (Backend)

1. **Deploy backend** to Railway/Render with your API
2. **Deploy frontend** to Vercel/Netlify
3. **Update frontend API URLs** to point to your backend

## Step 4: Set Up Domain & SSL

1. **Point your domain** to your server's IP address
2. **Set up SSL certificate** (Let's Encrypt is free)
3. **Configure reverse proxy** (nginx/Apache) if needed

## Step 5: Database Migration

Run database migrations on your production database:

```bash
npm run db:push
```

## Step 6: Test Everything

1. **Test user registration/login**
2. **Test admin panel** (if you have admin access)
3. **Test blog functionality**
4. **Test app submission**
5. **Test all core features**

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Supabase PostgreSQL connection string | `postgresql://postgres:password@project.supabase.co:5432/postgres` |
| `SESSION_SECRET` | Secret for session encryption | `your-super-secret-key-here` |
| `PORT` | Server port (usually 5000) | `5000` |
| `NODE_ENV` | Environment mode | `production` |
| `RATE_LIMIT_MAX_REQUESTS` | API rate limiting | `100` |

## Security Checklist

- [ ] Strong `SESSION_SECRET` generated
- [ ] `NODE_ENV=production` set
- [ ] SSL certificate installed
- [ ] Database connection secured
- [ ] Rate limiting enabled
- [ ] Environment variables not in version control

## Troubleshooting

### Common Issues:

1. **Port already in use:** Change `PORT` in `.env`
2. **Database connection failed:** Check `DATABASE_URL` format
3. **Session errors:** Ensure `SESSION_SECRET` is set
4. **Build errors:** Run `npm run build` locally first

### Logs:
- Check server logs for errors
- Monitor database connections
- Verify API endpoints are responding

## Performance Tips

1. **Enable compression** in your reverse proxy
2. **Set up caching** for static assets
3. **Monitor database performance**
4. **Use CDN** for static files if needed 