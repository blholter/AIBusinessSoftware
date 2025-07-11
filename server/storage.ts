import { users, userApiKeys, type User, type InsertUser, type UpsertUser, type UserApiKey, type InsertApiKey } from "@shared/schema";
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
}

export const storage = new DatabaseStorage();