import { Router } from 'express';
import { z } from 'zod';
import { db } from './db';
import { workflowConversions, workflowTemplates, nodeTypeRegistry } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { storage } from './storage';
import { decryptApiKey } from './encryption';

const router = Router();

// Validation schemas
const workflowAnalysisSchema = z.object({
  workflowName: z.string().min(1, 'Workflow name is required'),
  workflowData: z.record(z.any()).refine((data) => {
    return data.nodes && Array.isArray(data.nodes);
  }, 'Invalid workflow format: missing nodes array'),
  outputFormat: z.enum(['react', 'nodejs', 'python', 'typescript']).default('react'),
});

const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  templateType: z.enum(['react', 'nodejs', 'python', 'typescript']),
  templateCode: z.string().min(1, 'Template code is required'),
  nodeTypes: z.array(z.string()).min(1, 'At least one node type is required'),
});

// Workflow Analysis
interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  position: [number, number];
  parameters?: any;
}

interface WorkflowConnection {
  source: string;
  target: string;
  sourceOutput: string;
  targetInput: string;
}

interface WorkflowAnalysis {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  totalNodes: number;
  nodeTypes: string[];
  hasWebhooks: boolean;
  hasApiCalls: boolean;
  hasDataProcessing: boolean;
  complexity: 'simple' | 'medium' | 'complex';
  estimatedLines: number;
  supportedFormats: string[];
}

// Helper function to sanitize node type names for code generation
function sanitizeNodeTypeName(nodeType: string): string {
  // Remove n8n-specific prefixes and convert to camelCase
  let sanitized = nodeType
    .replace(/^n8n-nodes-base\./, '') // Remove n8n-nodes-base prefix
    .replace(/^n8n-/, '') // Remove n8n- prefix
    .replace(/[^a-zA-Z0-9]/g, '_') // Replace special chars with underscores
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
  
  // Convert to camelCase
  return sanitized.split('_').map((part, index) => {
    if (index === 0) return part;
    return part.charAt(0).toUpperCase() + part.slice(1);
  }).join('');
}

// Analyze workflow
function analyzeWorkflow(workflowData: any): WorkflowAnalysis {
  const nodes = workflowData.nodes || [];
  const connections = workflowData.connections || {};

  // Extract node types
  const nodeTypes = Array.from(new Set(nodes.map((node: any) => node.type))) as string[];
  
  // Analyze features
  const hasWebhooks = nodeTypes.some(type => 
    type.includes('webhook') || type.includes('trigger') || type.includes('start')
  );
  
  const hasApiCalls = nodeTypes.some(type => 
    type.includes('http') || type.includes('api') || type.includes('request') || 
    type.includes('fetch') || type.includes('axios')
  );
  
  const hasDataProcessing = nodeTypes.some(type => 
    type.includes('function') || type.includes('code') || type.includes('transform') ||
    type.includes('filter') || type.includes('switch') || type.includes('merge')
  );

  // Determine complexity
  let complexity: 'simple' | 'medium' | 'complex' = 'simple';
  if (nodes.length > 15 || nodeTypes.length > 8) {
    complexity = 'complex';
  } else if (nodes.length > 8 || nodeTypes.length > 5) {
    complexity = 'medium';
  }

  // Estimate lines of code
  const estimatedLines = nodes.length * 15 + (hasWebhooks ? 50 : 0) + (hasApiCalls ? 100 : 0);

  // Determine supported output formats
  const supportedFormats: string[] = ['react'];
  if (hasApiCalls) supportedFormats.push('nodejs');
  if (hasDataProcessing) supportedFormats.push('python', 'typescript');

  // Parse connections
  const parsedConnections: WorkflowConnection[] = Object.entries(connections).flatMap(([sourceId, targets]: [string, any]) =>
    Object.entries(targets).flatMap(([sourceOutput, targetList]: [string, any]) =>
      targetList.map((target: any) => ({
        source: sourceId,
        target: target.node,
        sourceOutput,
        targetInput: target.index
      }))
    )
  );

  return {
    nodes: nodes.map((node: any) => ({
      id: node.id,
      name: node.name,
      type: node.type,
      position: node.position,
      parameters: node.parameters
    })),
    connections: parsedConnections,
    totalNodes: nodes.length,
    nodeTypes,
    hasWebhooks,
    hasApiCalls,
    hasDataProcessing,
    complexity,
    estimatedLines,
    supportedFormats
  };
}

// Get user API keys for code generation
async function getUserApiKeysForCode(userId: number): Promise<Record<string, string>> {
  try {
    // Check if we're using mock database
    if (process.env.NODE_ENV === 'development') {
      // Return mock API keys for development
      return {
        'openai': 'sk-mock-openai-key-for-development',
        'google': 'mock-google-api-key-for-development',
        'aws': 'mock-aws-access-key-for-development'
      };
    }
    
    const apiKeys = await storage.getUserApiKeys(userId);
    const apiKeyMap: Record<string, string> = {};
    
    for (const key of apiKeys) {
      if (key.isActive) {
        const decryptedKey = decryptApiKey(key.encryptedKey);
        apiKeyMap[key.provider] = decryptedKey;
      }
    }
    
    return apiKeyMap;
  } catch (error) {
    console.error('Error fetching user API keys:', error);
    return {};
  }
}

