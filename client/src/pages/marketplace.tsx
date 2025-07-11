import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
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
  Filter
} from "lucide-react";

// Mock data for demonstration
const mockApps = [
  {
    id: 1,
    name: "Photo Collage Creator",
    description: "Create stunning photo collages with AI assistance",
    category: "creativity",
    icon: "🎨",
    color: "bg-gradient-to-br from-orange-100 to-pink-100",
    downloads: "1.2M",
    rating: 4.8,
    featured: true
  },
  {
    id: 2,
    name: "AI Writing Assistant",
    description: "Enhance your writing with AI-powered suggestions",
    category: "productivity",
    icon: "✍️",
    color: "bg-gradient-to-br from-blue-100 to-purple-100",
    downloads: "850K",
    rating: 4.9,
    featured: true
  },
  {
    id: 3,
    name: "Smart Analytics",
    description: "Generate insights from your data instantly",
    category: "business",
    icon: "📊",
    color: "bg-gradient-to-br from-green-100 to-emerald-100",
    downloads: "650K",
    rating: 4.7,
    featured: true
  },
  {
    id: 4,
    name: "Voice Transcriber",
    description: "Convert speech to text with high accuracy",
    category: "productivity",
    icon: "🎙️",
    color: "bg-gradient-to-br from-indigo-100 to-cyan-100",
    downloads: "420K",
    rating: 4.6,
    featured: false
  },
  {
    id: 5,
    name: "Image Generator",
    description: "Create unique images from text descriptions",
    category: "creativity",
    icon: "🖼️",
    color: "bg-gradient-to-br from-purple-100 to-pink-100",
    downloads: "380K",
    rating: 4.5,
    featured: false
  },
  {
    id: 6,
    name: "Code Assistant",
    description: "AI-powered coding help and suggestions",
    category: "development",
    icon: "💻",
    color: "bg-gradient-to-br from-gray-100 to-slate-100",
    downloads: "290K",
    rating: 4.4,
    featured: false
  }
];

export default function Marketplace() {
  const { user, logoutMutation } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  const { data: applications = mockApps } = useQuery({
    queryKey: ["/api/applications"],
    enabled: !!user,
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const categories = [
    { id: "all", name: "All", icon: Filter },
    { id: "creativity", name: "Creative", icon: Palette },
    { id: "productivity", name: "Productivity", icon: Zap },
    { id: "business", name: "Business", icon: BarChart },
    { id: "development", name: "Development", icon: Code },
    { id: "education", name: "Education", icon: FileText },
  ];

  const filteredApps = applications.filter((app: any) => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredApps = filteredApps.filter((app: any) => app.featured);
  const allApps = filteredApps;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Add-ons</span>
              </div>
            </div>

            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search everything"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.firstName || user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={() => window.location.href = "/settings"}>
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="grid w-full grid-cols-6 bg-white border">
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
                    <Card key={app.id} className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm overflow-hidden">
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
                            <Badge variant="outline" className="text-xs">
                              {app.category}
                            </Badge>
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
                <h2 className="text-2xl font-bold text-gray-900">All add-ons</h2>
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
                  <Card key={app.id} className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm overflow-hidden">
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
                          <Badge variant="outline" className="text-xs">
                            {app.category}
                          </Badge>
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
                  <Card key={app.id} className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm overflow-hidden">
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
                          <Badge variant="outline" className="text-xs">
                            {app.category}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}