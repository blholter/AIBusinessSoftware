import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertUserSchema, apiKeySchema } from "@shared/schema";
import { encryptApiKey, decryptApiKey, maskApiKey } from "./encryption";

// Authentication middleware
const isAuthenticated = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // User profile update
  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const updateData = insertUserSchema.parse(req.body);
      
      const updatedUser = await storage.upsertUser({
        ...req.user,
        ...updateData,
      });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Get all applications (for now, return empty array as placeholder)
  app.get('/api/applications', async (req, res) => {
    try {
      // TODO: Implement actual application storage
      const applications: any[] = [];
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // API Key management routes
  app.get('/api/user/api-keys', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const apiKeys = await storage.getUserApiKeys(userId);
      
      // Mask the API keys for security
      const maskedKeys = apiKeys.map(key => ({
        ...key,
        encryptedKey: maskApiKey(decryptApiKey(key.encryptedKey))
      }));
      
      res.json(maskedKeys);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      res.status(500).json({ message: "Failed to fetch API keys" });
    }
  });

  app.post('/api/user/api-keys', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const keyData = apiKeySchema.parse(req.body);
      
      const encryptedKey = encryptApiKey(keyData.apiKey);
      
      const newKey = await storage.createApiKey(userId, {
        provider: keyData.provider,
        keyName: keyData.keyName,
        encryptedKey,
        isActive: keyData.isActive
      });
      
      // Return the key with masked API key
      res.json({
        ...newKey,
        encryptedKey: maskApiKey(keyData.apiKey)
      });
    } catch (error) {
      console.error("Error creating API key:", error);
      res.status(500).json({ message: "Failed to create API key" });
    }
  });

  app.put('/api/user/api-keys/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const keyId = parseInt(req.params.id);
      const updates = req.body;
      
      // Verify the key belongs to the user
      const existingKey = await storage.getApiKey(keyId);
      if (!existingKey || existingKey.userId !== userId) {
        return res.status(404).json({ message: "API key not found" });
      }
      
      // If updating the API key, encrypt it
      if (updates.apiKey) {
        updates.encryptedKey = encryptApiKey(updates.apiKey);
        delete updates.apiKey;
      }
      
      const updatedKey = await storage.updateApiKey(keyId, updates);
      
      // Return with masked key
      res.json({
        ...updatedKey,
        encryptedKey: maskApiKey(decryptApiKey(updatedKey.encryptedKey))
      });
    } catch (error) {
      console.error("Error updating API key:", error);
      res.status(500).json({ message: "Failed to update API key" });
    }
  });

  app.delete('/api/user/api-keys/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const keyId = parseInt(req.params.id);
      
      // Verify the key belongs to the user
      const existingKey = await storage.getApiKey(keyId);
      if (!existingKey || existingKey.userId !== userId) {
        return res.status(404).json({ message: "API key not found" });
      }
      
      await storage.deleteApiKey(keyId);
      res.json({ message: "API key deleted successfully" });
    } catch (error) {
      console.error("Error deleting API key:", error);
      res.status(500).json({ message: "Failed to delete API key" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