// Node type to API integration mapping
const NODE_TYPE_MAPPINGS: Record<string, string> = {
  // AI/LLM Nodes
  'n8n-nodes-base.openAi': 'openai',
  'n8n-nodes-base.anthropic': 'anthropic', 
  'n8n-nodes-base.googleAi': 'google',
  'n8n-nodes-base.cohere': 'cohere',
  'n8n-nodes-base.huggingFace': 'huggingface',
  
  // HTTP/API Nodes
  'n8n-nodes-base.httpRequest': 'http',
  'n8n-nodes-base.webhook': 'webhook',
  'n8n-nodes-base.respondToWebhook': 'webhook_response',
  
  // Data Processing Nodes
  'n8n-nodes-base.function': 'javascript',
  'n8n-nodes-base.code': 'javascript',
  'n8n-nodes-base.if': 'conditional',
  'n8n-nodes-base.switch': 'conditional',
  'n8n-nodes-base.merge': 'data_merge',
  'n8n-nodes-base.splitInBatches': 'batch_processing',
  'n8n-nodes-base.filter': 'data_filter',
  'n8n-nodes-base.set': 'data_transform',
  
  // File Operations
  'n8n-nodes-base.readBinaryFile': 'file_read',
  'n8n-nodes-base.writeBinaryFile': 'file_write',
  'n8n-nodes-base.readPdf': 'pdf_processing',
  'n8n-nodes-base.readExcel': 'excel_processing',
  'n8n-nodes-base.writeExcel': 'excel_processing',
  
  // Database Nodes
  'n8n-nodes-base.postgres': 'postgres',
  'n8n-nodes-base.mysql': 'mysql',
  'n8n-nodes-base.mongodb': 'mongodb',
  'n8n-nodes-base.supabase': 'supabase',
  
  // Email Nodes
  'n8n-nodes-base.emailSend': 'email',
  'n8n-nodes-base.emailRead': 'email',
  'n8n-nodes-base.gmail': 'gmail',
  
  // Social Media
  'n8n-nodes-base.twitter': 'twitter',
  'n8n-nodes-base.linkedIn': 'linkedin',
  'n8n-nodes-base.facebook': 'facebook',
  
  // Cloud Services
  'n8n-nodes-base.awsS3': 'aws_s3',
  'n8n-nodes-base.googleDrive': 'google_drive',
  'n8n-nodes-base.dropbox': 'dropbox',
  'n8n-nodes-base.oneDrive': 'onedrive',
  
  // Communication
  'n8n-nodes-base.slack': 'slack',
  'n8n-nodes-base.discord': 'discord',
  'n8n-nodes-base.telegram': 'telegram',
  'n8n-nodes-base.whatsApp': 'whatsapp',
  
  // CRM/Sales
  'n8n-nodes-base.salesforce': 'salesforce',
  'n8n-nodes-base.hubspot': 'hubspot',
  'n8n-nodes-base.pipedrive': 'pipedrive',
  'n8n-nodes-base.zoho': 'zoho',
  
  // Analytics
  'n8n-nodes-base.googleAnalytics': 'google_analytics',
  'n8n-nodes-base.mixpanel': 'mixpanel',
  'n8n-nodes-base.amplitude': 'amplitude',
  
  // Payment Processing
  'n8n-nodes-base.stripe': 'stripe',
  'n8n-nodes-base.paypal': 'paypal',
  'n8n-nodes-base.square': 'square',
  
  // Scheduling
  'n8n-nodes-base.cron': 'scheduler',
  'n8n-nodes-base.schedule': 'scheduler',
  'n8n-nodes-base.dateTime': 'datetime',
  
  // Utilities
  'n8n-nodes-base.wait': 'delay',
  'n8n-nodes-base.noOp': 'noop',
  'n8n-nodes-base.stickyNote': 'comment',
  'n8n-nodes-base.start': 'trigger',
  'n8n-nodes-base.manual': 'manual_trigger'
};

