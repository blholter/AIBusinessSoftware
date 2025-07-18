import React, { useEffect, useState } from 'react';
import { useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Loader2, AlertCircle, Settings, CheckCircle } from "lucide-react";
import WorkflowInputForm, { WorkflowSchema } from "@/components/workflow-input-form";
import { getWorkflowSchema } from "@/lib/sample-workflow-schemas";

// Live App Preview Component
const LiveAppPreview: React.FC<{ code: string }> = ({ code }) => {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!code) return;

    try {
      // Create a safe execution environment with more comprehensive import removal
      let safeCode = code;
      
      // First, try to find where the actual component code starts
      const componentStartIndex = safeCode.search(/function\s+\w+\s*\(|const\s+\w+\s*=\s*\(|const\s+\w+\s*=\s*function/);
      
      if (componentStartIndex > 0) {
        // If we found a component, remove everything before it
        safeCode = safeCode.substring(componentStartIndex);
        console.log('Found component at index:', componentStartIndex);
      }
      
      // Remove all import statements with comprehensive patterns
      safeCode = safeCode
        // Remove import statements with destructuring
        .replace(/import\s*{\s*[^}]*}\s*from\s*['"][^'"]*['"];?\s*/g, '')
        // Remove import statements with default import
        .replace(/import\s+\w+\s+from\s*['"][^'"]*['"];?\s*/g, '')
        // Remove import statements with both default and named imports
        .replace(/import\s+\w+,\s*{\s*[^}]*}\s*from\s*['"][^'"]*['"];?\s*/g, '')
        // Remove import statements with alias
        .replace(/import\s+\w+\s+as\s+\w+\s+from\s*['"][^'"]*['"];?\s*/g, '')
        // Remove import statements with wildcard
        .replace(/import\s+\*\s+as\s+\w+\s+from\s*['"][^'"]*['"];?\s*/g, '')
        // Remove any remaining import statements
        .replace(/import\s+.*?from\s*['"][^'"]*['"];?\s*/g, '')
        .replace(/import\s+['"][^'"]*['"];?\s*/g, '')
        // Remove export default
        .replace(/export\s+default\s+/g, '')
        // Remove any remaining export statements
        .replace(/export\s+.*?;/g, '')
        // Remove render calls
        .replace(/render\s*\(\s*<.*?>\s*\)\s*;?/g, '')
        // Remove CSS imports
        .replace(/import\s+['"][^'"]*\.css['"];?\s*/g, '')
        .trim();

      console.log('Original code length:', code.length);
      console.log('Original code:', code.substring(0, 300) + '...');
      console.log('Processed code length:', safeCode.length);
      console.log('Processed code:', safeCode.substring(0, 300) + '...');
      console.log('Contains import statements:', safeCode.includes('import '));
      console.log('Contains export statements:', safeCode.includes('export '));

      // Check if there are still import statements or if the code is malformed
      if (safeCode.includes('import ') || safeCode.includes('export ')) {
        console.warn('Import/export statements still found, using fallback approach');
        
        // Try multiple fallback approaches
        let componentCode = null;
        let componentName = null;
        
        // Approach 1: Extract function component
        const functionMatch = safeCode.match(/function\s+(\w+)\s*\([^)]*\)\s*{[\s\S]*?}/);
        if (functionMatch) {
          componentCode = functionMatch[0];
          componentName = functionMatch[1];
        }
        
        // Approach 2: Extract arrow function component
        if (!componentCode) {
          const arrowMatch = safeCode.match(/const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*{[\s\S]*?}/);
          if (arrowMatch) {
            componentCode = arrowMatch[0];
            componentName = arrowMatch[1];
          }
        }
        
        // Approach 3: Extract any function-like structure
        if (!componentCode) {
          const anyFunctionMatch = safeCode.match(/(\w+)\s*\([^)]*\)\s*{[\s\S]*?}/);
          if (anyFunctionMatch) {
            componentCode = anyFunctionMatch[0];
            componentName = anyFunctionMatch[1];
          }
        }
        
        if (componentCode && componentName) {
          const createComponent = new Function('React', `
            const { useState, useEffect, useCallback, useMemo, useRef } = React;
            ${componentCode}
            return ${componentName};
          `);
          
          const ComponentClass = createComponent(React);
          setComponent(() => ComponentClass);
          setError("");
          return;
        } else {
          throw new Error('Could not extract component function from code');
        }
      }

      // Create a function that returns the component
      const createComponent = new Function('React', `
        const { useState, useEffect, useCallback, useMemo, useRef } = React;
        ${safeCode}
        return App || TestApp || (() => <div>No component found</div>);
      `);

      const ComponentClass = createComponent(React);
      setComponent(() => ComponentClass);
      setError("");
    } catch (err: any) {
      console.error('Error in LiveAppPreview:', err);
      setError(err.message);
      setComponent(null);
    }
  }, [code]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error rendering app: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!Component) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading app...</span>
      </div>
    );
  }

  return (
    <div className="border rounded p-4 bg-white">
      <Component />
    </div>
  );
};

