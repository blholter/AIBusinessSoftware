import { Express } from 'express';
import { createServer, Server } from 'http';
import { setupAuth } from './auth';
import { storage } from './storage';
import { insertUserSchema } from '@shared/schema';
import { enhancedAuth, strictLimiter } from './security';
import { requireAdmin } from './security';

const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Not authenticated" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Mock data storage for development mode
  let mockApps = [
    {
      id: 1,
      name: "AI Video Analysis",
      description: "Advanced video analysis workflow with AI-powered insights and processing capabilities",
      version: "1.0.0",
      author: "Agentic AI Agent Apps.com",
      category: "AI & Machine Learning",
      tags: ["video", "analysis", "ai", "workflow"],
      complexity: "complex",
      totalNodes: 22,
      nodeTypes: ["httpRequest", "formTrigger", "wait", "stickyNote", "set", "manualTrigger"],
      inputSchema: {
        type: "object",
        properties: {
          videoUrl: {
            type: "string",
            format: "url",
            title: "Video URL",
            description: "URL of the video to analyze",
            required: true
          },
          analysisType: {
            type: "string",
            enum: ["content", "sentiment", "objects", "faces", "text", "audio"],
            title: "Analysis Type",
            description: "Type of analysis to perform on the video",
            default: "content"
          }
        },
        required: ["videoUrl"]
      },
      workflowCode: "import React, { useState, useEffect } from 'react';\n\nfunction App() {\n  const [data, setData] = useState(null);\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState(null);\n\n  const processWorkflow = async (inputData) => {\n    setLoading(true);\n    setError(null);\n    \n    try {\n      await new Promise(resolve => setTimeout(resolve, 2000));\n      setData({ result: \"Video analysis completed successfully\", input: inputData });\n    } catch (err) {\n      setError(err.message);\n    } finally {\n      setLoading(false);\n    }\n  };\n\n  return (\n    <div className=\"App\">\n      <header className=\"App-header\">\n        <h1>AI Video Analysis</h1>\n        <p>Advanced video analysis workflow with AI-powered insights</p>\n      </header>\n      \n      <main>\n        <div className=\"workflow-controls\">\n          <button \n            onClick={() => processWorkflow({ \n              videoUrl: 'https://example.com/video.mp4',\n              analysisType: 'content'\n            })}\n            disabled={loading}\n          >\n            {loading ? 'Processing...' : 'Run Video Analysis'}\n          </button>\n        </div>\n        \n        {error && (\n          <div className=\"error\">\n            <h3>Error:</h3>\n            <p>{error}</p>\n          </div>\n        )}\n        \n        {data && (\n          <div className=\"result\">\n            <h3>Result:</h3>\n            <pre>{JSON.stringify(data, null, 2)}</pre>\n          </div>\n        )}\n      </main>\n    </div>\n  );\n}\n\nexport default App;",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Mock workflows storage for development mode
  let mockWorkflows = [
    {
      id: 1,
      userId: 1,
      name: "AI Video Analysis",
      description: "Advanced video analysis workflow with AI-powered insights",
      category: "AI & Machine Learning",
      status: "active",
      lastRun: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      workflowCode: `import React, { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const processWorkflow = async (inputData) => {
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setData({ result: "Video analysis completed successfully", input: inputData });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Video Analysis</h1>
        <p>Advanced video analysis workflow with AI-powered insights</p>
      </header>
      
      <main>
        <div className="workflow-controls">
          <button 
            onClick={() => processWorkflow({ 
              videoUrl: 'https://example.com/video.mp4',
              analysisType: 'content'
            })}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Run Video Analysis'}
          </button>
        </div>
        
        {error && (
          <div className="error">
            <h3>Error:</h3>
            <p>{error}</p>
          </div>
        )}
        
        {data && (
          <div className="result">
            <h3>Result:</h3>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;`,
      workflowSchema: {
        type: "object",
        properties: {
          videoUrl: {
            type: "string",
            format: "url",
            title: "Video URL",
            description: "URL of the video to analyze",
            required: true
          },
          analysisType: {
            type: "string",
            enum: ["content", "sentiment", "objects", "faces", "text", "audio"],
            title: "Analysis Type",
            description: "Type of analysis to perform on the video",
            default: "content"
          }
        },
        required: ["videoUrl"]
      }
    },
    {
      id: 2,
      userId: 1,
      name: "Email Campaign Automation",
      description: "Automated email campaign workflow with personalization",
      category: "Marketing",
      status: "completed",
      lastRun: new Date(Date.now() - 86400000).toISOString(),
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      workflowCode: `import React, { useState } from 'react';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const runEmailCampaign = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setData({ 
        status: "Email campaign sent successfully",
        recipients: 1250,
        openRate: "23.4%"
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header>
        <h1>Email Campaign Automation</h1>
        <p>Automated email campaign workflow with personalization</p>
      </header>
      
      <main>
        <button onClick={runEmailCampaign} disabled={loading}>
          {loading ? 'Sending...' : 'Send Email Campaign'}
        </button>
        
        {data && (
          <div className="result">
            <h3>Campaign Results:</h3>
            <p>Status: {data.status}</p>
            <p>Recipients: {data.recipients}</p>
            <p>Open Rate: {data.openRate}</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;`,
      workflowSchema: {
        type: "object",
        properties: {
          emailList: {
            type: "string",
            title: "Email List",
            description: "Comma-separated list of email addresses",
            required: true
          },
          subject: {
            type: "string",
            title: "Email Subject",
            description: "Subject line for the email campaign",
            required: true
          }
        },
        required: ["emailList", "subject"]
      }
    }
  ];

  // User profile update
  app.put('/api/user/profile', strictLimiter, enhancedAuth, async (req: any, res) => {
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

  // Get all applications from marketplace
  app.get('/api/applications', async (req, res) => {
    try {
      const { applications } = await import('@shared/schema');
      const { db } = await import('./db');
      
      // Check if we're using mock database
      if (process.env.NODE_ENV === 'development') {
        // Return mock data
        res.json(mockApps);
        return;
      }
      
      const marketplaceApps = await db.select().from(applications).orderBy(applications.createdAt);
      res.json(marketplaceApps);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // Get user workflows
  app.get('/api/user/workflows', async (req: any, res) => {
    // Skip authentication in development mode
    if (process.env.NODE_ENV === 'development') {
      req.user = { id: 1 }; // Mock user for development
    } else {
      // Use enhancedAuth in production
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
    }
    try {
      const userId = req.user.id;
      
      // Check if we're using mock database
      if (process.env.NODE_ENV === 'development') {
        // Return mock data for development
        res.json(mockWorkflows.filter(w => w.userId === userId));
        return;
      }
      
      const { userWorkflows } = await import('@shared/schema');
      const { db } = await import('./db');
      const { eq } = await import('drizzle-orm');
      
      const workflows = await db.select().from(userWorkflows).where(eq(userWorkflows.userId, userId));
      res.json(workflows);
    } catch (error) {
      console.error("Error fetching user workflows:", error);
      res.status(500).json({ message: "Failed to fetch user workflows" });
    }
  });

  // Create user workflow
  app.post('/api/user/workflows', async (req: any, res) => {
    // Skip authentication in development mode
    if (process.env.NODE_ENV === 'development') {
      req.user = { id: 1 }; // Mock user for development
    } else {
      // Use enhancedAuth in production
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
    }
    try {
      const userId = req.user.id;
      const { name, description, category, workflowCode, workflowSchema } = req.body;
      
      if (!name || !workflowCode) {
        return res.status(400).json({ message: "Name and workflow code are required" });
      }

      // Check if we're using mock database
      if (process.env.NODE_ENV === 'development') {
        // Simulate creating a new workflow
        const newWorkflow = {
          id: Date.now(),
          userId,
          name,
          description: description || "",
          category: category || "Other",
          status: "active",
          lastRun: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          workflowCode,
          workflowSchema: workflowSchema || null
        };
        
        mockWorkflows.push(newWorkflow);
        res.json(newWorkflow);
        return;
      }
      
      const { userWorkflows } = await import('@shared/schema');
      const { db } = await import('./db');
      
      const newWorkflow = await db.insert(userWorkflows).values({
        userId,
        name,
        description: description || "",
        category: category || "Other",
        workflowCode,
        workflowSchema: workflowSchema || null
      }).returning();
      
      res.json(newWorkflow[0]);
    } catch (error) {
      console.error("Error creating user workflow:", error);
      res.status(500).json({ message: "Failed to create user workflow" });
    }
  });

  // Update user workflow
  app.put('/api/user/workflows/:id', async (req: any, res) => {
    // Skip authentication in development mode
    if (process.env.NODE_ENV === 'development') {
      req.user = { id: 1 }; // Mock user for development
    } else {
      // Use enhancedAuth in production
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
    }
    try {
      const userId = req.user.id;
      const workflowId = parseInt(req.params.id);
      const updates = req.body;
      
      // Check if we're using mock database
      if (process.env.NODE_ENV === 'development') {
        const workflowIndex = mockWorkflows.findIndex(w => w.id === workflowId && w.userId === userId);
        if (workflowIndex === -1) {
          return res.status(404).json({ message: "Workflow not found" });
        }
        
        mockWorkflows[workflowIndex] = {
          ...mockWorkflows[workflowIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        
        res.json(mockWorkflows[workflowIndex]);
        return;
      }
      
      const { userWorkflows } = await import('@shared/schema');
      const { db } = await import('./db');
      const { eq, and } = await import('drizzle-orm');
      
      const updatedWorkflow = await db.update(userWorkflows)
        .set({ ...updates, updatedAt: new Date() })
        .where(and(eq(userWorkflows.id, workflowId), eq(userWorkflows.userId, userId)))
        .returning();
      
      if (!updatedWorkflow.length) {
        return res.status(404).json({ message: "Workflow not found" });
      }
      
      res.json(updatedWorkflow[0]);
    } catch (error) {
      console.error("Error updating user workflow:", error);
      res.status(500).json({ message: "Failed to update user workflow" });
    }
  });

  // Delete user workflow
  app.delete('/api/user/workflows/:id', async (req: any, res) => {
    // Skip authentication in development mode
    if (process.env.NODE_ENV === 'development') {
      req.user = { id: 1 }; // Mock user for development
    } else {
      // Use enhancedAuth in production
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
    }
    try {
      const userId = req.user.id;
      const workflowId = parseInt(req.params.id);
      
      // Check if we're using mock database
      if (process.env.NODE_ENV === 'development') {
        const workflowIndex = mockWorkflows.findIndex(w => w.id === workflowId && w.userId === userId);
        if (workflowIndex === -1) {
          return res.status(404).json({ message: "Workflow not found" });
        }
        
        // Remove the workflow from mock data
        mockWorkflows.splice(workflowIndex, 1);
        
        res.json({ message: "Workflow deleted successfully" });
        return;
      }
      
      const { userWorkflows } = await import('@shared/schema');
      const { db } = await import('./db');
      const { eq, and } = await import('drizzle-orm');
      
      const deletedWorkflow = await db.delete(userWorkflows)
        .where(and(eq(userWorkflows.id, workflowId), eq(userWorkflows.userId, userId)))
        .returning();
      
      if (!deletedWorkflow.length) {
        return res.status(404).json({ message: "Workflow not found" });
      }
      
      res.json({ message: "Workflow deleted successfully" });
    } catch (error) {
      console.error("Error deleting user workflow:", error);
      res.status(500).json({ message: "Failed to delete user workflow" });
    }
  });

  // API Key Management Routes
  app.get('/api/user/api-keys', strictLimiter, enhancedAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const apiKeys = await storage.getUserApiKeys(userId);
      
      // Return with masked keys
      const maskedKeys = apiKeys.map((key: any) => ({
        ...key,
        encryptedKey: key.encryptedKey.substring(0, 8) + '...'
      }));
      
      res.json(maskedKeys);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      res.status(500).json({ message: "Failed to fetch API keys" });
    }
  });

  app.post('/api/user/api-keys', strictLimiter, enhancedAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { provider, keyName, apiKey, isActive } = req.body;
      
      if (!provider || !keyName || !apiKey) {
        return res.status(400).json({ message: "Provider, key name, and API key are required" });
      }
      
      const encryptedKey = encryptApiKey(apiKey);
      const newKey = await storage.createApiKey(userId, {
        provider,
        keyName,
        encryptedKey,
        isActive: isActive !== false
      });
      // Return with masked key
      res.json({
        ...newKey,
        encryptedKey: maskApiKey(apiKey)
      });
    } catch (error) {
      console.error("Error creating API key:", error);
      res.status(500).json({ message: "Failed to create API key" });
    }
  });

  app.put('/api/user/api-keys/:id', strictLimiter, enhancedAuth, async (req: any, res) => {
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

  app.delete('/api/user/api-keys/:id', strictLimiter, enhancedAuth, async (req: any, res) => {
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

  // Admin Routes
  app.get('/api/admin/applications', requireAdmin, async (req, res) => {
    try {
      const { applications } = await import('@shared/schema');
      const { db } = await import('./db');
      
      // Check if we're using mock database
      if (process.env.NODE_ENV === 'development') {
        // Return mock data
        res.json(mockApps);
        return;
      }
      
      const marketplaceApps = await db.select().from(applications).orderBy(applications.createdAt);
      res.json(marketplaceApps);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.put('/api/admin/applications/:id', requireAdmin, async (req, res) => {
    try {
      const appId = parseInt(req.params.id, 10);
      const updates = req.body;
      
      // Check if we're using mock database
      if (process.env.NODE_ENV === 'development') {
        const appIndex = mockApps.findIndex(app => app.id === appId);
        if (appIndex === -1) {
          return res.status(404).json({ error: 'App not found' });
        }
        
        mockApps[appIndex] = {
          ...mockApps[appIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        
        res.json(mockApps[appIndex]);
        return;
      }
      
      const { applications } = await import('@shared/schema');
      const { db } = await import('./db');
      const { eq } = await import('drizzle-orm');
      
      const updatedApps = await db.update(applications)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(applications.id, appId))
        .returning();
      
      if (!updatedApps.length) {
        return res.status(404).json({ error: 'App not found' });
      }
      
      res.json(updatedApps[0]);
    } catch (error) {
      console.error('Error updating app:', error);
      res.status(500).json({ error: 'Failed to update app' });
    }
  });

  app.delete('/api/admin/applications/:id', requireAdmin, async (req, res) => {
    try {
      const appId = parseInt(req.params.id, 10);
      
      // Check if we're using mock database
      if (process.env.NODE_ENV === 'development') {
        // Find and remove the app from mock data
        const appIndex = mockApps.findIndex(app => app.id === appId);
        if (appIndex === -1) {
          return res.status(404).json({ error: 'App not found' });
        }
        
        // Remove the app from the mock data
        mockApps.splice(appIndex, 1);
        
        res.json({ message: 'App deleted successfully' });
        return;
      }
      
      const { applications, workflowConversions } = await import('@shared/schema');
      const { db } = await import('./db');
      const { eq } = await import('drizzle-orm');
      
      // Get the app to find its conversion ID
      const app = await db.select().from(applications).where(eq(applications.id, appId)).limit(1);
      if (!app.length) {
        return res.status(404).json({ error: 'App not found' });
      }
      
      // Delete the workflow conversion if it exists
      if (app[0].conversionId) {
        await db.delete(workflowConversions).where(eq(workflowConversions.id, app[0].conversionId));
      }
      
      // Delete the application
      await db.delete(applications).where(eq(applications.id, appId));
      
      res.json({ message: 'App deleted successfully' });
    } catch (error) {
      console.error('Error deleting app:', error);
      res.status(500).json({ error: 'Failed to delete app' });
    }
  });

  // Authentication routes
  app.get('/api/user', enhancedAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      // Force fresh response to prevent caching
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post('/api/register', strictLimiter, async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      
      const user = await storage.createUser({ email, password });
      res.status(201).json(user);
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.message.includes("already exists")) {
        res.status(409).json({ error: "User already exists" });
      } else {
        res.status(500).json({ error: "Registration failed" });
      }
    }
  });

  app.post('/api/login', strictLimiter, async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      // Use getUserByEmail and check password manually
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      // Simple password check (replace with real hash check in production)
      if (user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      req.login(user, (err: any) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ error: "Login failed" });
        }
        // Regenerate session to ensure fresh data
        req.session.regenerate((err: any) => {
          if (err) {
            console.error("Session regeneration error:", err);
            return res.status(500).json({ error: "Login failed" });
          }
          // Force fresh response to prevent caching
          res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.set('Pragma', 'no-cache');
          res.set('Expires', '0');
          res.json(user);
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post('/api/logout', (req, res) => {
    req.logout((err: any) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Debug endpoint to check user data
  app.get('/api/debug/user', enhancedAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({
        user,
        isAdmin: user.role === 'admin',
        sessionUser: req.user
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Application submission endpoint
  app.post('/api/applications/submit', enhancedAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { name, description, category, githubUrl, readmeUrl, demoUrl, tags, features, author, authorName } = req.body;
      
      // Validate required fields
      if (!name || !description || !category || !githubUrl) {
        return res.status(400).json({ error: "Name, description, category, and GitHub URL are required" });
      }
      
      // Validate GitHub URL format
      const githubRegex = /^https:\/\/github\.com\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+\/?$/;
      if (!githubRegex.test(githubUrl)) {
        return res.status(400).json({ error: "Invalid GitHub repository URL format" });
      }
      
      // Check if we're using mock database
      if (process.env.NODE_ENV === 'development') {
        // Simulate creating a new application submission
        const newSubmission = {
          id: Date.now(),
          name,
          description,
          category,
          githubUrl,
          readmeUrl: readmeUrl || null,
          demoUrl: demoUrl || null,
          tags: tags || [],
          features: features || [],
          author,
          authorName,
          status: 'pending', // pending, approved, rejected
          submittedBy: userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // In development, we'll just log the submission
        console.log('📝 New application submission:', newSubmission);
        
        res.status(201).json({ 
          message: "Application submitted successfully",
          submission: newSubmission
        });
        return;
      }
      
      // In production, save to database
      const { applicationSubmissions } = await import('@shared/schema');
      const { db } = await import('./db');
      
      const newSubmission = await db.insert(applicationSubmissions).values({
        name,
        description,
        category,
        githubUrl,
        readmeUrl: readmeUrl || null,
        demoUrl: demoUrl || null,
        tags: tags || [],
        features: features || [],
        author,
        authorName,
        status: 'pending',
        submittedBy: userId
      }).returning();
      
      res.status(201).json({ 
        message: "Application submitted successfully",
        submission: newSubmission[0]
      });
    } catch (error) {
      console.error("Error submitting application:", error);
      res.status(500).json({ error: "Failed to submit application" });
    }
  });

  // Blog Posts API Routes
  // Get all published blog posts (public)
  app.get('/api/blog/posts', async (req, res) => {
    try {
      const { blogPosts, users } = await import('@shared/schema');
      const { db } = await import('./db');
      const { eq, and, desc } = await import('drizzle-orm');
      
      const posts = await db
        .select({
          id: blogPosts.id,
          title: blogPosts.title,
          slug: blogPosts.slug,
          excerpt: blogPosts.excerpt,
          featuredImage: blogPosts.featuredImage,
          tags: blogPosts.tags,
          publishedAt: blogPosts.publishedAt,
          viewCount: blogPosts.viewCount,
          authorName: users.firstName,
          authorLastName: users.lastName,
        })
        .from(blogPosts)
        .leftJoin(users, eq(blogPosts.authorId, users.id))
        .where(eq(blogPosts.status, 'published'))
        .orderBy(desc(blogPosts.publishedAt));
      
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  // Get single blog post by slug (public)
  app.get('/api/blog/posts/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const { blogPosts, users } = await import('@shared/schema');
      const { db } = await import('./db');
      const { eq, and } = await import('drizzle-orm');
      
      const post = await db
        .select({
          id: blogPosts.id,
          title: blogPosts.title,
          slug: blogPosts.slug,
          content: blogPosts.content,
          excerpt: blogPosts.excerpt,
          metaDescription: blogPosts.metaDescription,
          metaKeywords: blogPosts.metaKeywords,
          featuredImage: blogPosts.featuredImage,
          tags: blogPosts.tags,
          publishedAt: blogPosts.publishedAt,
          viewCount: blogPosts.viewCount,
          seoTitle: blogPosts.seoTitle,
          seoCanonical: blogPosts.seoCanonical,
          authorName: users.firstName,
          authorLastName: users.lastName,
        })
        .from(blogPosts)
        .leftJoin(users, eq(blogPosts.authorId, users.id))
        .where(and(
          eq(blogPosts.slug, slug),
          eq(blogPosts.status, 'published')
        ))
        .limit(1);
      
      if (post.length === 0) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      
      // Increment view count
      await db
        .update(blogPosts)
        .set({ viewCount: (post[0].viewCount || 0) + 1 })
        .where(eq(blogPosts.id, post[0].id));
      
      res.json(post[0]);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ error: "Failed to fetch blog post" });
    }
  });

  // Admin routes for blog management
  // Get all blog posts (admin only)
  app.get('/api/admin/blog/posts', requireAdmin, async (req: any, res) => {
    try {
      const { blogPosts, users } = await import('@shared/schema');
      const { db } = await import('./db');
      const { desc, eq } = await import('drizzle-orm');
      
      const posts = await db
        .select({
          id: blogPosts.id,
          title: blogPosts.title,
          slug: blogPosts.slug,
          excerpt: blogPosts.excerpt,
          status: blogPosts.status,
          publishedAt: blogPosts.publishedAt,
          viewCount: blogPosts.viewCount,
          createdAt: blogPosts.createdAt,
          authorName: users.firstName,
          authorLastName: users.lastName,
        })
        .from(blogPosts)
        .leftJoin(users, eq(blogPosts.authorId, users.id))
        .orderBy(desc(blogPosts.createdAt));
      
      res.json(posts);
    } catch (error) {
      console.error("Error fetching admin blog posts:", error);
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  // Create new blog post (admin only)
  app.post('/api/admin/blog/posts', requireAdmin, async (req: any, res) => {
    try {
      const { title, content, excerpt, metaDescription, metaKeywords, featuredImage, tags, status, seoTitle, seoCanonical } = req.body;
      const authorId = req.user.id;
      
      if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required" });
      }
      
      // Generate slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      const { blogPosts } = await import('@shared/schema');
      const { db } = await import('./db');
      
      const newPost = await db.insert(blogPosts).values({
        title,
        slug,
        content,
        excerpt,
        metaDescription,
        metaKeywords,
        featuredImage,
        tags: tags || [],
        authorId,
        status: status || 'draft',
        publishedAt: status === 'published' ? new Date() : null,
        seoTitle,
        seoCanonical,
      }).returning();
      
      res.status(201).json(newPost[0]);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ error: "Failed to create blog post" });
    }
  });

  // Update blog post (admin only)
  app.put('/api/admin/blog/posts/:id', requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { title, content, excerpt, metaDescription, metaKeywords, featuredImage, tags, status, seoTitle, seoCanonical } = req.body;
      
      if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required" });
      }
      
      const { blogPosts } = await import('@shared/schema');
      const { db } = await import('./db');
      const { eq } = await import('drizzle-orm');
      
      const updateData: any = {
        title,
        content,
        excerpt,
        metaDescription,
        metaKeywords,
        featuredImage,
        tags: tags || [],
        status,
        seoTitle,
        seoCanonical,
        updatedAt: new Date(),
      };
      
      // Set publishedAt if status is being changed to published
      if (status === 'published') {
        updateData.publishedAt = new Date();
      }
      
      const updatedPost = await db
        .update(blogPosts)
        .set(updateData)
        .where(eq(blogPosts.id, parseInt(id)))
        .returning();
      
      if (updatedPost.length === 0) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      
      res.json(updatedPost[0]);
    } catch (error) {
      console.error("Error updating blog post:", error);
      res.status(500).json({ error: "Failed to update blog post" });
    }
  });

  // Delete blog post (admin only)
  app.delete('/api/admin/blog/posts/:id', requireAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { blogPosts } = await import('@shared/schema');
      const { db } = await import('./db');
      const { eq } = await import('drizzle-orm');
      
      const deletedPost = await db
        .delete(blogPosts)
        .where(eq(blogPosts.id, parseInt(id)))
        .returning();
      
      if (deletedPost.length === 0) {
        return res.status(404).json({ error: "Blog post not found" });
      }
      
      res.json({ message: "Blog post deleted successfully" });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ error: "Failed to delete blog post" });
    }
  });

  // Import and use workflow router
  const workflowRouter = (await import('./workflow-api')).default;
  app.use('/api/workflow', workflowRouter);

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions for API key encryption/decryption
function encryptApiKey(apiKey: string): string {
  // In a real implementation, use proper encryption
  return Buffer.from(apiKey).toString('base64');
}

function decryptApiKey(encryptedKey: string): string {
  // In a real implementation, use proper decryption
  return Buffer.from(encryptedKey, 'base64').toString('utf-8');
}

function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 8) {
    return '*'.repeat(apiKey.length);
  }
  return apiKey.substring(0, 4) + '*'.repeat(apiKey.length - 8) + apiKey.substring(apiKey.length - 4);
} 