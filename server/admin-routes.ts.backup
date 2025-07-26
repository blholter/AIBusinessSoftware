import type { Express } from "express";
import { storage } from "./storage";
import { insertApplicationSchema, insertBlogPostSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";

// Admin middleware - check if user is admin
const isAdmin = (req: any, res: any, next: any) => {
  // For now, we'll use a simple admin check
  // In production, you'd want to add an admin role to the user table
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || ['admin@example.com'];
  
  if (!req.user || !adminEmails.includes(req.user.email)) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// JSON to Application converter schema
const jsonAppSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.string(),
  icon: z.string(),
  rating: z.number().optional(),
  downloads: z.number().optional(),
  featured: z.boolean().optional(),
});

export function setupAdminRoutes(app: Express) {
  // Admin middleware for all admin routes
  app.use('/api/admin', isAdmin);

  // ===== APPLICATIONS MANAGEMENT =====
  
  // Get all applications (admin view)
  app.get('/api/admin/applications', async (req, res) => {
    try {
      const applications = await storage.getAllApplications();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // Create new application
  app.post('/api/admin/applications', async (req, res) => {
    try {
      const appData = insertApplicationSchema.parse(req.body);
      const newApp = await storage.createApplication(appData);
      res.json(newApp);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  // Update application
  app.put('/api/admin/applications/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const appData = insertApplicationSchema.partial().parse(req.body);
      const updatedApp = await storage.updateApplication(id, appData);
      res.json(updatedApp);
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  // Delete application
  app.delete('/api/admin/applications/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteApplication(id);
      res.json({ message: "Application deleted successfully" });
    } catch (error) {
      console.error("Error deleting application:", error);
      res.status(500).json({ message: "Failed to delete application" });
    }
  });

  // ===== BLOG POSTS MANAGEMENT =====

  // Get all blog posts (admin view)
  app.get('/api/admin/blog-posts', async (req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  // Create new blog post
  app.post('/api/admin/blog-posts', async (req, res) => {
    try {
      const postData = insertBlogPostSchema.parse(req.body);
      const newPost = await storage.createBlogPost(postData);
      res.json(newPost);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  // Update blog post
  app.put('/api/admin/blog-posts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const postData = insertBlogPostSchema.partial().parse(req.body);
      const updatedPost = await storage.updateBlogPost(id, postData);
      res.json(updatedPost);
    } catch (error) {
      console.error("Error updating blog post:", error);
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });

  // Delete blog post
  app.delete('/api/admin/blog-posts/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBlogPost(id);
      res.json({ message: "Blog post deleted successfully" });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  // ===== JSON TO APPLICATION CONVERTER =====

  // Upload JSON file and convert to applications
  app.post('/api/admin/convert-json', upload.single('jsonFile'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileContent = req.file.buffer.toString('utf-8');
      let jsonData;

      try {
        jsonData = JSON.parse(fileContent);
      } catch (parseError) {
        return res.status(400).json({ message: "Invalid JSON file" });
      }

      // Handle both single app and array of apps
      const appsArray = Array.isArray(jsonData) ? jsonData : [jsonData];
      const createdApps = [];

      for (const appData of appsArray) {
        try {
          // Validate the app data
          const validatedApp = jsonAppSchema.parse(appData);
          
          // Convert to application format
          const applicationData = {
            name: validatedApp.name,
            description: validatedApp.description,
            category: validatedApp.category,
            icon: validatedApp.icon,
            rating: validatedApp.rating || 0,
            downloads: validatedApp.downloads || 0,
            featured: validatedApp.featured || false,
            status: 'active' as const,
          };

          const newApp = await storage.createApplication(applicationData);
          createdApps.push(newApp);
        } catch (validationError) {
          console.error("Validation error for app:", appData, validationError);
          // Continue with other apps even if one fails
        }
      }

      res.json({
        message: `Successfully converted ${createdApps.length} applications`,
        createdApps,
        totalProcessed: appsArray.length,
      });
    } catch (error) {
      console.error("Error converting JSON:", error);
      res.status(500).json({ message: "Failed to convert JSON file" });
    }
  });

  // Convert JSON string to applications
  app.post('/api/admin/convert-json-string', async (req, res) => {
    try {
      const { jsonString } = req.body;
      
      if (!jsonString) {
        return res.status(400).json({ message: "No JSON string provided" });
      }

      let jsonData;
      try {
        jsonData = JSON.parse(jsonString);
      } catch (parseError) {
        return res.status(400).json({ message: "Invalid JSON string" });
      }

      // Handle both single app and array of apps
      const appsArray = Array.isArray(jsonData) ? jsonData : [jsonData];
      const createdApps = [];

      for (const appData of appsArray) {
        try {
          // Validate the app data
          const validatedApp = jsonAppSchema.parse(appData);
          
          // Convert to application format
          const applicationData = {
            name: validatedApp.name,
            description: validatedApp.description,
            category: validatedApp.category,
            icon: validatedApp.icon,
            rating: validatedApp.rating || 0,
            downloads: validatedApp.downloads || 0,
            featured: validatedApp.featured || false,
            status: 'active' as const,
          };

          const newApp = await storage.createApplication(applicationData);
          createdApps.push(newApp);
        } catch (validationError) {
          console.error("Validation error for app:", appData, validationError);
          // Continue with other apps even if one fails
        }
      }

      res.json({
        message: `Successfully converted ${createdApps.length} applications`,
        createdApps,
        totalProcessed: appsArray.length,
      });
    } catch (error) {
      console.error("Error converting JSON string:", error);
      res.status(500).json({ message: "Failed to convert JSON string" });
    }
  });

  // ===== PUBLIC BLOG ROUTES =====

  // Get published blog posts (public)
  app.get('/api/blog-posts', async (req, res) => {
    try {
      const posts = await storage.getPublishedBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching published blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  // Get single blog post by slug (public)
  app.get('/api/blog-posts/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const post = await storage.getBlogPostBySlug(slug);
      
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });
} 