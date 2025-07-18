import { WorkflowSchema } from '@/components/workflow-input-form';

// Sample workflow schemas for demonstration
export const sampleWorkflowSchemas: Record<string, WorkflowSchema> = {
  'social-media-automation': {
    id: 'social-media-automation',
    name: 'Social Media Automation',
    description: 'Automatically post content to multiple social media platforms with AI-generated captions',
    version: '1.0.0',
    metadata: {
      author: 'AI Marketplace',
      tags: ['social-media', 'automation', 'ai'],
      category: 'Marketing',
      estimatedRuntime: '2-5 minutes',
      complexity: 'medium'
    },
    groups: [
      {
        id: 'content',
        name: 'Content Configuration',
        description: 'Set up your content and posting preferences',
        order: 1
      },
      {
        id: 'platforms',
        name: 'Social Media Platforms',
        description: 'Choose which platforms to post to',
        order: 2
      },
      {
        id: 'ai-settings',
        name: 'AI Settings',
        description: 'Configure AI behavior for content generation',
        order: 3
      }
    ],
    inputs: [
      {
        id: 'content_text',
        name: 'content_text',
        type: 'textarea',
        label: 'Content Text',
        description: 'The main content you want to post',
        required: true,
        placeholder: 'Enter your post content here...',
        group: 'content',
        order: 1,
        validation: {
          minLength: 10,
          maxLength: 2000
        }
      },
      {
        id: 'image_url',
        name: 'image_url',
        type: 'url',
        label: 'Image URL',
        description: 'URL of the image to include with your post',
        required: false,
        placeholder: 'https://example.com/image.jpg',
        group: 'content',
        order: 2
      },
      {
        id: 'scheduled_time',
        name: 'scheduled_time',
        type: 'datetime',
        label: 'Scheduled Time',
        description: 'When to post the content (leave empty for immediate posting)',
        required: false,
        group: 'content',
        order: 3
      },
      {
        id: 'platforms',
        name: 'platforms',
        type: 'multiselect',
        label: 'Target Platforms',
        description: 'Select which social media platforms to post to',
        required: true,
        group: 'platforms',
        order: 1,
        options: [
          { value: 'twitter', label: 'Twitter' },
          { value: 'facebook', label: 'Facebook' },
          { value: 'instagram', label: 'Instagram' },
          { value: 'linkedin', label: 'LinkedIn' },
          { value: 'tiktok', label: 'TikTok' }
        ]
      },
      {
        id: 'hashtags',
        name: 'hashtags',
        type: 'text',
        label: 'Hashtags',
        description: 'Comma-separated hashtags to include',
        required: false,
        placeholder: '#ai, #automation, #tech',
        group: 'platforms',
        order: 2
      },
      {
        id: 'ai_generate_caption',
        name: 'ai_generate_caption',
        type: 'boolean',
        label: 'Generate AI Caption',
        description: 'Use AI to generate an engaging caption',
        required: false,
        defaultValue: true,
        group: 'ai-settings',
        order: 1
      },
      {
        id: 'ai_tone',
        name: 'ai_tone',
        type: 'select',
        label: 'AI Tone',
        description: 'The tone for AI-generated content',
        required: false,
        defaultValue: 'professional',
        group: 'ai-settings',
        order: 2,
        options: [
          { value: 'professional', label: 'Professional' },
          { value: 'casual', label: 'Casual' },
          { value: 'friendly', label: 'Friendly' },
          { value: 'humorous', label: 'Humorous' },
          { value: 'formal', label: 'Formal' }
        ]
      },
      {
        id: 'ai_creativity',
        name: 'ai_creativity',
        type: 'number',
        label: 'AI Creativity Level',
        description: 'How creative should the AI be (1-10)',
        required: false,
        defaultValue: 7,
        group: 'ai-settings',
        order: 3,
        validation: {
          min: 1,
          max: 10
        }
      }
    ]
  },

  'email-campaign': {
    id: 'email-campaign',
    name: 'Email Campaign Automation',
    description: 'Send personalized email campaigns with dynamic content and tracking',
    version: '1.2.0',
    metadata: {
      author: 'AI Marketplace',
      tags: ['email', 'marketing', 'automation'],
      category: 'Marketing',
      estimatedRuntime: '5-10 minutes',
      complexity: 'complex'
    },
    groups: [
      {
        id: 'campaign',
        name: 'Campaign Settings',
        description: 'Basic campaign configuration',
        order: 1
      },
      {
        id: 'content',
        name: 'Email Content',
        description: 'Email template and content',
        order: 2
      },
      {
        id: 'audience',
        name: 'Audience & Targeting',
        description: 'Define your target audience',
        order: 3
      }
    ],
    inputs: [
      {
        id: 'campaign_name',
        name: 'campaign_name',
        type: 'text',
        label: 'Campaign Name',
        description: 'Internal name for this campaign',
        required: true,
        placeholder: 'Q1 Product Launch',
        group: 'campaign',
        order: 1,
        validation: {
          minLength: 3,
          maxLength: 100
        }
      },
      {
        id: 'sender_email',
        name: 'sender_email',
        type: 'email',
        label: 'Sender Email',
        description: 'Email address to send from',
        required: true,
        placeholder: 'noreply@yourcompany.com',
        group: 'campaign',
        order: 2
      },
      {
        id: 'sender_name',
        name: 'sender_name',
        type: 'text',
        label: 'Sender Name',
        description: 'Display name for the sender',
        required: true,
        placeholder: 'Your Company',
        group: 'campaign',
        order: 3
      },
      {
        id: 'subject_line',
        name: 'subject_line',
        type: 'text',
        label: 'Subject Line',
        description: 'Email subject line',
        required: true,
        placeholder: 'Exciting news about our new product!',
        group: 'content',
        order: 1,
        validation: {
          maxLength: 100
        }
      },
      {
        id: 'email_template',
        name: 'email_template',
        type: 'textarea',
        label: 'Email Template',
        description: 'HTML email template with placeholders like {{name}}, {{company}}',
        required: true,
        placeholder: '<h1>Hello {{name}},</h1><p>Welcome to {{company}}...</p>',
        group: 'content',
        order: 2,
        validation: {
          minLength: 50
        }
      },
      {
        id: 'audience_size',
        name: 'audience_size',
        type: 'number',
        label: 'Audience Size',
        description: 'Number of recipients',
        required: true,
        group: 'audience',
        order: 1,
        validation: {
          min: 1,
          max: 10000
        }
      },
      {
        id: 'target_segment',
        name: 'target_segment',
        type: 'select',
        label: 'Target Segment',
        description: 'Which customer segment to target',
        required: true,
        group: 'audience',
        order: 2,
        options: [
          { value: 'all', label: 'All Customers' },
          { value: 'active', label: 'Active Customers' },
          { value: 'inactive', label: 'Inactive Customers' },
          { value: 'new', label: 'New Customers' },
          { value: 'premium', label: 'Premium Customers' }
        ]
      },
      {
        id: 'send_immediately',
        name: 'send_immediately',
        type: 'boolean',
        label: 'Send Immediately',
        description: 'Send now or schedule for later',
        required: false,
        defaultValue: false,
        group: 'campaign',
        order: 4
      },
      {
        id: 'scheduled_date',
        name: 'scheduled_date',
        type: 'datetime',
        label: 'Scheduled Date',
        description: 'When to send the campaign',
        required: false,
        group: 'campaign',
        order: 5
      }
    ]
  },

  'data-analysis': {
    id: 'data-analysis',
    name: 'Data Analysis Pipeline',
    description: 'Analyze CSV data with AI insights and generate reports',
    version: '2.1.0',
    metadata: {
      author: 'AI Marketplace',
      tags: ['data', 'analysis', 'ai', 'csv'],
      category: 'Analytics',
      estimatedRuntime: '10-30 minutes',
      complexity: 'complex'
    },
    inputs: [
      {
        id: 'data_file',
        name: 'data_file',
        type: 'file',
        label: 'Data File',
        description: 'Upload your CSV file for analysis',
        required: true
      },
      {
        id: 'analysis_type',
        name: 'analysis_type',
        type: 'select',
        label: 'Analysis Type',
        description: 'What type of analysis to perform',
        required: true,
        defaultValue: 'trends',
        options: [
          { value: 'trends', label: 'Trend Analysis' },
          { value: 'correlations', label: 'Correlation Analysis' },
          { value: 'predictions', label: 'Predictive Analysis' },
          { value: 'segmentation', label: 'Customer Segmentation' },
          { value: 'anomalies', label: 'Anomaly Detection' }
        ]
      },
      {
        id: 'target_column',
        name: 'target_column',
        type: 'text',
        label: 'Target Column',
        description: 'Column name to analyze (leave empty for auto-detection)',
        required: false,
        placeholder: 'sales, revenue, customers'
      },
      {
        id: 'confidence_level',
        name: 'confidence_level',
        type: 'number',
        label: 'Confidence Level',
        description: 'Statistical confidence level (0.8-0.99)',
        required: false,
        defaultValue: 0.95,
        validation: {
          min: 0.8,
          max: 0.99
        }
      },
      {
        id: 'include_visualizations',
        name: 'include_visualizations',
        type: 'boolean',
        label: 'Include Visualizations',
        description: 'Generate charts and graphs',
        required: false,
        defaultValue: true
      },
      {
        id: 'custom_parameters',
        name: 'custom_parameters',
        type: 'json',
        label: 'Custom Parameters',
        description: 'Advanced parameters in JSON format',
        required: false,
        placeholder: '{"sample_size": 1000, "algorithm": "random_forest"}'
      }
    ]
  }
};

// Helper function to get a schema by ID
export const getWorkflowSchema = (id: string): WorkflowSchema | null => {
  return sampleWorkflowSchemas[id] || null;
};

// Helper function to get all available schemas
export const getAllWorkflowSchemas = (): WorkflowSchema[] => {
  return Object.values(sampleWorkflowSchemas);
}; 