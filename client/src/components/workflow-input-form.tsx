import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Play, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  Upload, 
  FileText,
  Settings,
  Zap,
  Send,
  Copy,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Input schema types
export interface InputField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'email' | 'url' | 'textarea' | 'select' | 'multiselect' | 'boolean' | 'file' | 'json' | 'date' | 'time' | 'datetime';
  label: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: any;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  group?: string;
  order?: number;
}

export interface WorkflowSchema {
  id: string;
  name: string;
  description: string;
  version: string;
  inputs: InputField[];
  groups?: Array<{
    id: string;
    name: string;
    description?: string;
    order: number;
  }>;
  metadata?: {
    author?: string;
    tags?: string[];
    category?: string;
    estimatedRuntime?: string;
    complexity?: 'simple' | 'medium' | 'complex';
  };
}

interface WorkflowInputFormProps {
  schema: WorkflowSchema;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  isSuccess?: boolean;
  error?: string;
}

const WorkflowInputForm: React.FC<WorkflowInputFormProps> = ({
  schema,
  onSubmit,
  onCancel,
  isLoading = false,
  isSuccess = false,
  error
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    // Initialize with default values
    const initial: Record<string, any> = {};
    schema.inputs.forEach(input => {
      if (input.defaultValue !== undefined) {
        initial[input.id] = input.defaultValue;
      }
    });
    return initial;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: InputField, value: any): string | null => {
    if (field.required && (value === undefined || value === null || value === '')) {
      return `${field.label} is required`;
    }

    if (value !== undefined && value !== null && value !== '') {
      // Type-specific validation
      switch (field.type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return 'Please enter a valid email address';
          }
          break;
        case 'url':
          try {
            new URL(value);
          } catch {
            return 'Please enter a valid URL';
          }
          break;
        case 'number':
          if (isNaN(Number(value))) {
            return 'Please enter a valid number';
          }
          if (field.validation?.min !== undefined && Number(value) < field.validation.min) {
            return `Value must be at least ${field.validation.min}`;
          }
          if (field.validation?.max !== undefined && Number(value) > field.validation.max) {
            return `Value must be at most ${field.validation.max}`;
          }
          break;
        case 'json':
          try {
            JSON.parse(value);
          } catch {
            return 'Please enter valid JSON';
          }
          break;
      }

      // Length validation
      if (field.validation?.minLength && value.length < field.validation.minLength) {
        return `${field.label} must be at least ${field.validation.minLength} characters`;
      }
      if (field.validation?.maxLength && value.length > field.validation.maxLength) {
        return `${field.label} must be at most ${field.validation.maxLength} characters`;
      }
    }

    return null;
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    
    // Clear error for this field
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    schema.inputs.forEach(field => {
      const error = validateField(field, formData[field.id]);
      if (error) {
        newErrors[field.id] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('Form submission error:', err);
    }
  };

  const renderInputField = (field: InputField) => {
    const value = formData[field.id];
    const error = errors[field.id];

    const commonProps = {
      id: field.id,
      value: value || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        handleInputChange(field.id, e.target.value),
      placeholder: field.placeholder,
      className: error ? 'border-red-500' : '',
    };

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            rows={4}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
          />
        );

      case 'select':
        return (
          <Select value={value || ''} onValueChange={(val) => handleInputChange(field.id, val)}>
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`${field.id}-${option.value}`}
                  checked={selectedValues.includes(option.value)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option.value]
                      : selectedValues.filter(v => v !== option.value);
                    handleInputChange(field.id, newValues);
                  }}
                  className="rounded"
                />
                <Label htmlFor={`${field.id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </div>
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={field.id}
              checked={value || false}
              onCheckedChange={(checked) => handleInputChange(field.id, checked)}
            />
            <Label htmlFor={field.id}>{field.label}</Label>
          </div>
        );

      case 'file':
        return (
          <div className="space-y-2">
            <Input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                handleInputChange(field.id, file);
              }}
              className={error ? 'border-red-500' : ''}
            />
            {value && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                <span>{value.name}</span>
              </div>
            )}
          </div>
        );

      case 'number':
        return (
          <Input
            {...commonProps}
            type="number"
            min={field.validation?.min}
            max={field.validation?.max}
            onChange={(e) => handleInputChange(field.id, Number(e.target.value))}
          />
        );

      case 'date':
        return (
          <Input
            {...commonProps}
            type="date"
            onChange={(e) => handleInputChange(field.id, e.target.value)}
          />
        );

      case 'time':
        return (
          <Input
            {...commonProps}
            type="time"
            onChange={(e) => handleInputChange(field.id, e.target.value)}
          />
        );

      case 'datetime':
        return (
          <Input
            {...commonProps}
            type="datetime-local"
            onChange={(e) => handleInputChange(field.id, e.target.value)}
          />
        );

      default:
        return (
          <Input
            {...commonProps}
            type={field.type}
          />
        );
    }
  };

  // Group inputs by their group
  const groupedInputs = schema.inputs.reduce((acc, input) => {
    const group = input.group || 'default';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(input);
    return acc;
  }, {} as Record<string, InputField[]>);

  // Sort groups by order
  const sortedGroups = Object.keys(groupedInputs).sort((a, b) => {
    const groupA = schema.groups?.find(g => g.id === a);
    const groupB = schema.groups?.find(g => g.id === b);
    return (groupA?.order || 0) - (groupB?.order || 0);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                {schema.name}
              </CardTitle>
              <CardDescription className="mt-2">
                {schema.description}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">v{schema.version}</Badge>
              {schema.metadata?.complexity && (
                <Badge variant="secondary">
                  {schema.metadata.complexity}
                </Badge>
              )}
            </div>
          </div>
          
          {schema.metadata && (
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-4">
              {schema.metadata.author && (
                <span>By {schema.metadata.author}</span>
              )}
              {schema.metadata.estimatedRuntime && (
                <span>⏱️ {schema.metadata.estimatedRuntime}</span>
              )}
              {schema.metadata.tags && (
                <div className="flex gap-1">
                  {schema.metadata.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Success/Error Messages */}
      {isSuccess && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Workflow executed successfully! Results have been sent via Telegram.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configure Workflow
          </CardTitle>
          <CardDescription>
            Set up the parameters for your workflow execution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {sortedGroups.map(groupId => {
              const inputs = groupedInputs[groupId];
              const group = schema.groups?.find(g => g.id === groupId);
              
              return (
                <div key={groupId} className="space-y-4">
                  {group && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{group.name}</h3>
                      {group.description && (
                        <p className="text-sm text-gray-600 mb-4">{group.description}</p>
                      )}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inputs.map(field => (
                      <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.id} className="flex items-center gap-2">
                          {field.label}
                          {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        
                        {renderInputField(field)}
                        
                        {field.description && (
                          <p className="text-sm text-gray-500">{field.description}</p>
                        )}
                        
                        {errors[field.id] && (
                          <p className="text-sm text-red-500">{errors[field.id]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {groupId !== sortedGroups[sortedGroups.length - 1] && (
                    <Separator className="my-6" />
                  )}
                </div>
              );
            })}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Send className="h-4 w-4" />
                <span>Results will be sent via Telegram</span>
              </div>
              
              <div className="flex items-center gap-2">
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Execute Workflow
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowInputForm; 