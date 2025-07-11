import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertUserSchema } from "@shared/schema";

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

  const httpServer = createServer(app);
  return httpServer;
}
