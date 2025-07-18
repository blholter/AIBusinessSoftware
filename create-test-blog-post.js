import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { blogPosts, users } from './shared/schema.js';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function createTestBlogPost() {
  try {
    console.log('🔍 Looking for admin user...');
    
    // Find the admin user (assuming it's the user with email freeaibusinesssoftware@gmail.com)
    const adminUser = await db.select().from(users).where(eq(users.email, 'freeaibusinesssoftware@gmail.com')).limit(1);
    
    if (adminUser.length === 0) {
      console.log('❌ No admin user found. Please make sure you have a user with email: freeaibusinesssoftware@gmail.com');
      return;
    }
    
    const userId = adminUser[0].id;
    console.log(`✅ Found admin user with ID: ${userId}`);
    
    // Create a test blog post
    const testPost = {
      title: "Welcome to Agentic AI Agent Apps.com",
      slug: "welcome-to-agentic-ai-agent-apps",
      content: `
# Welcome to Agentic AI Agent Apps.com

We're excited to introduce our new AI marketplace platform that brings together the best AI applications and workflow automation tools.

## What We Offer

- **AI Application Discovery**: Browse and explore cutting-edge AI applications
- **Workflow Automation**: Convert complex workflows into simple React applications
- **Community-Driven**: Submit your own AI applications and share with the community
- **Secure BYOK Model**: Bring your own API keys for complete control

## Getting Started

1. **Browse Applications**: Explore our marketplace of AI applications
2. **Submit Your App**: Share your AI applications with the community
3. **Create Workflows**: Use our workflow converter to build custom applications
4. **Stay Updated**: Follow our blog for the latest AI insights and tutorials

## Why Choose Agentic AI Agent Apps.com?

Our platform is designed to make AI accessible to everyone. Whether you're a developer looking to showcase your AI applications or a business user seeking automation solutions, we provide the tools and community you need to succeed.

Stay tuned for more updates, tutorials, and insights about AI applications and workflow automation!
      `,
      excerpt: "Discover our new AI marketplace platform and learn how to get started with AI applications and workflow automation.",
      metaDescription: "Welcome to Agentic AI Agent Apps.com - Your gateway to AI applications and workflow automation. Discover, create, and share AI solutions.",
      metaKeywords: "AI applications, workflow automation, marketplace, artificial intelligence, automation tools",
      featuredImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
      tags: ["welcome", "ai", "marketplace", "automation"],
      authorId: userId,
      status: 'published',
      publishedAt: new Date(),
      seoTitle: "Welcome to Agentic AI Agent Apps.com - AI Marketplace",
      seoCanonical: "https://agentic-ai-agent-apps.com/blog/welcome-to-agentic-ai-agent-apps"
    };
    
    console.log('📝 Creating test blog post...');
    
    const newPost = await db.insert(blogPosts).values(testPost).returning();
    
    console.log('✅ Test blog post created successfully!');
    console.log('📊 Post details:');
    console.log(`   - Title: ${newPost[0].title}`);
    console.log(`   - Slug: ${newPost[0].slug}`);
    console.log(`   - Status: ${newPost[0].status}`);
    console.log(`   - Published: ${newPost[0].publishedAt}`);
    
    console.log('\n🌐 You can now view the blog at: http://localhost:5000/blog');
    console.log('🔧 Admin panel: http://localhost:5000/admin/blog-manager');
    
  } catch (error) {
    console.error('❌ Error creating test blog post:', error);
  } finally {
    await pool.end();
  }
}

createTestBlogPost(); 