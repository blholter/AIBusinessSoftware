import React, { useState, useEffect } from 'react';
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
import { ArrowLeft, Edit, Save, X, Upload, Eye, Code, Database, Settings, Trash2, Plus, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface AppData {
  id: number;
  name: string;
  description: string;
  category: string;
  icon: string;
  rating: number;
  downloads: number;
  conversionId?: number;
  createdAt: string;
  updatedAt: string;
}

interface AppCode {
  code: string;
}

const AdminAppManager: React.FC = () => {
  const [, setLocation] = useLocation();
  const [apps, setApps] = useState<AppData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [editingApp, setEditingApp] = useState<AppData | null>(null);
  const [appCode, setAppCode] = useState<string>('');
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'rating' | 'downloads' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Category options
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
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/applications');
      if (!response.ok) {
        throw new Error('Failed to fetch apps');
      }
      const data = await response.json();
      setApps(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch apps');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppCode = async (appId: number) => {
    try {
      const response = await fetch(`/api/applications/${appId}/code`);
      if (!response.ok) {
        throw new Error('Failed to fetch app code');
      }
      const data: AppCode = await response.json();
      return data.code;
    } catch (err: any) {
      console.error('Failed to fetch app code:', err);
      return '';
    }
  };

  const handleEditApp = async (app: AppData) => {
    setEditingApp(app);
    const code = await fetchAppCode(app.id);
    setAppCode(code);
    setNewPhoto(null);
    setPhotoPreview('');
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    setEditingApp(null);
    setAppCode('');
    setNewPhoto(null);
    setPhotoPreview('');
    setError('');
    setSuccess('');
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

    setNewPhoto(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    setError('');
  };

  const handleSaveApp = async () => {
    if (!editingApp) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Prepare the update data
      const updateData = {
        name: editingApp.name,
        description: editingApp.description,
        category: editingApp.category,
        icon: editingApp.icon,
        code: appCode
      };

      // Create FormData if we have a new photo, otherwise use JSON
      let requestBody: string | FormData;
      let headers: Record<string, string>;
      
      if (newPhoto) {
        const formData = new FormData();
        formData.append('data', JSON.stringify(updateData));
        formData.append('photo', newPhoto);
        requestBody = formData;
        headers = {}; // Let browser set Content-Type for FormData
      } else {
        requestBody = JSON.stringify(updateData);
        headers = {
          'Content-Type': 'application/json',
        };
      }

      const response = await fetch(`/api/admin/applications/${editingApp.id}`, {
        method: 'PUT',
        headers,
        body: requestBody
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update app');
      }

      const updatedApp = await response.json();
      
      // Update the apps list
      setApps(apps.map(app => app.id === editingApp.id ? updatedApp : app));
      
      setSuccess('App updated successfully!');
      setEditingApp(null);
      setAppCode('');
      setNewPhoto(null);
      setPhotoPreview('');
    } catch (err: any) {
      setError(err.message || 'Failed to update app');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApp = async (appId: number) => {
    if (!confirm('Are you sure you want to delete this app? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await fetch(`/api/admin/applications/${appId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete app');
      }

      // Remove from apps list
      setApps(apps.filter(app => app.id !== appId));
      setSuccess('App deleted successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to delete app');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort apps
  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedApps = [...filteredApps].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'category':
        aValue = a.category.toLowerCase();
        bValue = b.category.toLowerCase();
        break;
      case 'rating':
        aValue = a.rating;
        bValue = b.rating;
        break;
      case 'downloads':
        aValue = a.downloads;
        bValue = b.downloads;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to ascending
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (loading && apps.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading apps...</p>
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
            onClick={() => setLocation("/admin")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Panel
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                App Manager
              </h1>
              <p className="text-gray-600">
                Edit names, descriptions, photos, and code for marketplace apps
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                <Database className="h-3 w-3 mr-1" />
                {apps.length} Apps
              </Badge>
            </div>
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Sorting Controls */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="search" className="text-sm font-medium">Search apps:</Label>
                  <Input
                    id="search"
                    placeholder="Search by name, description, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="text-sm text-gray-500">
                  {sortedApps.length} of {apps.length} app{sortedApps.length !== 1 ? 's' : ''}
                </div>
              </div>
              
              {/* Sort Controls */}
              <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                    <Label className="text-sm font-medium">Sort by:</Label>
                    <div className="flex gap-2">
                      {[
                        { key: 'name', label: 'Name' },
                        { key: 'category', label: 'Category' },
                        { key: 'rating', label: 'Rating' },
                        { key: 'downloads', label: 'Downloads' },
                        { key: 'createdAt', label: 'Created' }
                      ].map(({ key, label }) => (
                        <Button
                          key={key}
                          variant={sortBy === key ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSort(key as typeof sortBy)}
                          className={`flex items-center gap-1 ${
                            sortBy === key ? 'bg-blue-600 hover:bg-blue-700' : ''
                          }`}
                        >
                          {label}
                          {sortBy === key && (
                            sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                          )}
                          {sortBy !== key && <ArrowUpDown className="h-3 w-3" />}
                        </Button>
                      ))}
                    </div>
                    {sortBy && (
                      <Badge variant="outline" className="text-xs">
                        {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)} {sortOrder === 'asc' ? '↑' : '↓'}
                      </Badge>
                    )}
                  </div>
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Clear search
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Apps List */}
        <div className="space-y-6">
          {sortedApps.map((app) => (
            <Card key={app.id} className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{app.icon}</div>
                    <div>
                      <CardTitle className="text-xl">{app.name}</CardTitle>
                      <CardDescription className="text-gray-600">
                        {app.description}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{app.category}</Badge>
                    <Badge variant="secondary">⭐ {app.rating}</Badge>
                    <Badge variant="secondary">📥 {app.downloads}</Badge>
                    
                    {editingApp?.id === app.id ? (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={handleSaveApp}
                          disabled={loading}
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditApp(app)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setLocation(`/app-runner/${app.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteApp(app.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              {editingApp?.id === app.id && (
                <CardContent>
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="details" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Details
                      </TabsTrigger>
                      <TabsTrigger value="photo" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Photo
                      </TabsTrigger>
                      <TabsTrigger value="code" className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Code
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="app-name">App Name</Label>
                          <Input
                            id="app-name"
                            value={editingApp.name}
                            onChange={(e) => setEditingApp({...editingApp, name: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="app-category">Category</Label>
                          <Select 
                            value={editingApp.category} 
                            onValueChange={(value) => setEditingApp({...editingApp, category: value})}
                          >
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
                          value={editingApp.description}
                          onChange={(e) => setEditingApp({...editingApp, description: e.target.value})}
                          rows={3}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="app-icon">Icon (Emoji)</Label>
                        <Input
                          id="app-icon"
                          value={editingApp.icon}
                          onChange={(e) => setEditingApp({...editingApp, icon: e.target.value})}
                          className="mt-1"
                          placeholder="⚡"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="photo" className="space-y-4">
                      <div>
                        <Label htmlFor="app-photo">App Photo</Label>
                        <Input
                          id="app-photo"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="mt-1"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Upload a new photo for this app (max 5MB)
                        </p>
                      </div>
                      
                      {photoPreview && (
                        <div>
                          <Label>Photo Preview</Label>
                          <div className="mt-2">
                            <img 
                              src={photoPreview} 
                              alt="App preview" 
                              className="w-32 h-32 object-cover rounded-lg border"
                            />
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="code" className="space-y-4">
                      <div>
                        <Label htmlFor="app-code">Generated Code</Label>
                        <Textarea
                          id="app-code"
                          value={appCode}
                          onChange={(e) => setAppCode(e.target.value)}
                          rows={20}
                          className="mt-1 font-mono text-sm"
                          placeholder="React component code..."
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Edit the generated React component code for this app
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {sortedApps.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Apps Found</h3>
              <p className="text-gray-600 mb-4">
                There are no apps in the marketplace yet.
              </p>
              <Button onClick={() => setLocation('/admin/workflow-converter')}>
                <Plus className="h-4 w-4 mr-2" />
                Create First App
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminAppManager; 