// API integration templates
const API_INTEGRATION_TEMPLATES: Record<string, {
  imports: string[];
  config: string | null;
  functions: string;
  nodeProcessor: string;
}> = {
  openai: {
    imports: ['fetch'],
    config: 'OPENAI_API_KEY',
    functions: `
async function callOpenAI(prompt: string, model = 'gpt-3.5-turbo', maxTokens = 1000) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${API_CONFIG.OPENAI_API_KEY}\`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(\`OpenAI API error: \${response.status}\`);
    }
    
    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}`,
    nodeProcessor: `
    // OpenAI integration
    if (input.prompt || input.text) {
      const prompt = input.prompt || input.text;
      const aiResponse = await callOpenAI(prompt, input.model || 'gpt-3.5-turbo');
      return { 
        ...input, 
        aiResponse, 
        processed: true,
        timestamp: new Date().toISOString()
      };
    }`
  },
  
  anthropic: {
    imports: ['fetch'],
    config: 'ANTHROPIC_API_KEY',
    functions: `
async function callAnthropic(prompt: string, model = 'claude-3-sonnet-20240229', maxTokens = 1000) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_CONFIG.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    
    if (!response.ok) {
      throw new Error(\`Anthropic API error: \${response.status}\`);
    }
    
    const data = await response.json();
    return data.content[0]?.text || '';
  } catch (error) {
    console.error('Anthropic API error:', error);
    throw error;
  }
}`,
    nodeProcessor: `
    // Anthropic integration
    if (input.prompt || input.text) {
      const prompt = input.prompt || input.text;
      const aiResponse = await callAnthropic(prompt, input.model || 'claude-3-sonnet-20240229');
      return { 
        ...input, 
        aiResponse, 
        processed: true,
        timestamp: new Date().toISOString()
      };
    }`
  },
  
  google: {
    imports: ['fetch'],
    config: 'GOOGLE_API_KEY',
    functions: `
async function callGoogleAI(prompt: string, model = 'gemini-pro', maxTokens = 1000) {
  try {
    const response = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/\${model}:generateContent?key=\${API_CONFIG.GOOGLE_API_KEY}\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 0.7
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(\`Google AI API error: \${response.status}\`);
    }
    
    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || '';
  } catch (error) {
    console.error('Google AI API error:', error);
    throw error;
  }
}`,
    nodeProcessor: `
    // Google AI integration
    if (input.prompt || input.text) {
      const prompt = input.prompt || input.text;
      const aiResponse = await callGoogleAI(prompt, input.model || 'gemini-pro');
      return { 
        ...input, 
        aiResponse, 
        processed: true,
        timestamp: new Date().toISOString()
      };
    }`
  },
  
  http: {
    imports: ['fetch'],
    config: null,
    functions: `
async function makeHttpRequest(url: string, options: any = {}) {
  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: options.headers || {},
      body: options.body ? JSON.stringify(options.body) : undefined,
      ...options
    });
    
    if (!response.ok) {
      throw new Error(\`HTTP error: \${response.status}\`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error('HTTP request error:', error);
    throw error;
  }
}`,
    nodeProcessor: `
    // HTTP request integration
    if (input.url) {
      const response = await makeHttpRequest(input.url, {
        method: input.method || 'GET',
        headers: input.headers || {},
        body: input.body
      });
      return { 
        ...input, 
        response, 
        processed: true,
        timestamp: new Date().toISOString()
      };
    }`
  },
  
  javascript: {
    imports: [],
    config: null,
    functions: '',
    nodeProcessor: `
    // JavaScript function execution
    if (input.function || input.code) {
      try {
        const code = input.function || input.code;
        // Note: In a real implementation, you'd want to sandbox this execution
        const result = eval(code);
        return { 
          ...input, 
          result, 
          processed: true,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        console.error('JavaScript execution error:', error);
        return { 
          ...input, 
          error: error.message, 
          processed: false,
          timestamp: new Date().toISOString()
        };
      }
    }`
  },
  
  conditional: {
    imports: [],
    config: null,
    functions: '',
    nodeProcessor: `
    // Conditional logic
    if (input.condition) {
      const condition = input.condition;
      const isTrue = eval(condition); // In production, use a safe expression evaluator
      return { 
        ...input, 
        conditionResult: isTrue,
        processed: true,
        timestamp: new Date().toISOString()
      };
    }`
  },
  
  data_merge: {
    imports: [],
    config: null,
    functions: '',
    nodeProcessor: `
    // Data merge operation
    if (input.data1 && input.data2) {
      const merged = { ...input.data1, ...input.data2 };
      return { 
        ...input, 
        mergedData: merged,
        processed: true,
        timestamp: new Date().toISOString()
      };
    }`
  },
  
  data_filter: {
    imports: [],
    config: null,
    functions: '',
    nodeProcessor: `
    // Data filtering
    if (input.data && input.filter) {
      const filtered = input.data.filter(item => {
        try {
          return eval(input.filter.replace('item', JSON.stringify(item)));
        } catch {
          return true;
        }
      });
      return { 
        ...input, 
        filteredData: filtered,
        processed: true,
        timestamp: new Date().toISOString()
      };
    }`
  },
  
  email: {
    imports: ['nodemailer'],
    config: 'EMAIL_CONFIG',
    functions: `
// Email configuration would be set up here
// This is a placeholder for email functionality
async function sendEmail(to: string, subject: string, body: string) {
  // In a real implementation, you'd use nodemailer or similar
  console.log('Email would be sent:', { to, subject, body });
  return { success: true, messageId: Date.now().toString() };
}`,
    nodeProcessor: `
    // Email sending
    if (input.to && input.subject) {
      const emailResult = await sendEmail(input.to, input.subject, input.body || '');
      return { 
        ...input, 
        emailResult, 
        processed: true,
        timestamp: new Date().toISOString()
      };
    }`
  },
  
  scheduler: {
    imports: [],
    config: null,
    functions: '',
    nodeProcessor: `
    // Scheduler/trigger logic
    const now = new Date();
    const shouldTrigger = input.schedule ? 
      eval(input.schedule.replace('now', now.getTime().toString())) : 
      true;
    
    return { 
      ...input, 
      shouldTrigger,
      currentTime: now.toISOString(),
      processed: true,
      timestamp: new Date().toISOString()
    }`
  },
  
  delay: {
    imports: [],
    config: null,
    functions: '',
    nodeProcessor: `
    // Delay/wait functionality
    if (input.delayMs) {
      await new Promise(resolve => setTimeout(resolve, parseInt(input.delayMs)));
    }
    return { 
      ...input, 
      delayed: true,
      processed: true,
      timestamp: new Date().toISOString()
    }`
  },
  
  noop: {
    imports: [],
    config: null,
    functions: '',
    nodeProcessor: `
    // No operation - just pass through
    return { 
      ...input, 
      processed: true,
      timestamp: new Date().toISOString()
    }`
  },
  
  comment: {
    imports: [],
    config: null,
    functions: '',
    nodeProcessor: `
    // Comment/sticky note - just pass through
    return { 
      ...input, 
      processed: true,
      timestamp: new Date().toISOString()
    }`
  },
  
  manual_trigger: {
    imports: [],
    config: null,
    functions: '',
    nodeProcessor: `
    // Manual trigger - start of workflow
    return { 
      ...input, 
      triggered: true,
      processed: true,
      timestamp: new Date().toISOString()
    }`
  }
};

// Enhanced node type mapping function
function mapNodeTypeToIntegration(nodeType: string): string {
  // Direct mapping
  if (NODE_TYPE_MAPPINGS[nodeType]) {
    return NODE_TYPE_MAPPINGS[nodeType];
  }
  
  // Pattern matching for common node types
  if (nodeType.includes('openai') || nodeType.includes('gpt')) return 'openai';
  if (nodeType.includes('anthropic') || nodeType.includes('claude')) return 'anthropic';
  if (nodeType.includes('google') || nodeType.includes('gemini')) return 'google';
  if (nodeType.includes('http') || nodeType.includes('request')) return 'http';
  if (nodeType.includes('function') || nodeType.includes('code')) return 'javascript';
  if (nodeType.includes('if') || nodeType.includes('switch')) return 'conditional';
  if (nodeType.includes('merge') || nodeType.includes('combine')) return 'data_merge';
  if (nodeType.includes('filter')) return 'data_filter';
  if (nodeType.includes('email') || nodeType.includes('mail')) return 'email';
  if (nodeType.includes('cron') || nodeType.includes('schedule')) return 'scheduler';
  if (nodeType.includes('wait') || nodeType.includes('delay')) return 'delay';
  if (nodeType.includes('sticky') || nodeType.includes('note')) return 'comment';
  if (nodeType.includes('start') || nodeType.includes('trigger')) return 'manual_trigger';
  
  // Default to noop for unknown types
  return 'noop';
}

