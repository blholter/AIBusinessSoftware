# Supabase + Railway Setup Guide

## Step 1: Set up Supabase Project

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for a free account

2. **Create New Project**
   - Click "New Project"
   - Choose your organization
   - Enter project name (e.g., "ai-marketplace")
   - Set a database password (save this!)
   - Choose a region close to your users
   - Click "Create new project"

3. **Get Project Credentials**
   - Go to Settings → API
   - Copy the following:
     - Project URL
     - Anon public key
     - Service role key (keep this secret!)

## Step 2: Configure Supabase Database

1. **Enable Auth Providers**
   - Go to Authentication → Providers
   - Enable Email provider
   - Enable Google provider (optional)
   - Configure Google OAuth if needed

2. **Set up Database Schema**
   - Go to SQL Editor
   - Run the following SQL to create your tables:

```sql
-- Create users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  profile_image_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create applications table
CREATE TABLE public.applications (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT NOT NULL,
  rating INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user API keys table
CREATE TABLE public.user_api_keys (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL,
  key_name TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view applications" ON public.applications
  FOR SELECT USING (true);

CREATE POLICY "Users can view their own API keys" ON public.user_api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own API keys" ON public.user_api_keys
  FOR ALL USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Step 3: Configure Environment Variables

Create a `.env` file in your project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Database Configuration (for server-side)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Server Configuration
PORT=5000
NODE_ENV=production

# Session Secret (generate a random string)
SESSION_SECRET=your-super-secret-session-key-change-this-in-production
```

## Step 4: Deploy to Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize Railway Project**
   ```bash
   railway init
   ```

4. **Set Environment Variables**
   ```bash
   railway variables set VITE_SUPABASE_URL=your_supabase_project_url
   railway variables set VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   railway variables set DATABASE_URL=your_supabase_database_url
   railway variables set SESSION_SECRET=your_session_secret
   railway variables set NODE_ENV=production
   ```

5. **Deploy**
   ```bash
   railway up
   ```

## Step 5: Configure Custom Domain (Optional)

1. **Add Custom Domain**
   - Go to Railway dashboard
   - Select your project
   - Go to Settings → Domains
   - Add your custom domain

2. **Update Supabase Auth Settings**
   - Go to Supabase dashboard
   - Authentication → URL Configuration
   - Add your Railway domain to allowed redirect URLs

## Step 6: Test Your Deployment

1. **Test Authentication**
   - Visit your Railway URL
   - Try to register a new account
   - Verify email confirmation works
   - Test login/logout

2. **Test Database Operations**
   - Create some test data
   - Verify RLS policies work correctly
   - Test API key management

## Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Add your Railway domain to Supabase CORS settings
   - Go to Settings → API → CORS

2. **Database Connection Issues**
   - Verify DATABASE_URL is correct
   - Check if SSL is required for your region

3. **Auth Redirect Issues**
   - Add Railway domain to Supabase auth redirect URLs
   - Check browser console for errors

4. **Build Failures**
   - Check Railway build logs
   - Verify all dependencies are in package.json

### Useful Commands:

```bash
# View Railway logs
railway logs

# Check Railway status
railway status

# Redeploy
railway up

# Open Railway dashboard
railway open
```

## Next Steps

1. **Set up Monitoring**
   - Configure Railway monitoring
   - Set up error tracking (Sentry, etc.)

2. **Optimize Performance**
   - Enable Supabase caching
   - Optimize database queries

3. **Add Features**
   - Implement real-time features
   - Add file uploads with Supabase Storage
   - Set up edge functions

4. **Security**
   - Review RLS policies
   - Set up proper CORS
   - Configure rate limiting 