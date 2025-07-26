import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, CheckCircle, Key, Lock, Eye, EyeOff } from "lucide-react";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";

export function SecurityDashboard() {
  const { user } = useSupabaseAuth();
  const [showDetails, setShowDetails] = useState(false);

  const securityFeatures = [
    {
      name: "Password Security",
      status: "active",
      description: "Passwords are hashed with scrypt and random salt",
      icon: <Lock className="h-4 w-4" />,
    },
    {
      name: "API Key Encryption",
      status: "active", 
      description: "API keys encrypted with AES-256-GCM",
      icon: <Key className="h-4 w-4" />,
    },
    {
      name: "Rate Limiting",
      status: "active",
      description: "Protection against brute force attacks",
      icon: <Shield className="h-4 w-4" />,
    },
    {
      name: "Session Security",
      status: "active",
      description: "Secure HTTP-only cookies with CSRF protection",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    {
      name: "Audit Logging",
      status: "active",
      description: "All security events are logged and monitored",
      icon: <Eye className="h-4 w-4" />,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Security Overview</h2>
          <p className="text-gray-600">Monitor and manage your account security</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
          {showDetails ? "Hide Details" : "Show Details"}
        </Button>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {securityFeatures.map((feature) => (
          <Card key={feature.name} className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {feature.icon}
                  <CardTitle className="text-lg">{feature.name}</CardTitle>
                </div>
                {getStatusIcon(feature.status)}
              </div>
            </CardHeader>
            <CardContent>
              <Badge className={`${getStatusColor(feature.status)} mb-2`}>
                {feature.status.toUpperCase()}
              </Badge>
              {showDetails && (
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Strong Password Policy</h4>
                <p className="text-sm text-gray-600">
                  Your password is secured with industry-standard scrypt hashing
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">API Key Encryption</h4>
                <p className="text-sm text-gray-600">
                  Your API keys are encrypted at rest using AES-256-GCM encryption
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Rate Limiting Protection</h4>
                <p className="text-sm text-gray-600">
                  Automatic protection against brute force attacks and API abuse
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Secure Session Management</h4>
                <p className="text-sm text-gray-600">
                  HTTP-only cookies with CSRF protection and secure transmission
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Security Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Security Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Account Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-mono">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Auth Method:</span>
                  <Badge variant="outline">{user?.app_metadata?.provider || 'Email'}</Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Security Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Password Protected:</span>
                  <Badge className="bg-green-100 text-green-800">Yes</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Session Secure:</span>
                  <Badge className="bg-green-100 text-green-800">Yes</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">API Keys Encrypted:</span>
                  <Badge className="bg-green-100 text-green-800">Yes</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}