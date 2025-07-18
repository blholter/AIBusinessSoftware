import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Download, Share2, Star, Eye } from "lucide-react";
import GeneratedWorkflowApp from "@/components/generated-workflow-app";
import { useLocation } from "wouter";

const GeneratedAppDemo: React.FC = () => {
  const [, setLocation] = useLocation();
  const [savedApps, setSavedApps] = useState<any[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSaveApp = (appData: any) => {
    const newApp = {
      id: Date.now(),
      name: appData.workflowConfig.name,
      description: `Generated workflow app with ${appData.workflowConfig.totalNodes} nodes`,
      category: 'Workflow Automation',
      tags: ['n8n', 'automation', 'ai', 'workflow'],
      createdAt: new Date().toISOString(),
      ...appData
    };
    
    setSavedApps(prev => [...prev, newApp]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDeployApp = (appData: any) => {
    // Here you would integrate with your deployment system
    console.log('Deploying app:', appData);
    alert('Deployment feature coming soon!');
  };

  const appStats = {
    downloads: 1247,
    rating: 4.8,
    reviews: 89,
    lastUpdated: '2024-01-15'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/marketplace')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Generated Workflow App
              </h1>
              <p className="text-gray-600 mb-4">
                AI-powered workflow automation converted from n8n to React web application
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  {appStats.downloads} downloads
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  {appStats.rating} ({appStats.reviews} reviews)
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  Last updated {appStats.lastUpdated}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {showSuccess && (
          <Alert className="mb-6">
            <AlertDescription>
              ✅ App saved successfully! You can find it in your saved applications.
            </AlertDescription>
          </Alert>
        )}

        {/* App Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>App Overview</CardTitle>
                <CardDescription>
                  This application was automatically generated from an n8n workflow and converted into a React web application with API integration capabilities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Key Features</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">Workflow Automation</Badge>
                      <Badge variant="secondary">AI Integration</Badge>
                      <Badge variant="secondary">API Connectivity</Badge>
                      <Badge variant="secondary">Real-time Processing</Badge>
                      <Badge variant="secondary">Webhook Support</Badge>
                      <Badge variant="secondary">Data Transformation</Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Workflow Components</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>• Manual Trigger</div>
                      <div>• HTTP Requests</div>
                      <div>• OpenAI Integration</div>
                      <div>• Google Sheets</div>
                      <div>• RSS Feed Reading</div>
                      <div>• Email Processing</div>
                      <div>• Data Batching</div>
                      <div>• Webhook Handling</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>App Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <p className="text-sm">Workflow Automation</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Complexity</label>
                  <p className="text-sm">Advanced</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Nodes</label>
                  <p className="text-sm">14 workflow nodes</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">API Integration</label>
                  <p className="text-sm">OpenAI, Google Sheets, Gmail</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">License</label>
                  <p className="text-sm">MIT</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Live Demo */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Live Demo</CardTitle>
            <CardDescription>
              Test the generated workflow application with your own data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GeneratedWorkflowApp 
              workflowName="Vizard AI Workflow"
              onSave={handleSaveApp}
              onDeploy={handleDeployApp}
            />
          </CardContent>
        </Card>

        {/* Saved Apps */}
        {savedApps.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Saved Apps</CardTitle>
              <CardDescription>
                Apps you've saved from this workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {savedApps.map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{app.name}</h4>
                      <p className="text-sm text-gray-500">
                        Saved on {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GeneratedAppDemo; 