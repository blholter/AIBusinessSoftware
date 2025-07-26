import React, { useState, useEffect } from "react";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Download, 
  FileText, 
  Settings, 
  Users, 
  Database,
  ArrowLeft,
  Save,
  X,
  Check,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Types
interface Application {
  id: number;
  name: string;
  description: string;
  category: string;
  icon: string;
  rating: number;
  downloads: number;
  featured: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  author: string;
  status: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const { user, signOut } = useSupabaseAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("applications");
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [jsonInput, setJsonInput] = useState("");
  const [showAppForm, setShowAppForm] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);

  // Form states
  const [appForm, setAppForm] = useState({
    name: "",
    description: "",
    category: "",
    icon: "",
    rating: 0,
    downloads: 0,
    featured: false,
    status: "active"
  });

  const [postForm, setPostForm] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    featuredImage: "",
    author: "",
    status: "draft"
  });

  // Queries
  const { data: applications = [], isLoading: appsLoading } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: async () => {
      const response = await fetch("/api/admin/applications");
      if (!response.ok) throw new Error("Failed to fetch applications");
      return response.json();
    },
    enabled: !!user
  });

  const { data: blogPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: async () => {
      const response = await fetch("/api/admin/blog-posts");
      if (!response.ok) throw new Error("Failed to fetch blog posts");
      return response.json();
    },
    enabled: !!user
  });

  // Mutations
  const createAppMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/admin/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to create application");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      toast({ title: "Success", description: "Application created successfully" });
      setShowAppForm(false);
      setAppForm({ name: "", description: "", category: "", icon: "", rating: 0, downloads: 0, featured: false, status: "active" });
    }
  });

  const updateAppMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/admin/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to update application");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      toast({ title: "Success", description: "Application updated successfully" });
      setEditingApp(null);
    }
  });

  const deleteAppMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/applications/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to delete application");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      toast({ title: "Success", description: "Application deleted successfully" });
    }
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/admin/blog-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to create blog post");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast({ title: "Success", description: "Blog post created successfully" });
      setShowPostForm(false);
      setPostForm({ title: "", slug: "", content: "", excerpt: "", featuredImage: "", author: "", status: "draft" });
    }
  });

  const updatePostMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/admin/blog-posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to update blog post");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast({ title: "Success", description: "Blog post updated successfully" });
      setEditingPost(null);
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/blog-posts/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to delete blog post");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast({ title: "Success", description: "Blog post deleted successfully" });
    }
  });

  const convertJsonMutation = useMutation({
    mutationFn: async (jsonString: string) => {
      const response = await fetch("/api/admin/convert-json-string", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonString })
      });
      if (!response.ok) throw new Error("Failed to convert JSON");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      toast({ 
        title: "Success", 
        description: `Converted ${data.createdApps.length} applications from JSON` 
      });
      setJsonInput("");
    }
  });

  // Handlers
  const handleAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingApp) {
      updateAppMutation.mutate({ id: editingApp.id, data: appForm });
    } else {
      createAppMutation.mutate(appForm);
    }
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPost) {
      updatePostMutation.mutate({ id: editingPost.id, data: postForm });
    } else {
      createPostMutation.mutate(postForm);
    }
  };

  const handleEditApp = (app: Application) => {
    setEditingApp(app);
    setAppForm({
      name: app.name,
      description: app.description,
      category: app.category,
      icon: app.icon,
      rating: app.rating,
      downloads: app.downloads,
      featured: app.featured,
      status: app.status
    });
    setShowAppForm(true);
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setPostForm({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || "",
      featuredImage: post.featuredImage || "",
      author: post.author,
      status: post.status
    });
    setShowPostForm(true);
  };

  const handleConvertJson = () => {
    if (!jsonInput.trim()) {
      toast({ title: "Error", description: "Please enter JSON data", variant: "destructive" });
      return;
    }
    convertJsonMutation.mutate(jsonInput);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need to be logged in to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = "/"}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Admin Dashboard</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Admin: {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="applications" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Applications</span>
            </TabsTrigger>
            <TabsTrigger value="blog-posts" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Blog Posts</span>
            </TabsTrigger>
            <TabsTrigger value="converter" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>JSON Converter</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Applications Management</h2>
              <Button onClick={() => setShowAppForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Application
              </Button>
            </div>

            {appsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading applications...</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {applications.map((app: Application) => (
                  <Card key={app.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-2xl">{app.icon}</span>
                            <div>
                              <h3 className="text-lg font-semibold">{app.name}</h3>
                              <p className="text-sm text-gray-600">{app.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <Badge variant="outline">{app.category}</Badge>
                            <span>Rating: {app.rating}</span>
                            <span>Downloads: {app.downloads}</span>
                            {app.featured && <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>}
                            <Badge variant={app.status === 'active' ? 'default' : 'secondary'}>
                              {app.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditApp(app)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => deleteAppMutation.mutate(app.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Blog Posts Tab */}
          <TabsContent value="blog-posts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Blog Posts Management</h2>
              <Button onClick={() => setShowPostForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Blog Post
              </Button>
            </div>

            {postsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading blog posts...</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {blogPosts.map((post: BlogPost) => (
                  <Card key={post.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{post.excerpt}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Slug: {post.slug}</span>
                            <span>Author: {post.author}</span>
                            <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                              {post.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditPost(post)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => deletePostMutation.mutate(post.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* JSON Converter Tab */}
          <TabsContent value="converter" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">JSON to Application Converter</h2>
              <p className="text-gray-600 mb-6">
                Upload a JSON file or paste JSON data to convert it into applications.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Convert JSON to Applications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">JSON Data</label>
                  <Textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder='[{"name": "App Name", "description": "App Description", "category": "marketing", "icon": "🚀"}]'
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleConvertJson}
                    disabled={convertJsonMutation.isPending}
                  >
                    {convertJsonMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Convert JSON
                  </Button>
                  <Button variant="outline" onClick={() => setJsonInput("")}>
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Analytics Dashboard</h2>
              <p className="text-gray-600">Analytics features coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Application Form Modal */}
      {showAppForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>{editingApp ? "Edit Application" : "Add Application"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAppSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <Input
                      value={appForm.name}
                      onChange={(e) => setAppForm({ ...appForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <Select value={appForm.category} onValueChange={(value) => setAppForm({ ...appForm, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                        <SelectItem value="it">IT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea
                    value={appForm.description}
                    onChange={(e) => setAppForm({ ...appForm, description: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Icon</label>
                    <Input
                      value={appForm.icon}
                      onChange={(e) => setAppForm({ ...appForm, icon: e.target.value })}
                      placeholder="🚀"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <Select value={appForm.status} onValueChange={(value) => setAppForm({ ...appForm, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Button type="submit" disabled={createAppMutation.isPending || updateAppMutation.isPending}>
                    {editingApp ? "Update" : "Create"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowAppForm(false);
                      setEditingApp(null);
                      setAppForm({ name: "", description: "", category: "", icon: "", rating: 0, downloads: 0, featured: false, status: "active" });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Blog Post Form Modal */}
      {showPostForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>{editingPost ? "Edit Blog Post" : "Add Blog Post"}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePostSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <Input
                      value={postForm.title}
                      onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Slug</label>
                    <Input
                      value={postForm.slug}
                      onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })}
                      placeholder="my-blog-post"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Content</label>
                  <Textarea
                    value={postForm.content}
                    onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                    rows={8}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Excerpt</label>
                  <Textarea
                    value={postForm.excerpt}
                    onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Author</label>
                    <Input
                      value={postForm.author}
                      onChange={(e) => setPostForm({ ...postForm, author: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <Select value={postForm.status} onValueChange={(value) => setPostForm({ ...postForm, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Featured Image URL</label>
                  <Input
                    value={postForm.featuredImage}
                    onChange={(e) => setPostForm({ ...postForm, featuredImage: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <Button type="submit" disabled={createPostMutation.isPending || updatePostMutation.isPending}>
                    {editingPost ? "Update" : "Create"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowPostForm(false);
                      setEditingPost(null);
                      setPostForm({ title: "", slug: "", content: "", excerpt: "", featuredImage: "", author: "", status: "draft" });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 