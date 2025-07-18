import React, { useState } from 'react';
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload, FileText, Code, Play, Download, CheckCircle, Globe, Store, Zap, Plus, Settings, Database, ArrowLeft } from "lucide-react";

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

// Input schema interface for direct JSON input
interface InputSchema {
  id: string;
  name: string;
  type: 'text' | 'number' | 'email' | 'url' | 'textarea' | 'select' | 'multiselect' | 'boolean' | 'file' | 'json' | 'date' | 'time' | 'datetime';
  label: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: any;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  group?: string;
  order?: number;
}

interface AppSchema {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  icon: string;
  color: string;
  photo?: string | File; // Update photo field to accept File
  inputs: InputSchema[];
  groups?: Array<{
    id: string;
    name: string;
    description?: string;
    order: number;
  }>;
  metadata?: {
    author?: string;
    tags?: string[];
    estimatedRuntime?: string;
    complexity?: 'simple' | 'medium' | 'complex';
  };
}

const AdminWorkflowConverter: React.FC = () => {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [workflowData, setWorkflowData] = useState<string>('');
  const [analysis, setAnalysis] = useState<WorkflowAnalysis | null>(null);
  const [generatedApp, setGeneratedApp] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [marketplaceApp, setMarketplaceApp] = useState<any>(null);
  const [uploadToMarketplace, setUploadToMarketplace] = useState(false);
  
  // New state for app details
  const [appName, setAppName] = useState<string>('');
  const [appCategory, setAppCategory] = useState<string>('operations');
  const [appDescription, setAppDescription] = useState<string>('');
  const [appPhoto, setAppPhoto] = useState<File | null>(null);
  const [appPhotoPreview, setAppPhotoPreview] = useState<string>('');
  
  // New state for direct JSON schema input
  const [activeTab, setActiveTab] = useState('workflow');
  const [appSchema, setAppSchema] = useState<AppSchema>({
    id: '',
    name: '',
    description: '',
    version: '1.0.0',
    category: 'operations',
    icon: '⚡',
    color: 'bg-gradient-to-br from-purple-100 to-indigo-100',
    photo: '',
    inputs: [],
    groups: [],
          metadata: {
        author: 'Agentic AI Agent Apps.com',
        tags: [],
        estimatedRuntime: '2-5 minutes',
        complexity: 'medium'
      }
  });
  const [schemaJson, setSchemaJson] = useState<string>('');
  const [generatedCode, setGeneratedCode] = useState<string>('');

  // Category options for dropdown
  const categoryOptions = [
    { value: 'operations', label: 'Operations' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
    { value: 'customer-support', label: 'Customer Support' },
    { value: 'finance', label: 'Finance' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'ai-ml', label: 'AI & Machine Learning' },
    { value: 'data-analysis', label: 'Data Analysis' },
    { value: 'automation', label: 'Automation' },
    { value: 'integration', label: 'Integration' },
    { value: 'communication', label: 'Communication' },
    { value: 'other', label: 'Other' }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setWorkflowData(content);
      setError('');
      setSuccess('');
    };
    reader.readAsText(file);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB');
      return;
    }

    setAppPhoto(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setAppPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    setError('');
  };

  // New functions for direct JSON schema input
  const handleSchemaJsonChange = (json: string) => {
    setSchemaJson(json);
    try {
      const parsed = JSON.parse(json);
      setAppSchema(parsed);
      setError('');
    } catch (err) {
      // Don't set error for incomplete JSON
    }
  };

  const validateAndParseSchema = (): AppSchema | null => {
    try {
      const parsed = JSON.parse(schemaJson);
      
      // Basic validation
      if (!parsed.name || !parsed.description || !parsed.inputs) {
        throw new Error('Schema must include name, description, and inputs');
      }
      
      if (!Array.isArray(parsed.inputs)) {
        throw new Error('Inputs must be an array');
      }
      
      return parsed;
    } catch (err: any) {
      setError(`Invalid JSON schema: ${err.message}`);
      return null;
    }
  };

  const generateAppFromSchema = async () => {
    const schema = validateAndParseSchema();
    if (!schema) return;

    // Use form inputs if provided, otherwise use schema values
    const finalSchema = {
      ...schema,
      name: appName || schema.name,
      description: appDescription || schema.description,
      category: appCategory || schema.category,
      photo: appPhoto || schema.photo
    };

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Generate a simple React component based on the schema
      const componentCode = generateReactComponentFromSchema(finalSchema);
      setGeneratedCode(componentCode);
      
      // Create FormData if we have a photo file, otherwise use JSON
      let requestBody: string | FormData;
      let headers: Record<string, string>;
      
      if (appPhoto) {
        const formData = new FormData();
        formData.append('schema', JSON.stringify(finalSchema));
        formData.append('generatedCode', componentCode);
        formData.append('photo', appPhoto);
        requestBody = formData;
        headers = {}; // Let browser set Content-Type for FormData
      } else {
        requestBody = JSON.stringify({
          schema: finalSchema,
          generatedCode: componentCode
        });
        headers = {
          'Content-Type': 'application/json',
        };
      }
      
      // Upload to marketplace
      const response = await fetch('/api/workflow/upload-schema-app', {
        method: 'POST',
        headers,
        body: requestBody
      });

      const result = await response.json();
      
      if (result.success) {
        setSuccess(`App created successfully! App ID: ${result.appId}`);
        setMarketplaceApp(result.app);
      } else {
        setError(result.error || 'Failed to create app');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create app');
    } finally {
      setIsLoading(false);
    }
  };

  const generateReactComponentFromSchema = (schema: AppSchema): string => {
    const { name, inputs, description } = schema;
    
    return `import React, { useState } from 'react';

// Generated from schema: ${name}
// Description: ${description}
// Total inputs: ${inputs.length}

function ${name.replace(/[^a-zA-Z0-9]/g, '')}App() {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Send data to backend for processing
      const response = await fetch('/api/workflow/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: '${schema.id}',
          inputs: formData
        })
      });
      
      const data = await response.json();
      setResult(data);
      
      // Results will be sent via Telegram
      console.log('Workflow executed, results sent via Telegram');
    } catch (error) {
      console.error('Error executing workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">${name}</h1>
      <p className="text-gray-600 mb-6">${description}</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
${inputs.map(input => {
  const inputId = input.id;
  const inputLabel = input.label;
  const inputType = input.type;
  const isRequired = input.required ? 'required' : '';
  
  switch (inputType) {
    case 'textarea':
      return `        <div>
          <label className="block text-sm font-medium mb-2">${inputLabel}</label>
          <textarea
            className="w-full p-2 border rounded"
            placeholder="${input.placeholder || ''}"
            ${isRequired}
            onChange={(e) => setFormData(prev => ({ ...prev, ${inputId}: e.target.value }))}
          />
        </div>`;
    
    case 'select':
      return `        <div>
          <label className="block text-sm font-medium mb-2">${inputLabel}</label>
          <select
            className="w-full p-2 border rounded"
            ${isRequired}
            onChange={(e) => setFormData(prev => ({ ...prev, ${inputId}: e.target.value }))}
          >
            <option value="">Select...</option>
            ${input.options?.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('\n            ') || ''}
          </select>
        </div>`;
    
    case 'boolean':
      return `        <div className="flex items-center">
          <input
            type="checkbox"
            id="${inputId}"
            className="mr-2"
            onChange={(e) => setFormData(prev => ({ ...prev, ${inputId}: e.target.checked }))}
          />
          <label htmlFor="${inputId}" className="text-sm font-medium">${inputLabel}</label>
        </div>`;
    
    default:
      return `        <div>
          <label className="block text-sm font-medium mb-2">${inputLabel}</label>
          <input
            type="${inputType}"
            className="w-full p-2 border rounded"
            placeholder="${input.placeholder || ''}"
            ${isRequired}
            onChange={(e) => setFormData(prev => ({ ...prev, ${inputId}: e.target.value }))}
          />
        </div>`;
  }
}).join('\n')}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Execute Workflow'}
        </button>
      </form>
      
      {result && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
          <h3 className="font-medium text-green-800">Success!</h3>
          <p className="text-green-600">Results have been sent via Telegram.</p>
        </div>
      )}
    </div>
  );
}

export default ${name.replace(/[^a-zA-Z0-9]/g, '')}App;`;
  };

    const analyzeWorkflow = async () => {
    if (!workflowData.trim()) {
      setError('Please provide workflow data first');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Call the backend API to analyze the workflow
      const response = await fetch('/api/workflow/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflowName: 'Workflow Analysis',
          workflowData: JSON.parse(workflowData),
          outputFormat: 'react'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setAnalysis(result.analysis);
        setSuccess('Workflow analyzed successfully!');
      } else {
        setError(result.error || 'Failed to analyze workflow');
      }
    } catch (error) {
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const generateWebApp = async () => {
    if (!analysis) {
      setError('Please analyze a workflow first');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Call the backend API to generate code with API key integration
      const response = await fetch('/api/workflow/generate', {
        method: 'POST',
        headers: appPhoto ? {} : { 'Content-Type': 'application/json' },
        body: (() => {
          const baseData = {
            workflowName: appName || 'Generated Workflow',
            workflowData: JSON.parse(workflowData),
            outputFormat: 'react',
            appDetails: {
              name: appName,
              description: appDescription,
              category: appCategory
            }
          };

          if (appPhoto) {
            const formData = new FormData();
            formData.append('data', JSON.stringify(baseData));
            formData.append('photo', appPhoto);
            return formData;
          } else {
            return JSON.stringify(baseData);
          }
        })()
      });

      const result = await response.json();
      
      if (result.success) {
        setGeneratedApp(result.generatedCode);
        setSuccess(`Web application generated successfully! Available APIs: ${result.availableApis?.join(', ') || 'None'}`);
      } else {
        setError(result.error || 'Failed to generate web application');
      }
    } catch (error) {
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMarketplaceApp = async () => {
    if (!analysis) {
      setError('Please analyze a workflow first');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Call the backend API to generate marketplace-ready app
      const response = await fetch('/api/workflow/generate-marketplace-app', {
        method: 'POST',
        headers: appPhoto ? {} : { 'Content-Type': 'application/json' },
        body: (() => {
          const baseData = {
            workflowName: appName || 'Generated Workflow App',
            workflowData: JSON.parse(workflowData),
            outputFormat: 'react',
            uploadToMarketplace,
            appDetails: {
              name: appName,
              description: appDescription,
              category: appCategory
            }
          };

          if (appPhoto) {
            const formData = new FormData();
            formData.append('data', JSON.stringify(baseData));
            formData.append('photo', appPhoto);
            return formData;
          } else {
            return JSON.stringify(baseData);
          }
        })()
      });

      const result = await response.json();
      
      if (result.success) {
        setGeneratedApp(result.marketplaceApp.generatedCode);
        setMarketplaceApp(result.marketplaceApp);
        
        if (result.uploadedToMarketplace) {
          setSuccess(`Marketplace app generated and uploaded successfully! App ID: ${result.uploadedApp.id}`);
        } else {
          setSuccess(`Marketplace app generated successfully! Available APIs: ${result.availableApis?.join(', ') || 'None'}`);
        }
      } else {
        setError(result.error || 'Failed to generate marketplace app');
      }
    } catch (error) {
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadToMarketplaceNow = async () => {
    if (!marketplaceApp) {
      setError('Please generate a marketplace app first');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Call the backend API to upload to marketplace
      const response = await fetch(`/api/workflow/upload-to-marketplace/${marketplaceApp.conversionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setSuccess(`App uploaded to marketplace successfully! App ID: ${result.uploadedApp.id}`);
        setMarketplaceApp(result.marketplaceApp);
      } else {
        setError(result.error || 'Failed to upload to marketplace');
      }
    } catch (error) {
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const generateReactApp = (analysis: WorkflowAnalysis): string => {
    const { nodes, connections, complexity } = analysis;
    
    // Create a basic React app structure
    const appCode = `import React, { useState, useEffect } from 'react';
import './App.css';

    // Generated from workflow analysis
// Total nodes: ${analysis.totalNodes}
// Complexity: ${analysis.complexity}
// Node types: ${analysis.nodeTypes.join(', ')}

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Workflow nodes:
${nodes.map(node => `  // - ${node.name} (${node.type})`).join('\n')}

  const processWorkflow = async (inputData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate workflow processing
      let result = inputData;
      
      // Process through workflow nodes
${nodes.map(node => `      // Process ${node.name} (${node.type})
      result = await process${node.type.charAt(0).toUpperCase() + node.type.slice(1)}Node(result);`).join('\n')}
      
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Node processing functions
${nodes.map(node => `  const process${node.type.charAt(0).toUpperCase() + node.type.slice(1)}Node = async (input) => {
    // TODO: Implement ${node.type} node logic
    console.log('Processing ${node.name} with input:', input);
    return input;
  };`).join('\n\n')}

  return (
    <div className="App">
      <header className="App-header">
        <h1>Generated Web App</h1>
        <p>Based on workflow with ${analysis.totalNodes} nodes</p>
      </header>
      
      <main>
        <div className="workflow-info">
          <h2>Workflow Information</h2>
          <p><strong>Complexity:</strong> ${complexity}</p>
          <p><strong>Total Nodes:</strong> ${analysis.totalNodes}</p>
          <p><strong>Node Types:</strong> {analysis.nodeTypes.join(', ')}</p>
          ${analysis.hasWebhooks ? '<p><strong>Features:</strong> Webhooks detected</p>' : ''}
          ${analysis.hasApiCalls ? '<p><strong>Features:</strong> API calls detected</p>' : ''}
        </div>
        
        <div className="workflow-controls">
          <button 
            onClick={() => processWorkflow({ test: 'data' })}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Run Workflow'}
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

export default App;
`;

    return appCode;
  };

  const downloadApp = () => {
    if (!generatedApp) return;
    
    const blob = new Blob([generatedApp], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-app.jsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/admin")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Panel
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                App Creator & Converter
              </h1>
              <p className="text-gray-600 mb-4">
                Create apps from workflows or direct JSON schemas
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                <Settings className="h-3 w-3 mr-1" />
                Admin Panel
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="workflow" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Workflow Converter
                </TabsTrigger>
            <TabsTrigger value="schema" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Direct JSON Schema
            </TabsTrigger>
          </TabsList>

                  {/* Workflow Converter Tab */}
        <TabsContent value="workflow" className="space-y-6">
            {/* App Details Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  App Details
                </CardTitle>
                <CardDescription>
                  Configure the basic information for your app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="app-name">App Name</Label>
                    <Input
                      id="app-name"
                      placeholder="Enter app name..."
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="app-category">Category</Label>
                    <Select value={appCategory} onValueChange={setAppCategory}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="app-description">Description</Label>
                  <Textarea
                    id="app-description"
                    placeholder="Describe what your app does..."
                    value={appDescription}
                    onChange={(e) => setAppDescription(e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="app-photo">App Photo</Label>
                  <Input
                    id="app-photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload an image for your app (max 5MB, optional)
                  </p>
                  {appPhotoPreview && (
                    <div className="mt-2">
                      <img 
                        src={appPhotoPreview} 
                        alt="App preview" 
                        className="w-20 h-20 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Workflow Input
            </CardTitle>
            <CardDescription>
                              Upload a JSON file or paste your workflow data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Upload JSON File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="workflow-data">Or Paste Workflow Data</Label>
              <Textarea
                id="workflow-data"
                                  placeholder="Paste your workflow JSON here..."
                value={workflowData}
                onChange={(e) => setWorkflowData(e.target.value)}
                rows={8}
                className="mt-1 font-mono text-sm"
              />
            </div>

            <Button 
              onClick={analyzeWorkflow} 
              disabled={isLoading || !workflowData.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Analyze Workflow
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Analysis Results
            </CardTitle>
            <CardDescription>
              Workflow analysis and generation options
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysis ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total Nodes:</span>
                    <p>{analysis.totalNodes}</p>
                  </div>
                  <div>
                    <span className="font-medium">Complexity:</span>
                    <Badge variant={analysis.complexity === 'complex' ? 'destructive' : analysis.complexity === 'medium' ? 'secondary' : 'default'}>
                      {analysis.complexity}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Node Types:</span>
                    <p className="text-xs">{analysis.nodeTypes.slice(0, 3).join(', ')}{analysis.nodeTypes.length > 3 ? '...' : ''}</p>
                  </div>
                  <div>
                    <span className="font-medium">Features:</span>
                    <div className="flex gap-1 mt-1">
                      {analysis.hasWebhooks && <Badge variant="outline" className="text-xs">Webhooks</Badge>}
                      {analysis.hasApiCalls && <Badge variant="outline" className="text-xs">API Calls</Badge>}
                      {analysis.hasDataProcessing && <Badge variant="outline" className="text-xs">Data Processing</Badge>}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button 
                    onClick={generateWebApp} 
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Code className="mr-2 h-4 w-4" />
                        Generate Web App
                      </>
                    )}
                  </Button>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="upload-to-marketplace"
                      checked={uploadToMarketplace}
                      onChange={(e) => setUploadToMarketplace(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="upload-to-marketplace" className="text-sm">
                      Upload to marketplace immediately
                    </Label>
                  </div>

                  <Button 
                    onClick={generateMarketplaceApp} 
                    disabled={isLoading}
                    className="w-full"
                    variant="outline"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Store className="mr-2 h-4 w-4" />
                        Generate Marketplace App
                      </>
                    )}
                  </Button>

                  {marketplaceApp && !marketplaceApp.uploadedToMarketplace && (
                    <Button 
                      onClick={uploadToMarketplaceNow} 
                      disabled={isLoading}
                      className="w-full"
                      variant="secondary"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Globe className="mr-2 h-4 w-4" />
                          Upload to Marketplace Now
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Analyze a workflow to see details here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Generated App Section */}
      {generatedApp && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Generated Web Application
            </CardTitle>
            <CardDescription>
                              React component generated from your workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={downloadApp} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download App
                </Button>
                {marketplaceApp && (
                  <Button 
                    onClick={() => setLocation('/generated-app-demo')} 
                    variant="outline"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    View Demo
                  </Button>
                )}
              </div>
              
              <div>
                <Label>Generated Code</Label>
                <Textarea
                  value={generatedApp}
                  readOnly
                  rows={20}
                  className="mt-1 font-mono text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Marketplace App Info */}
      {marketplaceApp && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Marketplace App Details
            </CardTitle>
            <CardDescription>
              Information about the generated marketplace application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">App Information</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {marketplaceApp.name}
                  </div>
                  <div>
                    <span className="font-medium">Category:</span> 
                    <Badge variant="outline" className="ml-2">{marketplaceApp.category}</Badge>
                  </div>
                  <div>
                    <span className="font-medium">Icon:</span> {marketplaceApp.icon}
                  </div>
                  <div>
                    <span className="font-medium">Description:</span>
                    <p className="text-muted-foreground mt-1">{marketplaceApp.description}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Features</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Complexity:</span> {marketplaceApp.features.complexity}
                  </div>
                  <div>
                    <span className="font-medium">Total Nodes:</span> {marketplaceApp.features.totalNodes}
                  </div>
                  <div>
                    <span className="font-medium">Node Types:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {marketplaceApp.features.nodeTypes.slice(0, 5).map((type: string) => (
                        <Badge key={type} variant="secondary" className="text-xs">{type}</Badge>
                      ))}
                      {marketplaceApp.features.nodeTypes.length > 5 && (
                        <Badge variant="secondary" className="text-xs">+{marketplaceApp.features.nodeTypes.length - 5} more</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {marketplaceApp.uploadedToMarketplace && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Successfully uploaded to marketplace!</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  Your app is now available in the marketplace and can be discovered by other users.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

          </TabsContent>

          {/* Direct JSON Schema Tab */}
          <TabsContent value="schema" className="space-y-6">
            {/* App Details Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  App Details
                </CardTitle>
                <CardDescription>
                  Configure the basic information for your app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="schema-app-name">App Name</Label>
                    <Input
                      id="schema-app-name"
                      placeholder="Enter app name..."
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="schema-app-category">Category</Label>
                    <Select value={appCategory} onValueChange={setAppCategory}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="schema-app-description">Description</Label>
                  <Textarea
                    id="schema-app-description"
                    placeholder="Describe what your app does..."
                    value={appDescription}
                    onChange={(e) => setAppDescription(e.target.value)}
                    rows={3}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="schema-app-photo">App Photo</Label>
                  <Input
                    id="schema-app-photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload an image for your app (max 5MB, optional)
                  </p>
                  {appPhotoPreview && (
                    <div className="mt-2">
                      <img 
                        src={appPhotoPreview} 
                        alt="App preview" 
                        className="w-20 h-20 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Schema Input */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    JSON Schema Input
                  </CardTitle>
                  <CardDescription>
                    Define your app's input schema directly in JSON format
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="schema-json">App Schema JSON</Label>
                    <Textarea
                      id="schema-json"
                      placeholder={`{
  "id": "my-app",
  "name": "My Custom App",
  "description": "A custom app with specific inputs",
  "version": "1.0.0",
  "category": "operations",
  "icon": "⚡",
  "color": "bg-gradient-to-br from-purple-100 to-indigo-100",
  "photo": "https://example.com/app-photo.jpg",
  "inputs": [
    {
      "id": "input1",
      "name": "input1",
      "type": "text",
      "label": "Text Input",
      "description": "Enter some text",
      "required": true,
      "placeholder": "Enter text here..."
    }
  ],
  "groups": [
    {
      "id": "main",
      "name": "Main Configuration",
      "description": "Primary app settings",
      "order": 1
    }
  ],
  "metadata": {
    "author": "Your Name",
    "tags": ["custom", "automation"],
    "estimatedRuntime": "2-5 minutes",
    "complexity": "medium"
  }
}`}
                      value={schemaJson}
                      onChange={(e) => handleSchemaJsonChange(e.target.value)}
                      rows={20}
                      className="mt-1 font-mono text-sm"
                    />
                  </div>

                  <Button 
                    onClick={generateAppFromSchema} 
                    disabled={isLoading || !schemaJson.trim()}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating App...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create App from Schema
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Schema Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Schema Preview
                  </CardTitle>
                  <CardDescription>
                    Preview of your app schema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {appSchema.name ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Name:</span>
                          <p>{appSchema.name}</p>
                        </div>
                        <div>
                          <span className="font-medium">Category:</span>
                          <Badge variant="outline">{appSchema.category}</Badge>
                        </div>
                        <div>
                          <span className="font-medium">Version:</span>
                          <p>{appSchema.version}</p>
                        </div>
                        <div>
                          <span className="font-medium">Icon:</span>
                          <p>{appSchema.icon}</p>
                        </div>
                      </div>

                      <div>
                        <span className="font-medium">Description:</span>
                        <p className="text-sm text-gray-600 mt-1">{appSchema.description}</p>
                      </div>

                      <div>
                        <span className="font-medium">Inputs ({appSchema.inputs.length}):</span>
                        <div className="space-y-1 mt-1">
                          {appSchema.inputs.map((input, index) => (
                            <div key={index} className="flex items-center justify-between text-xs">
                              <span>{input.label}</span>
                              <Badge variant="secondary">{input.type}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      {appSchema.metadata?.tags && (
                        <div>
                          <span className="font-medium">Tags:</span>
                          <div className="flex gap-1 mt-1">
                            {appSchema.metadata.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Enter a valid JSON schema to see preview</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Generated Code Preview */}
            {generatedCode && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Generated React Component
                  </CardTitle>
                  <CardDescription>
                    React component generated from your schema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button onClick={() => {
                        const blob = new Blob([generatedCode], { type: 'text/javascript' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${appSchema.name?.replace(/[^a-zA-Z0-9]/g, '')}-app.jsx`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download Component
                      </Button>
                    </div>
                    
                    <div>
                      <Label>Generated Code</Label>
                      <Textarea
                        value={generatedCode}
                        readOnly
                        rows={15}
                        className="mt-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Messages */}
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mt-4">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default AdminWorkflowConverter;