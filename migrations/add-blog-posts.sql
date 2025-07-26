-- Add blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image VARCHAR,
  author VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'draft',
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at);

-- Add RLS policies for blog_posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can view published blog posts
CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts
  FOR SELECT USING (status = 'published');

-- Only admins can insert, update, delete
CREATE POLICY "Admins can manage blog posts" ON public.blog_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.email = current_user 
      AND users.email IN (SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ',')))
    )
  );

-- Update applications table with new columns if they don't exist
DO $$ 
BEGIN
  -- Add featured column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'featured') THEN
    ALTER TABLE public.applications ADD COLUMN featured BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Add status column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'status') THEN
    ALTER TABLE public.applications ADD COLUMN status VARCHAR DEFAULT 'active';
  END IF;
END $$;

-- Add indexes for applications table
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_featured ON public.applications(featured);
CREATE INDEX IF NOT EXISTS idx_applications_category ON public.applications(category); 