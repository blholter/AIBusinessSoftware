import React, { useState } from 'react';
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Zap, Settings, Play } from "lucide-react";
import WorkflowInputForm, { WorkflowSchema } from "@/components/workflow-input-form";
import { getAllWorkflowSchemas, getWorkflowSchema } from "@/lib/sample-workflow-schemas";

const WorkflowDemo: React.FC = () => {
  const [, setLocation] = useLocation();
  const [selectedSchema, setSelectedSchema] = useState<WorkflowSchema | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string>("");

  const schemas = getAllWorkflowSchemas();

  const handleWorkflowSubmit = async (data: Record<string, any>) => {
    setIsLoading(true);
    setError("");
    setIsSuccess(false);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Workflow execution data:', data);
      
      setIsSuccess(true);
      
      // Reset success state after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to execute workflow');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchemaSelect = (schemaId: string) => {
    const schema = getWorkflowSchema(schemaId);
    setSelectedSchema(schema);
    setError("");
    setIsSuccess(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Workflow Input Form Demo
              </h1>
              <p className="text-gray-600 mb-4">
                Test the dynamic workflow configuration interface with different input schemas
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Schema Selection */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Available Workflows
                </CardTitle>
                <CardDescription>
                  Select a workflow to test the input form
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {schemas.map((schema) => (
                  <div
                    key={schema.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedSchema?.id === schema.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleSchemaSelect(schema.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{schema.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        v{schema.version}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {schema.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {schema.metadata?.tags?.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {schema.metadata?.complexity || 'medium'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Workflow Form */}
          <div className="lg:col-span-2">
            {selectedSchema ? (
              <WorkflowInputForm
                schema={selectedSchema}
                onSubmit={handleWorkflowSubmit}
                onCancel={() => setSelectedSchema(null)}
                isLoading={isLoading}
                isSuccess={isSuccess}
                error={error}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Workflow Configuration
                  </CardTitle>
                  <CardDescription>
                    Select a workflow from the left panel to configure and test it
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Workflow Selected
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Choose a workflow from the left panel to see the dynamic input form in action
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <Play className="h-4 w-4" />
                      <span>Each workflow has different input types and validation rules</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Features Overview */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Workflow Input Form Features</CardTitle>
            <CardDescription>
              A comprehensive, generalizable form component for n8n workflow configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Input Types</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Text, Number, Email, URL</li>
                  <li>• Textarea, Select, Multi-select</li>
                  <li>• Boolean, File, JSON</li>
                  <li>• Date, Time, DateTime</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Validation</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Required field validation</li>
                  <li>• Type-specific validation</li>
                  <li>• Min/max length & values</li>
                  <li>• Pattern matching</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Organization</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Grouped inputs</li>
                  <li>• Ordered sections</li>
                  <li>• Clean, responsive layout</li>
                  <li>• Metadata display</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkflowDemo; 