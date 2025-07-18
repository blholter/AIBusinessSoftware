// Test script for Workflow API endpoints with API key integration
const testWorkflow = {
  name: "AI-Powered Workflow",
  nodes: [
    {
      id: "1",
      name: "Webhook Trigger",
      type: "webhook",
      position: [100, 100],
      parameters: {
        httpMethod: "POST",
        path: "ai-webhook"
      }
    },
    {
      id: "2", 
      name: "OpenAI Node",
      type: "openAi",
      position: [300, 100],
      parameters: {
        operation: "completion",
        model: "gpt-3.5-turbo",
        prompt: "{{ $json.prompt }}"
      }
    },
    {
      id: "3",
      name: "Anthropic Node",
      type: "anthropic",
      position: [500, 100],
      parameters: {
        operation: "completion",
        model: "claude-3-sonnet-20240229",
        prompt: "{{ $json.prompt }}"
      }
    },
    {
      id: "4",
      name: "Function",
      type: "function",
      position: [700, 100],
      parameters: {
        functionCode: "return { json: { processed: true, aiResponse: $json } };"
      }
    }
  ],
  connections: {
    "1": {
      "main": [
        [
          {
            node: "2",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "2": {
      "main": [
        [
          {
            node: "3",
            type: "main",
            index: 0
          }
        ]
      ]
    },
    "3": {
      "main": [
        [
          {
            node: "4", 
            type: "main",
            index: 0
          }
        ]
      ]
    }
  }
};

async function testAPI() {
  const baseURL = 'http://localhost:5000/api/workflow';
  
  console.log('Testing Workflow API endpoints...\n');
  
  // Test 1: Analyze workflow
  console.log('1. Testing workflow analysis...');
  try {
    const analyzeResponse = await fetch(`${baseURL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflowName: testWorkflow.name,
        workflowData: testWorkflow,
        outputFormat: 'react'
      })
    });
    
    const analyzeResult = await analyzeResponse.json();
    console.log('Analysis result:', JSON.stringify(analyzeResult, null, 2));
  } catch (error) {
    console.error('Analysis test failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Generate code
  console.log('2. Testing code generation...');
  try {
    const generateResponse = await fetch(`${baseURL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflowName: testWorkflow.name,
        workflowData: testWorkflow,
        outputFormat: 'react'
      })
    });
    
    const generateResult = await generateResponse.json();
    console.log('Generation result:', JSON.stringify(generateResult, null, 2));
  } catch (error) {
    console.error('Generation test failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Get templates
  console.log('3. Testing templates endpoint...');
  try {
    const templatesResponse = await fetch(`${baseURL}/templates`);
    const templatesResult = await templatesResponse.json();
    console.log('Templates result:', JSON.stringify(templatesResult, null, 2));
  } catch (error) {
    console.error('Templates test failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 4: Get node types
  console.log('4. Testing node types endpoint...');
  try {
    const nodeTypesResponse = await fetch(`${baseURL}/node-types`);
    const nodeTypesResult = await nodeTypesResponse.json();
    console.log('Node types result:', JSON.stringify(nodeTypesResult, null, 2));
  } catch (error) {
    console.error('Node types test failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 5: Test API key integration
  console.log('5. Testing API key integration...');
  try {
    const generateWithApiResponse = await fetch(`${baseURL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflowName: testWorkflow.name,
        workflowData: testWorkflow,
        outputFormat: 'react'
      })
    });
    
    const generateWithApiResult = await generateWithApiResponse.json();
    console.log('API Key Integration result:');
    console.log('- Success:', generateWithApiResult.success);
    console.log('- Available APIs:', generateWithApiResult.availableApis);
    console.log('- API Key Count:', generateWithApiResult.apiKeyCount);
    console.log('- Generated Code Length:', generateWithApiResult.generatedCode?.length || 0);
  } catch (error) {
    console.error('API key integration test failed:', error.message);
  }
  
  console.log('\nAPI testing completed!');
}

// Run the test if this file is executed directly
if (typeof window === 'undefined') {
  testAPI().catch(console.error);
} 