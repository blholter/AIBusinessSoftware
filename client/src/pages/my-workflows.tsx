import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Play, Loader2, AlertCircle, Plus, Clock, CheckCircle, XCircle, Edit, Save, X, Trash2 } from "lucide-react";
import WorkflowInputForm, { WorkflowSchema } from "@/components/workflow-input-form";
import { getWorkflowSchema } from "@/lib/sample-workflow-schemas";

// Live App Preview Component (reused from app-runner)
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
      console.log('Processed code length:', safeCode.length);
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

interface UserWorkflow {
  id: number;
  name: string;
  description: string;
  category: string;
  status: 'active' | 'completed' | 'failed' | 'running';
  lastRun?: string;
  createdAt: string;
  code: string;
  workflowSchema?: WorkflowSchema;
}

const MyWorkflows: React.FC = () => {
  const [workflows, setWorkflows] = useState<UserWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedWorkflow, setSelectedWorkflow] = useState<UserWorkflow | null>(null);
  const [showWorkflowForm, setShowWorkflowForm] = useState(false);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [workflowSuccess, setWorkflowSuccess] = useState(false);
  const [workflowError, setWorkflowError] = useState<string>("");
  
  // Edit workflow state
  const [editingWorkflow, setEditingWorkflow] = useState<UserWorkflow | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    category: '',
    code: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editError, setEditError] = useState<string>("");

  // Delete workflow state
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string>("");
  const [deleteSuccess, setDeleteSuccess] = useState<string>("");
  const [workflowToDelete, setWorkflowToDelete] = useState<UserWorkflow | null>(null);

  // Category options for edit form
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

  useEffect(() => {
    const fetchUserWorkflows = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch('/api/user/workflows');
        if (!response.ok) {
          throw new Error('Failed to fetch workflows');
        }
        
        const workflowsData = await response.json();
        
        // Transform the API data to match our interface
        const transformedWorkflows: UserWorkflow[] = workflowsData.map((workflow: any) => ({
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          category: workflow.category,
          status: workflow.status,
          lastRun: workflow.lastRun,
          createdAt: workflow.createdAt,
          code: workflow.workflowCode,
          workflowSchema: workflow.workflowSchema
        }));

        setWorkflows(transformedWorkflows);
      } catch (err: any) {
        setError(err.message || "Failed to fetch workflows");
      } finally {
        setLoading(false);
      }
    };

    fetchUserWorkflows();
  }, []);

  const handleWorkflowSubmit = async (data: Record<string, any>) => {
    setWorkflowLoading(true);
    setWorkflowError("");
    setWorkflowSuccess(false);
    
    try {
      // Simulate API call to execute workflow
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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

  const handleRunWorkflow = (workflow: UserWorkflow) => {
    setSelectedWorkflow(workflow);
    if (workflow.workflowSchema) {
      setShowWorkflowForm(true);
      setWorkflowError("");
      setWorkflowSuccess(false);
    }
  };

  const handleEditWorkflow = (workflow: UserWorkflow) => {
    setEditingWorkflow(workflow);
    setEditFormData({
      name: workflow.name,
      description: workflow.description,
      category: workflow.category,
      code: workflow.code
    });
    setEditError("");
    setEditSuccess(false);
  };

  const handleCancelEdit = () => {
    setEditingWorkflow(null);
    setEditFormData({
      name: '',
      description: '',
      category: '',
      code: ''
    });
    setEditError("");
    setEditSuccess(false);
  };

  const handleSaveEdit = async () => {
    if (!editingWorkflow) return;

    setEditLoading(true);
    setEditError("");
    setEditSuccess(false);

    try {
      const response = await fetch(`/api/user/workflows/${editingWorkflow.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editFormData.name,
          description: editFormData.description,
          category: editFormData.category,
          workflowCode: editFormData.code
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update workflow');
      }

      const updatedWorkflow = await response.json();
      
      // Update the workflows list with the edited workflow
      setWorkflows(prevWorkflows => 
        prevWorkflows.map(w => 
          w.id === editingWorkflow.id 
            ? { ...w, ...updatedWorkflow }
            : w
        )
      );

      setEditSuccess(true);
      setEditingWorkflow(null);
      
      // Reset success state after 3 seconds
      setTimeout(() => setEditSuccess(false), 3000);
    } catch (err: any) {
      setEditError(err.message || 'Failed to update workflow');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteWorkflow = async (workflow: UserWorkflow) => {
    setWorkflowToDelete(workflow);
  };

  const confirmDeleteWorkflow = async () => {
    if (!workflowToDelete) return;

    setDeleteLoading(true);
    setDeleteError("");

    try {
      const response = await fetch(`/api/user/workflows/${workflowToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete workflow');
      }

      // Remove the workflow from the list
      setWorkflows(prevWorkflows => 
        prevWorkflows.filter(w => w.id !== workflowToDelete.id)
      );

      setDeleteSuccess(`Workflow "${workflowToDelete.name}" deleted successfully`);
      setWorkflowToDelete(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setDeleteSuccess(""), 3000);
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete workflow');
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDeleteWorkflow = () => {
    setWorkflowToDelete(null);
    setDeleteError("");
    setDeleteSuccess("");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your workflows...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
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
                My Workflows
              </h1>
              <p className="text-gray-600">
                Manage and run your created workflows
              </p>
            </div>
            

          </div>
        </div>

        {/* Delete Error Alert */}
        {deleteError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{deleteError}</AlertDescription>
          </Alert>
        )}

        {/* Delete Success Alert */}
        {deleteSuccess && (
          <Alert className="mb-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{deleteSuccess}</AlertDescription>
          </Alert>
        )}

        {/* Workflows List */}
        <div className="grid gap-6">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {workflow.name}
                      {getStatusIcon(workflow.status)}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {workflow.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{workflow.category}</Badge>
                    <Badge className={getStatusColor(workflow.status)}>
                      {workflow.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditWorkflow(workflow)}
                      className="ml-2"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteWorkflow(workflow)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{workflow.name}"? This action cannot be undone and will permanently remove the workflow.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={cancelDeleteWorkflow}>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={confirmDeleteWorkflow} 
                            disabled={deleteLoading}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {deleteLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Workflow
                              </>
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="preview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="preview">Live Preview</TabsTrigger>
                    <TabsTrigger value="configure">Configure & Run</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="preview" className="mt-4">
                    <LiveAppPreview code={workflow.code} />
                  </TabsContent>
                  
                  <TabsContent value="configure" className="mt-4">
                    <div className="space-y-4">
                      {workflow.workflowSchema ? (
                        <>
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Workflow Configuration</h3>
                            <Button 
                              onClick={() => handleRunWorkflow(workflow)}
                              disabled={workflowLoading}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Start New Workflow
                            </Button>
                          </div>
                          
                          {showWorkflowForm && selectedWorkflow?.id === workflow.id && (
                            <WorkflowInputForm
                              schema={workflow.workflowSchema}
                              onSubmit={handleWorkflowSubmit}
                              onCancel={() => setShowWorkflowForm(false)}
                              isLoading={workflowLoading}
                              isSuccess={workflowSuccess}
                              error={workflowError}
                            />
                          )}
                        </>
                      ) : (
                        <Alert>
                          <AlertDescription>
                            No configuration schema available for this workflow.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="details" className="mt-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">
                            Created
                          </h4>
                          <p className="text-sm">
                            {new Date(workflow.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">
                            Last Run
                          </h4>
                          <p className="text-sm">
                            {workflow.lastRun 
                              ? new Date(workflow.lastRun).toLocaleDateString()
                              : 'Never'
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-2">
                          Workflow Code
                        </h4>
                        <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-64">
                          {workflow.code}
                        </pre>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>

        {workflows.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-500">
                <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Active Workflows</h3>
                <p className="mb-4">You have no active workflows for this app.</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Workflow
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Workflow Modal */}
        {editingWorkflow && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Edit Workflow: {editingWorkflow.name}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={editLoading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={editLoading}
                  >
                    {editLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Workflow Name</Label>
                    <Input
                      id="edit-name"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter workflow name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-category">Category</Label>
                    <Select 
                      value={editFormData.category} 
                      onValueChange={(value) => setEditFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
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
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your workflow"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-code">Workflow Code</Label>
                  <Textarea
                    id="edit-code"
                    value={editFormData.code}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="Enter workflow code"
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>

                {editError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{editError}</AlertDescription>
                  </Alert>
                )}

                {editSuccess && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>Workflow updated successfully!</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyWorkflows; 