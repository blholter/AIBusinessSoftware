import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, Github, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface AppSubmission {
  name: string;
  description: string;
  category: string;
  githubUrl: string;
  readmeUrl?: string;
  demoUrl?: string;
  tags: string[];
  features: string[];
}

const SubmitApp: React.FC = () => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');
  const [submission, setSubmission] = useState<AppSubmission>({
    name: '',
    description: '',
    category: '',
    githubUrl: '',
    readmeUrl: '',
    demoUrl: '',
    tags: [],
    features: []
  });

  const [newTag, setNewTag] = useState('');
  const [newFeature, setNewFeature] = useState('');

  const categoryOptions = [
    { value: 'ai-ml', label: 'AI & Machine Learning' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'automation', label: 'Automation' },
    { value: 'data-analysis', label: 'Data Analysis' },
    { value: 'communication', label: 'Communication' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'finance', label: 'Finance' },
    { value: 'education', label: 'Education' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'other', label: 'Other' }
  ];

  const addTag = () => {
    if (newTag.trim() && !submission.tags.includes(newTag.trim())) {
      setSubmission(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSubmission(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addFeature = () => {
    if (newFeature.trim() && !submission.features.includes(newFeature.trim())) {
      setSubmission(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (featureToRemove: string) => {
    setSubmission(prev => ({
      ...prev,
      features: prev.features.filter(feature => feature !== featureToRemove)
    }));
  };

  const validateGithubUrl = (url: string): boolean => {
    const githubRegex = /^https:\/\/github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+\/?$/;
    return githubRegex.test(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to submit an application');
      return;
    }

    if (!validateGithubUrl(submission.githubUrl)) {
      setError('Please provide a valid GitHub repository URL');
      return;
    }

    if (!submission.name || !submission.description || !submission.category) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/applications/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...submission,
          author: user.email,
          authorName: user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit application');
      }

      setSuccess(true);
      setTimeout(() => {
        setLocation('/');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to submit an application.</p>
          <Button onClick={() => setLocation('/auth')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Mission Successful!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for submitting your application. Our team will review it and add it to the marketplace soon.
          </p>
          <Button onClick={() => setLocation('/')}>
            Return to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Submit Your Application
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Share your free software with the community! Submit your application via GitHub and get credit for your work.
            </p>
          </div>
        </div>

        {/* Info Alert */}
        <Alert className="mb-8 bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Free Submission:</strong> All applications are free to submit and will be available for free use on our platform. 
            You'll receive full credit for your work and can include links to your portfolio or other projects.
          </AlertDescription>
        </Alert>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Submission Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Application Details
            </CardTitle>
            <CardDescription>
              Provide information about your application. All fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Application Name *</Label>
                  <Input
                    id="name"
                    value={submission.name}
                    onChange={(e) => setSubmission(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter application name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={submission.category} onValueChange={(value) => setSubmission(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={submission.description}
                  onChange={(e) => setSubmission(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what your application does, its features, and how it helps users..."
                  rows={4}
                  required
                />
              </div>

              {/* GitHub URL */}
              <div className="space-y-2">
                <Label htmlFor="githubUrl" className="flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  GitHub Repository URL *
                </Label>
                <Input
                  id="githubUrl"
                  type="url"
                  value={submission.githubUrl}
                  onChange={(e) => setSubmission(prev => ({ ...prev, githubUrl: e.target.value }))}
                  placeholder="https://github.com/username/repository"
                  required
                />
                <p className="text-sm text-gray-500">
                  We require a GitHub repository for security verification. The repository should be public and contain your application code.
                </p>
              </div>

              {/* Optional URLs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="readmeUrl">README URL (Optional)</Label>
                  <Input
                    id="readmeUrl"
                    type="url"
                    value={submission.readmeUrl}
                    onChange={(e) => setSubmission(prev => ({ ...prev, readmeUrl: e.target.value }))}
                    placeholder="https://github.com/username/repository#readme"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="demoUrl">Demo URL (Optional)</Label>
                  <Input
                    id="demoUrl"
                    type="url"
                    value={submission.demoUrl}
                    onChange={(e) => setSubmission(prev => ({ ...prev, demoUrl: e.target.value }))}
                    placeholder="https://your-demo-site.com"
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    Add
                  </Button>
                </div>
                {submission.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {submission.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="space-y-2">
                <Label>Key Features</Label>
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <Button type="button" variant="outline" onClick={addFeature}>
                    Add
                  </Button>
                </div>
                {submission.features.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {submission.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <span className="flex-1">{feature}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeFeature(feature)}>
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button type="submit" disabled={loading} className="min-w-[120px]">
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubmitApp; 