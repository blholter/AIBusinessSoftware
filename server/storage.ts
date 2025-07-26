import { users, userApiKeys, applications, blogPosts, type User, type InsertUser, type UpsertUser, type UserApiKey, type InsertApiKey, type Application, type InsertApplication, type BlogPost, type InsertBlogPost } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Storage interface for user operations
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  upsertUser(upsertUser: UpsertUser): Promise<User>;
  
  // API Keys methods
  getUserApiKeys(userId: number): Promise<UserApiKey[]>;
  createApiKey(userId: number, apiKey: InsertApiKey): Promise<UserApiKey>;
  updateApiKey(keyId: number, updates: Partial<InsertApiKey>): Promise<UserApiKey>;
  deleteApiKey(keyId: number): Promise<void>;
  getApiKey(keyId: number): Promise<UserApiKey | undefined>;
  
  // Applications methods
  getAllApplications(): Promise<Application[]>;
  getApplication(id: number): Promise<Application | undefined>;
  createApplication(app: InsertApplication): Promise<Application>;
  updateApplication(id: number, updates: Partial<InsertApplication>): Promise<Application>;
  deleteApplication(id: number): Promise<void>;
  
  // Blog posts methods
  getAllBlogPosts(): Promise<BlogPost[]>;
  getPublishedBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, updates: Partial<InsertBlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: number): Promise<void>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async upsertUser(upsertUser: UpsertUser): Promise<User> {
    if (upsertUser.email) {
      const existingUser = await this.getUserByEmail(upsertUser.email);
      if (existingUser) {
        // Update existing user
        const [user] = await db
          .update(users)
          .set({
            ...upsertUser,
            updatedAt: new Date(),
          })
          .where(eq(users.id, existingUser.id))
          .returning();
        return user;
      }
    }
    
    // Create new user
    const [user] = await db
      .insert(users)
      .values(upsertUser)
      .returning();
    return user;
  }

  // API Keys methods
  async getUserApiKeys(userId: number): Promise<UserApiKey[]> {
    return await db
      .select()
      .from(userApiKeys)
      .where(eq(userApiKeys.userId, userId));
  }

  async createApiKey(userId: number, apiKey: InsertApiKey): Promise<UserApiKey> {
    const [newKey] = await db
      .insert(userApiKeys)
      .values({
        ...apiKey,
        userId,
      })
      .returning();
    return newKey;
  }

  async updateApiKey(keyId: number, updates: Partial<InsertApiKey>): Promise<UserApiKey> {
    const [updatedKey] = await db
      .update(userApiKeys)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(userApiKeys.id, keyId))
      .returning();
    return updatedKey;
  }

  async deleteApiKey(keyId: number): Promise<void> {
    await db
      .delete(userApiKeys)
      .where(eq(userApiKeys.id, keyId));
  }

  async getApiKey(keyId: number): Promise<UserApiKey | undefined> {
    const [key] = await db
      .select()
      .from(userApiKeys)
      .where(eq(userApiKeys.id, keyId));
    return key || undefined;
  }

  // Applications methods
  async getAllApplications(): Promise<Application[]> {
    return await db.select().from(applications);
  }

  async getApplication(id: number): Promise<Application | undefined> {
    const [app] = await db.select().from(applications).where(eq(applications.id, id));
    return app || undefined;
  }

  async createApplication(app: InsertApplication): Promise<Application> {
    const [newApp] = await db.insert(applications).values(app).returning();
    return newApp;
  }

  async updateApplication(id: number, updates: Partial<InsertApplication>): Promise<Application> {
    const [updatedApp] = await db
      .update(applications)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(applications.id, id))
      .returning();
    return updatedApp;
  }

  async deleteApplication(id: number): Promise<void> {
    await db.delete(applications).where(eq(applications.id, id));
  }

  // Blog posts methods
  async getAllBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts);
  }

  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts).where(eq(blogPosts.status, "published"));
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post || undefined;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post || undefined;
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [newPost] = await db.insert(blogPosts).values(post).returning();
    return newPost;
  }

  async updateBlogPost(id: number, updates: Partial<InsertBlogPost>): Promise<BlogPost> {
    const [updatedPost] = await db
      .update(blogPosts)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(blogPosts.id, id))
      .returning();
    return updatedPost;
  }

  async deleteBlogPost(id: number): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }
}

export const storage = new DatabaseStorage();