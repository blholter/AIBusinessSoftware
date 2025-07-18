import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table with email/password and OAuth support
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: varchar("email").unique().notNull(),
  username: varchar("username").unique(),
  password: varchar("password"), // For email/password auth
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  bio: text("bio"),
  location: varchar("location"),
  website: varchar("website"),
  // OAuth fields
  googleId: varchar("google_id").unique(),
  authProvider: varchar("auth_provider").default("email"), // 'email' or 'google'
  // Role-based access control
  role: varchar("role").default("user"), // 'user' or 'admin'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User API Keys table for BYOK (Bring Your Own Key) model
export const userApiKeys = pgTable("user_api_keys", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => users.id).notNull(),
  provider: varchar("provider").notNull(), // 'openai', 'anthropic', 'google', etc.
  keyName: varchar("key_name").notNull(), // user-friendly name
  encryptedKey: text("encrypted_key").notNull(), // encrypted API key
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const insertApiKeySchema = createInsertSchema(userApiKeys).omit({
  id: true,
  userId: true,
  encryptedKey: true,
  createdAt: true,
  updatedAt: true,
});

export const apiKeySchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'google', 'azure', 'aws']),
  keyName: z.string().min(1, 'Key name is required'),
  apiKey: z.string().min(1, 'API key is required'),
  isActive: z.boolean().default(true),
});

// Workflow Conversion tables
export const workflowConversions = pgTable("workflow_conversions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => users.id).notNull(),
  workflowName: varchar("workflow_name").notNull(),
  originalWorkflow: jsonb("original_workflow").notNull(), // Original workflow JSON
  workflowAnalysis: jsonb("workflow_analysis").notNull(), // Analysis results
  generatedCode: text("generated_code"), // Generated application code
  outputFormat: varchar("output_format").notNull(), // 'react', 'nodejs', 'python', etc.
  status: varchar("status").default('pending'), // 'pending', 'processing', 'completed', 'failed'
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Applications table for marketplace
export const applications = pgTable("applications", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(),
  icon: varchar("icon").notNull(),
  rating: integer("rating").default(0),
  downloads: integer("downloads").default(0),
  conversionId: integer("conversion_id").references(() => workflowConversions.id), // Link to generated code
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Application Submissions table for user-submitted applications
export const applicationSubmissions = pgTable("application_submissions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(),
  githubUrl: varchar("github_url").notNull(),
  readmeUrl: varchar("readme_url"),
  demoUrl: varchar("demo_url"),
  tags: jsonb("tags").default([]),
  features: jsonb("features").default([]),
  author: varchar("author").notNull(),
  authorName: varchar("author_name").notNull(),
  status: varchar("status").default('pending'), // pending, approved, rejected
  submittedBy: integer("submitted_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Workflow Templates table for storing reusable templates
export const workflowTemplates = pgTable("workflow_templates", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name").notNull(),
  description: text("description"),
  templateType: varchar("template_type").notNull(), // 'react', 'nodejs', 'python', etc.
  templateCode: text("template_code").notNull(),
  nodeTypes: jsonb("node_types").notNull(), // Array of supported node types
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Node Type Registry for mapping node types to code generators
export const nodeTypeRegistry = pgTable("node_type_registry", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  nodeType: varchar("node_type").notNull().unique(),
  nodeName: varchar("node_name").notNull(),
  category: varchar("category").notNull(), // 'trigger', 'action', 'transform', 'output'
  description: text("description"),
  supportedFormats: jsonb("supported_formats").notNull(), // Array of supported output formats
  generatorCode: text("generator_code"), // Code generation logic
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Workflow Executions table for storing user's workflow instances
export const userWorkflows = pgTable("user_workflows", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(),
  status: varchar("status").default('active'), // 'active', 'completed', 'failed', 'running'
  lastRun: timestamp("last_run"),
  workflowCode: text("workflow_code").notNull(), // Generated React code
  workflowSchema: jsonb("workflow_schema"), // Input schema for configuration
  executionData: jsonb("execution_data"), // Last execution results
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Blog Posts table for SEO content
export const blogPosts = pgTable("blog_posts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: varchar("title").notNull(),
  slug: varchar("slug").unique().notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"), // Short description for previews
  metaDescription: varchar("meta_description"), // SEO meta description
  metaKeywords: varchar("meta_keywords"), // SEO keywords
  featuredImage: varchar("featured_image"), // URL to featured image
  tags: jsonb("tags").default([]), // Array of tags
  authorId: integer("author_id").references(() => users.id).notNull(),
  status: varchar("status").default('draft'), // 'draft', 'published', 'archived'
  publishedAt: timestamp("published_at"),
  viewCount: integer("view_count").default(0),
  seoTitle: varchar("seo_title"), // Custom SEO title
  seoCanonical: varchar("seo_canonical"), // Canonical URL
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas (defined after table definitions to avoid circular references)
export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type ApplicationSubmission = typeof applicationSubmissions.$inferSelect;
export type UserApiKey = typeof userApiKeys.$inferSelect;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKeyData = z.infer<typeof apiKeySchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;

// Workflow Conversion types
export type WorkflowConversion = typeof workflowConversions.$inferSelect;
export type WorkflowTemplate = typeof workflowTemplates.$inferSelect;
export type NodeTypeRegistry = typeof nodeTypeRegistry.$inferSelect;
export type UserWorkflow = typeof userWorkflows.$inferSelect;