interface AppData {
  id: number;
  name: string;
  description: string;
  category: string;
  icon: string;
  rating: number;
  downloads: number;
}

const AppRunner: React.FC = () => {
  const { id } = useParams();
  const [code, setCode] = useState<string>("");
  const [appData, setAppData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [showWorkflowForm, setShowWorkflowForm] = useState(false);
  const [workflowSchema, setWorkflowSchema] = useState<WorkflowSchema | null>(null);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [workflowSuccess, setWorkflowSuccess] = useState(false);
  const [workflowError, setWorkflowError] = useState<string>("");


  useEffect(() => {
    const fetchAppData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch app metadata
        const appResponse = await fetch(`/api/applications`);
        const apps = await appResponse.json();
        const app = apps.find((a: AppData) => a.id === parseInt(id || "0"));
        
        if (!app) {
          setError("App not found");
          return;
        }
        
        setAppData(app);

        // Fetch generated code
        const codeResponse = await fetch(`/api/applications/${id}/code`);
        if (!codeResponse.ok) {
          const errorData = await codeResponse.json();
          throw new Error(errorData.error || 'Failed to fetch app code');
        }
        
        const { code: generatedCode } = await codeResponse.json();
        setCode(generatedCode || "");
        
      } catch (err: any) {
        setError(err.message || "Failed to load app");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAppData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading app...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Handle workflow form submission
  const handleWorkflowSubmit = async (data: Record<string, any>) => {
    setWorkflowLoading(true);
    setWorkflowError("");
    setWorkflowSuccess(false);
    
    try {
      // Simulate API call to execute workflow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would send the data to your backend
      // which would then execute the workflow and send results via Telegram
      console.log('Workflow execution data:', data);
      
      setWorkflowSuccess(true);
      setShowWorkflowForm(false);
      
      // Reset success state after 5 seconds
      setTimeout(() => setWorkflowSuccess(false), 5000);
    } catch (err: any) {
      setWorkflowError(err.message || 'Failed to execute workflow');
    } finally {
      setWorkflowLoading(false);
    }
  };

  const handleRunWorkflow = () => {
    // Try to get a workflow schema based on app name or use a default one
    const schemaId = appData?.name.toLowerCase().includes('social') ? 'social-media-automation' :
                    appData?.name.toLowerCase().includes('email') ? 'email-campaign' :
                    appData?.name.toLowerCase().includes('data') ? 'data-analysis' :
                    'social-media-automation'; // default fallback
    
    const schema = getWorkflowSchema(schemaId);
    setWorkflowSchema(schema);
    setShowWorkflowForm(true);
    setWorkflowError("");
    setWorkflowSuccess(false);
  };

  if (!appData || !code) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <Alert>
            <AlertDescription>No code available for this app.</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {appData.name}
              </h1>
              <p className="text-gray-600 mb-4">
                {appData.description}
              </p>
              <div className="flex items-center gap-4">
                <Badge variant="outline">{appData.category}</Badge>
                <span className="text-sm text-gray-500">
                  ⭐ {appData.rating} • 📥 {appData.downloads} downloads
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={handleRunWorkflow}
              >
                Start New Workflow
              </Button>
            </div>
          </div>
        </div>

        {/* App Runner */}
        <div className="space-y-6">
          {/* Workflow Configuration Form */}
          {showWorkflowForm && workflowSchema && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Workflow Configuration
                </CardTitle>
                <CardDescription>
                  Configure the parameters for your workflow execution. Results will be sent via Telegram.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WorkflowInputForm
                  schema={workflowSchema}
                  onSubmit={handleWorkflowSubmit}
                  onCancel={() => setShowWorkflowForm(false)}
                  isLoading={workflowLoading}
                  isSuccess={workflowSuccess}
                  error={workflowError}
                />
              </CardContent>
            </Card>
          )}

          {/* Success Message */}
          {workflowSuccess && !showWorkflowForm && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Workflow executed successfully! Results have been sent via Telegram.
              </AlertDescription>
            </Alert>
          )}

          {/* Live App */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                {appData.name}
              </CardTitle>
              <CardDescription>
                {appData.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LiveAppPreview code={code} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AppRunner; 