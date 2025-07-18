import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Settings, 
  LogOut, 
  Star, 
  Download, 
  Sparkles,
  Palette,
  BarChart,
  FileText,
  Code,
  Zap,
  Filter,
  Users,
  TrendingUp,
  Building,
  DollarSign,
  Settings as SettingsIcon,
  Play
} from "lucide-react";

// Empty mock apps - ready for real apps from database
const mockApps: any[] = [];

export default function Marketplace() {
  const { user, isAdmin, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  const { data: applications, error, isLoading: appsLoading } = useQuery({
    queryKey: ["/api/applications"],
    enabled: !!user,
  });

  // Combine mock apps with database apps, giving priority to database apps
  const dbApps = applications && Array.isArray(applications) ? applications : [];
  const combinedApps = [...mockApps, ...dbApps];
  
  // Remove duplicates based on ID (database apps take priority)
  const apps = combinedApps.filter((app, index, self) => 
    index === self.findIndex(a => a.id === app.id)
  );

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const categories = [
    { id: "all", name: "All", icon: Filter },
    { id: "marketing", name: "Marketing", icon: TrendingUp },
    { id: "sales", name: "Sales", icon: Zap },
    { id: "operations", name: "Operations", icon: Building },
    { id: "finance", name: "Finance", icon: DollarSign },
    { id: "hr", name: "HR", icon: Users },
    { id: "it", name: "IT", icon: SettingsIcon },
    { id: "other", name: "Other", icon: Filter },
  ];

  const filteredApps = apps.filter((app: any) => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredApps = filteredApps.filter((app: any) => app.featured);
  const allApps = filteredApps;

  // Show loading state while checking authentication
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
            <div className="flex items-center">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-extrabold text-gray-500 leading-none tracking-tight" style={{ letterSpacing: "0.05em" }}>
                  Agentic
                </span>
                <span className="text-xs font-semibold text-gray-700 tracking-wide" style={{ marginTop: "-2px" }}>
                  AI Agent Apps .com
                </span>
              </div>
            </div>

            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search apps"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setLocation("/blog")}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    Blog
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setLocation("/my-workflows")}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    My Workflows
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setLocation("/submit-app")}
                    className="text-green-600 hover:text-green-700"
                  >
                    Submit App
                  </Button>
                                {isAdmin && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setLocation("/admin")}
                  className="text-red-600 hover:text-red-700"
                >
                  Admin Panel
                </Button>
              )}
                  <span className="text-sm text-gray-600">
                    Welcome, {user?.firstName || user?.email}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => window.location.href = "/settings"}>
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setLocation("/blog")}
                    className="text-purple-600 hover:text-purple-700"
                  >
                    Blog
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setLocation("/auth")}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Login
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => setLocation("/auth")}
                  >
                    Create Account
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to AI Marketplace</h2>
              <p className="text-gray-600 mb-6">
                Sign in to discover and run amazing AI applications built by our community.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => setLocation("/auth")}>
                  Sign In
                </Button>
                <Button variant="outline" onClick={() => setLocation("/auth")}>
                  Create Account
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Category Tabs */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="grid w-full grid-cols-8 bg-white border">
            {categories.map((category) => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600"
              >
                <category.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-8">
            {featuredApps.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Featured</h2>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-600">
                    <Star className="h-3 w-3 mr-1" />
                    Trending
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {featuredApps.map((app: any) => (
                    <Card 
                      key={app.id} 
                      className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm overflow-hidden cursor-pointer"
                      onClick={() => setLocation(`/app-runner/${app.id}`)}
                    >
                      <CardContent className="p-0">
                        <div className={`${app.color} h-32 p-6 flex items-center justify-center relative`}>
                          <div className="text-4xl">{app.icon}</div>
                          <div className="absolute top-4 right-4">
                            <Badge variant="secondary" className="bg-white/80 text-gray-700">
                              <Star className="h-3 w-3 mr-1 fill-current text-yellow-500" />
                              {app.rating}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {app.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {app.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <Download className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{app.downloads}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {app.category}
                              </Badge>
                              <div className="flex items-center text-xs text-blue-600 group-hover:text-blue-700">
                                <Play className="h-3 w-3 mr-1" />
                                Run App
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">All apps</h2>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {allApps.map((app: any) => (
                  <Card 
                    key={app.id} 
                    className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm overflow-hidden cursor-pointer"
                    onClick={() => setLocation(`/app-runner/${app.id}`)}
                  >
                    <CardContent className="p-0">
                      <div className={`${app.color} h-32 p-6 flex items-center justify-center relative`}>
                        <div className="text-4xl">{app.icon}</div>
                        <div className="absolute top-4 right-4">
                          <Badge variant="secondary" className="bg-white/80 text-gray-700">
                            <Star className="h-3 w-3 mr-1 fill-current text-yellow-500" />
                            {app.rating}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {app.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {app.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Download className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{app.downloads}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {app.category}
                            </Badge>
                            <div className="flex items-center text-xs text-blue-600 group-hover:text-blue-700">
                              <Play className="h-3 w-3 mr-1" />
                              Run App
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Other category tabs */}
          {categories.slice(1).map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {allApps.filter((app: any) => app.category === category.id).map((app: any) => (
                  <Card 
                    key={app.id} 
                    className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm overflow-hidden cursor-pointer"
                    onClick={() => setLocation(`/app-runner/${app.id}`)}
                  >
                    <CardContent className="p-0">
                      <div className={`${app.color} h-32 p-6 flex items-center justify-center relative`}>
                        <div className="text-4xl">{app.icon}</div>
                        <div className="absolute top-4 right-4">
                          <Badge variant="secondary" className="bg-white/80 text-gray-700">
                            <Star className="h-3 w-3 mr-1 fill-current text-yellow-500" />
                            {app.rating}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {app.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {app.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <Download className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{app.downloads}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {app.category}
                            </Badge>
                            <div className="flex items-center text-xs text-blue-600 group-hover:text-blue-700">
                              <Play className="h-3 w-3 mr-1" />
                              Run App
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
          </>
        )}
      </div>
    </div>
  );
}