// Generate React code with real API integrations
function generateReactCodeWithApiKeys(analysis: WorkflowAnalysis, apiKeys: Record<string, string>): string {
  const { nodes, connections, complexity, totalNodes, nodeTypes } = analysis;
  
  // Map node types to integrations
  const nodeIntegrations = nodes.map(node => ({
    ...node,
    integration: mapNodeTypeToIntegration(node.type)
  }));
  
  // Collect unique integrations needed
  const neededIntegrations = Array.from(new Set(nodeIntegrations.map(n => n.integration)));
  
  // Generate API configuration
  const apiKeyConfig = Object.entries(apiKeys).map(([provider, key]) => 
    `  ${provider.toUpperCase()}_API_KEY: '${key}',`
  ).join('\n');
  
  // Generate integration functions
  const integrationFunctions = neededIntegrations
    .map(integration => {
      const template = API_INTEGRATION_TEMPLATES[integration];
      return template ? template.functions : '';
    })
    .filter(Boolean)
    .join('\n\n');
  
  // Generate node processing functions
  const nodeProcessors = nodeIntegrations.map(node => {
    const template = API_INTEGRATION_TEMPLATES[node.integration];
    const processor = template ? template.nodeProcessor : `
    // Unknown node type: ${node.type}
    console.log('Processing ${node.name} with input:', input);
    return { 
      ...input, 
      processed: true,
      timestamp: new Date().toISOString()
    };`;
    
    return `  const process${sanitizeNodeTypeName(node.type)}Node = async (input) => {
    console.log('Processing ${node.name} (${node.integration}) with input:', input);${processor}
  };`;
  }).join('\n\n');
  
  // Generate workflow execution logic
  const workflowExecution = nodeIntegrations.map((node, index) => 
    `      // Step ${index + 1}: Process ${node.name} (${node.integration})
      result = await process${sanitizeNodeTypeName(node.type)}Node(result);`
  ).join('\n');
  
  return `import React, { useState, useEffect } from 'react';
import './App.css';

// Generated from workflow analysis with real API integrations
// Total nodes: ${totalNodes}
// Complexity: ${complexity}
// Node types: ${nodeTypes.join(', ')}

// API Configuration (User's API Keys)
const API_CONFIG = {
${apiKeyConfig}
};

// API Integration Functions
${integrationFunctions}

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [executionLog, setExecutionLog] = useState([]);

  // Workflow nodes with integrations:
${nodeIntegrations.map(node => `  // - ${node.name} (${node.type}) → ${node.integration}`).join('\n')}

  const processWorkflow = async (inputData) => {
    setLoading(true);
    setError(null);
    setExecutionLog([]);
    
    try {
      let result = inputData;
      const log = [];
      
      // Execute workflow step by step
${workflowExecution}
      
      setData(result);
      setExecutionLog(log);
    } catch (err) {
      setError(err.message);
      console.error('Workflow execution error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Node processing functions
${nodeProcessors}

  return (
    <div className="App">
      <header className="App-header">
        <h1>Generated Web App with Real API Integration</h1>
        <p>Based on workflow with ${totalNodes} nodes</p>
        <p>Available APIs: ${Object.keys(apiKeys).join(', ') || 'None configured'}</p>
      </header>
      
      <main>
        <div className="workflow-info">
          <h2>Workflow Information</h2>
          <p><strong>Complexity:</strong> ${complexity}</p>
          <p><strong>Total Nodes:</strong> ${totalNodes}</p>
          <p><strong>Node Types:</strong> {nodeTypes.join(', ')}</p>
          <p><strong>Integrations:</strong> {neededIntegrations.join(', ')}</p>
          ${analysis.hasWebhooks ? '<p><strong>Features:</strong> Webhooks detected</p>' : ''}
          ${analysis.hasApiCalls ? '<p><strong>Features:</strong> API calls detected</p>' : ''}
          <p><strong>API Keys:</strong> {Object.keys(apiKeys).length} configured</p>
        </div>
        
        <div className="workflow-controls">
          <button 
            onClick={() => processWorkflow({ 
              test: 'data', 
              prompt: 'Hello, how are you?',
              timestamp: new Date().toISOString()
            })}
            disabled={loading}
            className="run-button"
          >
            {loading ? 'Processing...' : 'Run Workflow with Real APIs'}
          </button>
        </div>
        
        {error && (
          <div className="error">
            <h3>Error:</h3>
            <p>{error}</p>
          </div>
        )}
        
        {executionLog.length > 0 && (
          <div className="execution-log">
            <h3>Execution Log:</h3>
            <ul>
              {executionLog.map((log, index) => (
                <li key={index}>{log}</li>
              ))}
            </ul>
          </div>
        )}
        
        {data && (
          <div className="result">
            <h3>Result:</h3>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </main>
      
      <style jsx>{\`
        .App {
          text-align: center;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        .App-header {
          background-color: #282c34;
          padding: 20px;
          color: white;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .workflow-info {
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          text-align: left;
        }
        .workflow-controls {
          margin: 20px 0;
        }
        .run-button {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
        }
        .run-button:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }
        .error {
          background-color: #f8d7da;
          color: #721c24;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .execution-log {
          background-color: #e7f3ff;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: left;
        }
        .result {
          background-color: #d4edda;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: left;
        }
        .result pre {
          white-space: pre-wrap;
          word-wrap: break-word;
        }
      \`}</style>
    </div>
  );
}

export default App;
`;
}

// Generate NodeJS code with API integrations
function generateNodeJSCodeWithApiKeys(analysis: WorkflowAnalysis, apiKeys: Record<string, string>): string {
  const { nodes, connections, complexity, totalNodes, nodeTypes } = analysis;
  
  // Map node types to integrations
  const nodeIntegrations = nodes.map(node => ({
    ...node,
    integration: mapNodeTypeToIntegration(node.type)
  }));
  
  // Collect unique integrations needed
  const neededIntegrations = Array.from(new Set(nodeIntegrations.map(n => n.integration)));
  
  // Generate API configuration
  const apiKeyConfig = Object.entries(apiKeys).map(([provider, key]) => 
    `  ${provider.toUpperCase()}_API_KEY: '${key}',`
  ).join('\n');
  
  // Generate integration functions for NodeJS
  const integrationFunctions = neededIntegrations
    .map(integration => {
      const template = API_INTEGRATION_TEMPLATES[integration];
      if (!template) return '';
      
      // Convert fetch to node-fetch for NodeJS
      let functions = template.functions;
      if (template.imports.includes('fetch')) {
        functions = functions.replace(/fetch\(/g, 'fetch(');
      }
      return functions;
    })
    .filter(Boolean)
    .join('\n\n');
  
  // Generate node processing functions
  const nodeProcessors = nodeIntegrations.map(node => {
    const template = API_INTEGRATION_TEMPLATES[node.integration];
    const processor = template ? template.nodeProcessor : `
    // Unknown node type: ${node.type}
    console.log('Processing ${node.name} with input:', input);
    return { 
      ...input, 
      processed: true,
      timestamp: new Date().toISOString()
    };`;
    
    return `async function process${sanitizeNodeTypeName(node.type)}Node(input) {
  console.log('Processing ${node.name} (${node.integration}) with input:', input);${processor}
}`;
  }).join('\n\n');
  
  // Generate workflow execution logic
  const workflowExecution = nodeIntegrations.map((node, index) => 
    `  // Step ${index + 1}: Process ${node.name} (${node.integration})
  result = await process${sanitizeNodeTypeName(node.type)}Node(result);`
  ).join('\n');
  
  return `const fetch = require('node-fetch');

// Generated from workflow analysis with real API integrations
// Total nodes: ${totalNodes}
// Complexity: ${complexity}
// Node types: ${nodeTypes.join(', ')}

// API Configuration (User's API Keys)
const API_CONFIG = {
${apiKeyConfig}
};

// API Integration Functions
${integrationFunctions}

// Node processing functions
${nodeProcessors}

// Main workflow execution function
async function executeWorkflow(inputData) {
  console.log('Starting workflow execution...');
  
  try {
    let result = inputData;
    
    // Execute workflow step by step
${workflowExecution}
    
    console.log('Workflow completed successfully');
    return result;
  } catch (error) {
    console.error('Workflow execution error:', error);
    throw error;
  }
}

// Example usage
async function main() {
  try {
    const result = await executeWorkflow({
      test: 'data',
      prompt: 'Hello, how are you?',
      timestamp: new Date().toISOString()
    });
    
    console.log('Workflow result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Export for use in other modules
module.exports = {
  executeWorkflow,
  processWorkflow: executeWorkflow
};

// Run if this file is executed directly
if (require.main === module) {
  main();
}
`;
}

// Generate Python code with API integrations
function generatePythonCodeWithApiKeys(analysis: WorkflowAnalysis, apiKeys: Record<string, string>): string {
  const { nodes, connections, complexity, totalNodes, nodeTypes } = analysis;
  
  // Map node types to integrations
  const nodeIntegrations = nodes.map(node => ({
    ...node,
    integration: mapNodeTypeToIntegration(node.type)
  }));
  
  // Collect unique integrations needed
  const neededIntegrations = Array.from(new Set(nodeIntegrations.map(n => n.integration)));
  
  // Generate API configuration
  const apiKeyConfig = Object.entries(apiKeys).map(([provider, key]) => 
    `    "${provider.toUpperCase()}": "${key}",`
  ).join('\n');
  
  // Generate integration functions for Python
  const integrationFunctions = neededIntegrations
    .map(integration => {
      if (integration === 'openai') {
        return `
async def call_openai(prompt: str, model: str = "gpt-3.5-turbo", max_tokens: int = 1000):
    """Call OpenAI API"""
    import aiohttp
    import json
    
    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_CONFIG['OPENAI']}"
    }
    data = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
        "temperature": 0.7
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(url, headers=headers, json=data) as response:
            if response.status != 200:
                raise Exception(f"OpenAI API error: {response.status}")
            result = await response.json()
            return result["choices"][0]["message"]["content"]`;
      } else if (integration === 'http') {
        return `
async def make_http_request(url: str, method: str = "GET", headers: dict = None, body: dict = None):
    """Make HTTP request"""
    import aiohttp
    import json
    
    async with aiohttp.ClientSession() as session:
        async with session.request(method, url, headers=headers, json=body) as response:
            if response.status >= 400:
                raise Exception(f"HTTP error: {response.status}")
            
            content_type = response.headers.get('content-type', '')
            if 'application/json' in content_type:
                return await response.json()
            else:
                return await response.text()`;
      }
      return '';
    })
    .filter(Boolean)
    .join('\n');
  
  // Generate node processing functions
  const nodeProcessors = nodeIntegrations.map(node => {
    let processor = '';
    if (node.integration === 'openai') {
      processor = `
    # OpenAI integration
    if input.get('prompt') or input.get('text'):
        prompt = input.get('prompt') or input.get('text')
        ai_response = await call_openai(prompt, input.get('model', 'gpt-3.5-turbo'))
        return {
            **input,
            'ai_response': ai_response,
            'processed': True,
            'timestamp': datetime.now().isoformat()
        }`;
    } else if (node.integration === 'http') {
      processor = `
    # HTTP request integration
    if input.get('url'):
        response = await make_http_request(
            input['url'],
            input.get('method', 'GET'),
            input.get('headers', {}),
            input.get('body')
        )
        return {
            **input,
            'response': response,
            'processed': True,
            'timestamp': datetime.now().isoformat()
        }`;
    } else {
      processor = `
    # Unknown node type: ${node.type}
    print(f'Processing {node.name} with input: {input}')
    return {
        **input,
        'processed': True,
        'timestamp': datetime.now().isoformat()
    }`;
    }
    
    return `async def process_${sanitizeNodeTypeName(node.type).toLowerCase()}_node(input):
    """Process ${node.name} (${node.integration}) node"""
    print(f'Processing {node.name} ({node.integration}) with input: {input}')${processor}`;
  }).join('\n\n');
  
  // Generate workflow execution logic
  const workflowExecution = nodeIntegrations.map((node, index) => 
    `    # Step ${index + 1}: Process ${node.name} (${node.integration})
    result = await process_${sanitizeNodeTypeName(node.type).toLowerCase()}_node(result)`
  ).join('\n');
  
  return `import asyncio
import json
from datetime import datetime
from typing import Dict, Any

# Generated from workflow analysis with real API integrations
# Total nodes: ${totalNodes}
# Complexity: ${complexity}
# Node types: ${nodeTypes.join(', ')}

# API Configuration (User's API Keys)
API_CONFIG = {
${apiKeyConfig}
}

# API Integration Functions
${integrationFunctions}

# Node processing functions
${nodeProcessors}

async def execute_workflow(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Execute the workflow with real API integrations"""
    print("Starting workflow execution...")
    
    try:
        result = input_data
        
        # Execute workflow step by step
${workflowExecution}
        
        print("Workflow completed successfully")
        return result
    except Exception as error:
        print(f"Workflow execution error: {error}")
        raise error

async def main():
    """Main function for testing"""
    try:
        result = await execute_workflow({
            "test": "data",
            "prompt": "Hello, how are you?",
            "timestamp": datetime.now().isoformat()
        })
        
        print("Workflow result:", json.dumps(result, indent=2))
    except Exception as error:
        print(f"Error: {error}")

if __name__ == "__main__":
    asyncio.run(main())
`;
}

// Generate TypeScript code with API integrations
function generateTypeScriptCodeWithApiKeys(analysis: WorkflowAnalysis, apiKeys: Record<string, string>): string {
  const { nodes, connections, complexity, totalNodes, nodeTypes } = analysis;
  
  // Map node types to integrations
  const nodeIntegrations = nodes.map(node => ({
    ...node,
    integration: mapNodeTypeToIntegration(node.type)
  }));
  
  // Collect unique integrations needed
  const neededIntegrations = Array.from(new Set(nodeIntegrations.map(n => n.integration)));
  
  // Generate API configuration
  const apiKeyConfig = Object.entries(apiKeys).map(([provider, key]) => 
    `  ${provider.toUpperCase()}_API_KEY: '${key}',`
  ).join('\n');
  
  // Generate integration functions for TypeScript
  const integrationFunctions = neededIntegrations
    .map(integration => {
      const template = API_INTEGRATION_TEMPLATES[integration];
      if (!template) return '';
      
      // Add TypeScript types
      let functions = template.functions;
      functions = functions.replace(/async function /g, 'async function ');
      functions = functions.replace(/\(/g, '(input: any): Promise<any> {');
      return functions;
    })
    .filter(Boolean)
    .join('\n\n');
  
  // Generate node processing functions
  const nodeProcessors = nodeIntegrations.map(node => {
    const template = API_INTEGRATION_TEMPLATES[node.integration];
    const processor = template ? template.nodeProcessor : `
    // Unknown node type: ${node.type}
    console.log('Processing ${node.name} with input:', input);
    return { 
      ...input, 
      processed: true,
      timestamp: new Date().toISOString()
    };`;
    
    return `const process${sanitizeNodeTypeName(node.type)}Node = async (input: any): Promise<any> => {
  console.log('Processing ${node.name} (${node.integration}) with input:', input);${processor}
};`;
  }).join('\n\n');
  
  // Generate workflow execution logic
  const workflowExecution = nodeIntegrations.map((node, index) => 
    `    // Step ${index + 1}: Process ${node.name} (${node.integration})
    result = await process${sanitizeNodeTypeName(node.type)}Node(result);`
  ).join('\n');
  
  return `// Generated from workflow analysis with real API integrations
// Total nodes: ${totalNodes}
// Complexity: ${complexity}
// Node types: ${nodeTypes.join(', ')}

// Types
interface WorkflowInput {
  [key: string]: any;
}

interface WorkflowResult {
  [key: string]: any;
}

// API Configuration (User's API Keys)
const API_CONFIG: Record<string, string> = {
${apiKeyConfig}
};

// API Integration Functions
${integrationFunctions}

// Node processing functions
${nodeProcessors}

// Main workflow execution function
const executeWorkflow = async (inputData: WorkflowInput): Promise<WorkflowResult> => {
  console.log('Starting workflow execution...');
  
  try {
    let result: WorkflowResult = inputData;
    
    // Execute workflow step by step
${workflowExecution}
    
    console.log('Workflow completed successfully');
    return result;
  } catch (error) {
    console.error('Workflow execution error:', error);
    throw error;
  }
};

// Example usage
const main = async (): Promise<void> => {
  try {
    const result = await executeWorkflow({
      test: 'data',
      prompt: 'Hello, how are you?',
      timestamp: new Date().toISOString()
    });
    
    console.log('Workflow result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
  }
};

// Export for use in other modules
export { executeWorkflow };

// Run if this file is executed directly
if (require.main === module) {
  main();
}
`;
}

// Generate marketplace-ready application data
function generateMarketplaceApp(analysis: WorkflowAnalysis, workflowName: string, userId: number): any {
  const { nodes, connections, complexity, totalNodes, nodeTypes } = analysis;
  
  // Determine category based on node types
  let category = 'other';
  if (nodeTypes.some(type => type.includes('openai') || type.includes('anthropic') || type.includes('google'))) {
    category = 'ai';
  } else if (nodeTypes.some(type => type.includes('http') || type.includes('api'))) {
    category = 'integration';
  } else if (nodeTypes.some(type => type.includes('email') || type.includes('gmail'))) {
    category = 'communication';
  } else if (nodeTypes.some(type => type.includes('sheet') || type.includes('excel'))) {
    category = 'productivity';
  }
  
  // Generate icon based on category
  const icons = {
    ai: '🤖',
    integration: '🔗',
    communication: '📧',
    productivity: '📊',
    other: '⚡'
  };
  
  // Generate description
      const description = `AI-powered workflow automation with ${totalNodes} nodes. Features: ${nodeTypes.slice(0, 3).join(', ')}${nodeTypes.length > 3 ? ' and more' : ''}.`;
  
  return {
    name: workflowName,
    description,
    category,
    icon: icons[category as keyof typeof icons] || icons.other,
    rating: 0,
    downloads: 0,
    workflowAnalysis: analysis,
    generatedCode: '', // Will be populated by the code generation
    userId,
    isGenerated: true,
    features: {
      hasWebhooks: analysis.hasWebhooks,
      hasApiCalls: analysis.hasApiCalls,
      hasDataProcessing: analysis.hasDataProcessing,
      complexity,
      totalNodes,
      nodeTypes
    }
  };
}

// Enhanced code generation with marketplace integration
async function generateCodeWithApiKeys(analysis: WorkflowAnalysis, outputFormat: string, userId: number): Promise<string> {
  const apiKeys = await getUserApiKeysForCode(userId);
  
  switch (outputFormat) {
    case 'react':
      return generateReactCodeWithApiKeys(analysis, apiKeys);
    case 'nodejs':
      return generateNodeJSCodeWithApiKeys(analysis, apiKeys);
    case 'python':
      return generatePythonCodeWithApiKeys(analysis, apiKeys);
    case 'typescript':
      return generateTypeScriptCodeWithApiKeys(analysis, apiKeys);
    default:
      throw new Error(`Unsupported output format: ${outputFormat}`);
  }
}

// API Routes

// Analyze workflow
router.post('/analyze', async (req, res) => {
  try {
    const { workflowName, workflowData, outputFormat } = workflowAnalysisSchema.parse(req.body);
    
    const analysis = analyzeWorkflow(workflowData);
    
    res.json({
      success: true,
      analysis,
      supportedFormats: analysis.supportedFormats
    });
  } catch (error) {
    console.error('Workflow analysis error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Invalid workflow data'
    });
  }
});

// Generate code from workflow with API key integration
router.post('/generate', async (req, res) => {
  try {
    const { workflowName, workflowData, outputFormat } = workflowAnalysisSchema.parse(req.body);
    const userId = (req.user as any)?.id || 1; // Default to user ID 1 for now
    
    const analysis = analyzeWorkflow(workflowData);
    
    // Use enhanced code generation with API keys
    const generatedCode = await generateCodeWithApiKeys(analysis, outputFormat, userId);
    
    // Get user's API keys for the response
    const apiKeys = await getUserApiKeysForCode(userId);
    const availableApis = Object.keys(apiKeys);
    
    res.json({
      success: true,
      analysis,
      generatedCode,
      outputFormat,
      availableApis,
      apiKeyCount: availableApis.length
    });
  } catch (error) {
    console.error('Code generation error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Code generation failed'
    });
  }
});

// Save workflow conversion with API key integration
router.post('/save', async (req, res) => {
  try {
    const { workflowName, workflowData, outputFormat } = workflowAnalysisSchema.parse(req.body);
    const userId = (req.user as any)?.id || 1; // Default to user ID 1 for now
    
    const analysis = analyzeWorkflow(workflowData);
    
    // Use enhanced code generation with API keys
    const generatedCode = await generateCodeWithApiKeys(analysis, outputFormat, userId);
    
    const conversion = await db.insert(workflowConversions).values({
      userId,
      workflowName,
      originalWorkflow: workflowData,
      workflowAnalysis: analysis,
      generatedCode,
      outputFormat,
      status: 'completed'
    }).returning();
    
    // Get user's API keys for the response
    const apiKeys = await getUserApiKeysForCode(userId);
    const availableApis = Object.keys(apiKeys);
    
    res.json({
      success: true,
      conversion: conversion[0],
      availableApis,
      apiKeyCount: availableApis.length
    });
  } catch (error) {
    console.error('Save conversion error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save conversion'
    });
  }
});

// Generate and upload marketplace app
router.post('/generate-marketplace-app', async (req, res) => {
  try {
    const { workflowName, workflowData, outputFormat, uploadToMarketplace = false } = workflowAnalysisSchema.extend({
      uploadToMarketplace: z.boolean().default(false)
    }).parse(req.body);
    
    const userId = (req.user as any)?.id || 1;
    const analysis = analyzeWorkflow(workflowData);
    
    // Generate marketplace-ready app data
    const marketplaceApp = generateMarketplaceApp(analysis, workflowName, userId);
    
    // Generate code with API integration
    const generatedCode = await generateCodeWithApiKeys(analysis, outputFormat, userId);
    marketplaceApp.generatedCode = generatedCode;
    
    // Check if we're using mock database
    if (process.env.NODE_ENV === 'development') {
      // Simulate database operations for development
      const mockConversion = {
        id: Date.now(),
        userId,
        workflowName,
        originalWorkflow: workflowData,
        workflowAnalysis: analysis,
        generatedCode,
        outputFormat,
        status: 'completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      let mockUploadedApp = null;
      
      // Simulate marketplace upload if requested
      if (uploadToMarketplace) {
        mockUploadedApp = {
          id: Date.now() + 1,
          name: marketplaceApp.name,
          description: marketplaceApp.description,
          category: marketplaceApp.category,
          icon: marketplaceApp.icon,
          rating: marketplaceApp.rating,
          downloads: marketplaceApp.downloads,
          conversionId: mockConversion.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      
      // Get user's API keys for the response
      const apiKeys = await getUserApiKeysForCode(userId);
      const availableApis = Object.keys(apiKeys);
      
      res.json({
        success: true,
        conversion: mockConversion,
        marketplaceApp,
        uploadedApp: mockUploadedApp,
        availableApis,
        apiKeyCount: availableApis.length,
        uploadedToMarketplace: !!mockUploadedApp
      });
      return;
    }
    
    // Real database operations for production
    const conversion = await db.insert(workflowConversions).values({
      userId,
      workflowName,
      originalWorkflow: workflowData,
      workflowAnalysis: analysis,
      generatedCode,
      outputFormat,
      status: 'completed'
    }).returning();
    
    let uploadedApp = null;
    
    // Upload to marketplace if requested
    if (uploadToMarketplace) {
      const { applications } = await import('@shared/schema');
      
      uploadedApp = await db.insert(applications).values({
        name: marketplaceApp.name,
        description: marketplaceApp.description,
        category: marketplaceApp.category,
        icon: marketplaceApp.icon,
        rating: marketplaceApp.rating,
        downloads: marketplaceApp.downloads,
        conversionId: conversion[0].id // Link to the conversion
      }).returning();
    }
    
    // Get user's API keys for the response
    const apiKeys = await getUserApiKeysForCode(userId);
    const availableApis = Object.keys(apiKeys);
    
    res.json({
      success: true,
      conversion: conversion[0],
      marketplaceApp,
      uploadedApp: uploadedApp?.[0] || null,
      availableApis,
      apiKeyCount: availableApis.length,
      uploadedToMarketplace: !!uploadedApp
    });
  } catch (error) {
    console.error('Generate marketplace app error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate marketplace app'
    });
  }
});

// Upload existing conversion to marketplace
router.post('/upload-to-marketplace/:conversionId', async (req, res) => {
  try {
    const { conversionId } = req.params;
    const userId = (req.user as any)?.id || 1;
    
    // Check if we're using mock database
    if (process.env.NODE_ENV === 'development') {
      // Simulate marketplace upload for development
      const mockUploadedApp = {
        id: Date.now(),
        name: 'Mock Uploaded App',
        description: 'App uploaded from conversion',
        category: 'operations',
        icon: '⚡',
        rating: 4,
        downloads: 100,
        conversionId: parseInt(conversionId),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const marketplaceApp = {
        name: mockUploadedApp.name,
        description: mockUploadedApp.description,
        category: mockUploadedApp.category,
        icon: mockUploadedApp.icon,
        rating: mockUploadedApp.rating,
        downloads: mockUploadedApp.downloads,
        generatedCode: '// Mock generated code'
      };
      
      res.json({
        success: true,
        marketplaceApp,
        uploadedApp: mockUploadedApp,
        uploadedToMarketplace: true
      });
      return;
    }
    
    // Get the conversion
    const conversion = await db.select().from(workflowConversions)
      .where(and(eq(workflowConversions.id, parseInt(conversionId)), eq(workflowConversions.userId, userId)))
      .limit(1);
    
    if (!conversion.length) {
      return res.status(404).json({
        success: false,
        error: 'Conversion not found'
      });
    }
    
    const conv = conversion[0];
    const analysis = conv.workflowAnalysis as WorkflowAnalysis;
    
    // Generate marketplace app data
    const marketplaceApp = generateMarketplaceApp(analysis, conv.workflowName, userId);
    marketplaceApp.generatedCode = conv.generatedCode || '';
    
    // Upload to marketplace
    const { applications } = await import('@shared/schema');
    
    const uploadedApp = await db.insert(applications).values({
      name: marketplaceApp.name,
      description: marketplaceApp.description,
      category: marketplaceApp.category,
      icon: marketplaceApp.icon,
      rating: marketplaceApp.rating,
      downloads: marketplaceApp.downloads,
      conversionId: conv.id // Link to the conversion
    }).returning();
    
    res.json({
      success: true,
      marketplaceApp,
      uploadedApp: uploadedApp[0],
      uploadedToMarketplace: true
    });
  } catch (error) {
    console.error('Upload to marketplace error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload to marketplace'
    });
  }
});

// Get user's workflow conversions
router.get('/conversions', async (req, res) => {
  try {
    const userId = (req.user as any)?.id || 1; // Default to user ID 1 for now
    
    // Check if we're using mock database
    if (process.env.NODE_ENV === 'development') {
      // Return mock conversions for development
      const mockConversions = [
        {
          id: 1,
          userId,
          workflowName: 'Mock Workflow 1',
          originalWorkflow: {},
          workflowAnalysis: {
            nodes: [],
            connections: [],
            totalNodes: 5,
            nodeTypes: ['httpRequest', 'formTrigger'],
            hasWebhooks: true,
            hasApiCalls: true,
            hasDataProcessing: false,
            complexity: 'medium',
            estimatedLines: 150,
            supportedFormats: ['react', 'nodejs']
          },
          generatedCode: '// Mock generated code',
          outputFormat: 'react',
          status: 'completed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      res.json({
        success: true,
        conversions: mockConversions
      });
      return;
    }
    
    const conversions = await db
      .select()
      .from(workflowConversions)
      .where(eq(workflowConversions.userId, userId))
      .orderBy(workflowConversions.createdAt);
    
    res.json({
      success: true,
      conversions
    });
  } catch (error) {
    console.error('Get conversions error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch conversions'
    });
  }
});

// Get workflow conversion by ID
router.get('/conversions/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = (req.user as any)?.id || 1;
    
    const conversion = await db
      .select()
      .from(workflowConversions)
      .where(and(
        eq(workflowConversions.id, id),
        eq(workflowConversions.userId, userId)
      ))
      .limit(1);
    
    if (conversion.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Conversion not found'
      });
    }
    
    res.json({
      success: true,
      conversion: conversion[0]
    });
  } catch (error) {
    console.error('Get conversion error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch conversion'
    });
  }
});

// Get available templates
router.get('/templates', async (req, res) => {
  try {
    const templates = await db
      .select()
      .from(workflowTemplates)
      .where(eq(workflowTemplates.isActive, true))
      .orderBy(workflowTemplates.name);
    
    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch templates'
    });
  }
});

// Get node type registry
router.get('/node-types', async (req, res) => {
  try {
    const nodeTypes = await db
      .select()
      .from(nodeTypeRegistry)
      .where(eq(nodeTypeRegistry.isActive, true))
      .orderBy(nodeTypeRegistry.nodeType);
    
    res.json({
      success: true,
      nodeTypes
    });
  } catch (error) {
    console.error('Get node types error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch node types'
    });
  }
});

export default router; 