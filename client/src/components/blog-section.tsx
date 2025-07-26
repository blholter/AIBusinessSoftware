import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowRight } from "lucide-react";

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

export default function BlogSection() {
  const { data: blogPosts = [], isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const response = await fetch("/api/blog-posts");
      if (!response.ok) throw new Error("Failed to fetch blog posts");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading blog posts...</p>
          </div>
        </div>
      </section>
    );
  }

  if (blogPosts.length === 0) {
    return null; // Don't show the section if there are no blog posts
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Latest Insights & Updates
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay up to date with the latest trends in AI business software and discover new ways to optimize your workflow.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.slice(0, 6).map((post: BlogPost) => (
            <Card key={post.id} className="h-full flex flex-col hover:shadow-lg transition-shadow">
              {post.featuredImage && (
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  <Badge variant="outline" className="text-xs">
                    {post.status}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-semibold line-clamp-2">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-gray-600 mb-4 flex-1 line-clamp-3">
                  {post.excerpt || post.content.substring(0, 150) + "..."}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full group"
                  onClick={() => window.location.href = `/blog/${post.slug}`}
                >
                  Read More
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {blogPosts.length > 6 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              View All Posts
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
} 