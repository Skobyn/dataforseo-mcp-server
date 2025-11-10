# DataForSEO MCP Server - Integration Guide

## Service Information

**Production URL**: `https://dataforseo-mcp-server-1030002812603.us-central1.run.app`
**Protocol**: HTTP/HTTPS with JSON-RPC 2.0
**Authentication**: Currently unauthenticated (public access)

---

## Quick Start

### 1. Test the Connection

```bash
# Health check
curl https://dataforseo-mcp-server-1030002812603.us-central1.run.app/health

# List available tools
curl https://dataforseo-mcp-server-1030002812603.us-central1.run.app/tools
```

### 2. Make Your First API Call

```bash
curl -X POST https://dataforseo-mcp-server-1030002812603.us-central1.run.app/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "serp_google_organic_live",
      "arguments": {
        "keyword": "best seo tools",
        "location_code": 2840,
        "language_code": "en",
        "device": "desktop"
      }
    },
    "id": 1
  }'
```

---

## API Endpoints

### GET `/health`
Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-07T13:23:49.096Z",
  "service": "dataforseo-mcp-server",
  "version": "1.0.0"
}
```

### GET `/`
Service information and available endpoints.

### GET `/tools`
List all available MCP tools (50+ DataForSEO API endpoints).

**Response:**
```json
{
  "result": {
    "tools": [
      {
        "name": "serp_google_organic_live",
        "inputSchema": { ... }
      },
      ...
    ]
  }
}
```

### POST `/mcp`
Main MCP endpoint for executing API calls.

**Request Format (JSON-RPC 2.0):**
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "TOOL_NAME",
    "arguments": { ... }
  },
  "id": 1
}
```

**Response Format:**
```json
{
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{ ... DataForSEO API response ... }"
      }
    ]
  },
  "jsonrpc": "2.0",
  "id": 1
}
```

---

## Integration Examples

### JavaScript/Node.js

#### Using Fetch (Browser/Node 18+)

```javascript
class DataForSEOMCPClient {
  constructor(baseUrl = 'https://dataforseo-mcp-server-1030002812603.us-central1.run.app') {
    this.baseUrl = baseUrl;
    this.requestId = 1;
  }

  async callTool(toolName, arguments) {
    const response = await fetch(`${this.baseUrl}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: arguments
        },
        id: this.requestId++
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`MCP Error: ${data.error.message}`);
    }

    // Parse the text content from MCP response
    const textContent = data.result.content.find(c => c.type === 'text');
    return JSON.parse(textContent.text);
  }

  async listTools() {
    const response = await fetch(`${this.baseUrl}/tools`);
    return await response.json();
  }

  async healthCheck() {
    const response = await fetch(`${this.baseUrl}/health`);
    return await response.json();
  }
}

// Usage Example
const client = new DataForSEOMCPClient();

// Get Google search results
const serpResults = await client.callTool('serp_google_organic_live', {
  keyword: 'best restaurants near me',
  location_code: 2840,
  language_code: 'en',
  device: 'desktop'
});

console.log(serpResults);

// Get keyword search volume
const searchVolume = await client.callTool('keywords_google_ads_search_volume', {
  keywords: ['seo tools', 'digital marketing'],
  location_code: 2840,
  language_code: 'en'
});

console.log(searchVolume);

// Get backlinks for a domain
const backlinks = await client.callTool('backlinks_summary', {
  target: 'example.com'
});

console.log(backlinks);
```

#### Using Axios

```javascript
const axios = require('axios');

class DataForSEOMCPClient {
  constructor(baseUrl = 'https://dataforseo-mcp-server-1030002812603.us-central1.run.app') {
    this.baseUrl = baseUrl;
    this.requestId = 1;
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async callTool(toolName, arguments) {
    try {
      const response = await this.client.post('/mcp', {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: arguments
        },
        id: this.requestId++
      });

      if (response.data.error) {
        throw new Error(`MCP Error: ${response.data.error.message}`);
      }

      const textContent = response.data.result.content.find(c => c.type === 'text');
      return JSON.parse(textContent.text);
    } catch (error) {
      console.error('Error calling MCP tool:', error.message);
      throw error;
    }
  }

  async listTools() {
    const response = await this.client.get('/tools');
    return response.data;
  }

  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }
}

module.exports = DataForSEOMCPClient;
```

### Python

```python
import requests
import json
from typing import Dict, Any, List

class DataForSEOMCPClient:
    def __init__(self, base_url: str = 'https://dataforseo-mcp-server-1030002812603.us-central1.run.app'):
        self.base_url = base_url
        self.request_id = 1
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})

    def call_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Call an MCP tool and return the parsed result."""
        payload = {
            'jsonrpc': '2.0',
            'method': 'tools/call',
            'params': {
                'name': tool_name,
                'arguments': arguments
            },
            'id': self.request_id
        }
        self.request_id += 1

        response = self.session.post(
            f'{self.base_url}/mcp',
            json=payload,
            timeout=60
        )
        response.raise_for_status()

        data = response.json()

        if 'error' in data:
            raise Exception(f"MCP Error: {data['error']['message']}")

        # Parse the text content from MCP response
        text_content = next(
            (c for c in data['result']['content'] if c['type'] == 'text'),
            None
        )

        if not text_content:
            raise Exception('No text content in response')

        return json.loads(text_content['text'])

    def list_tools(self) -> Dict[str, Any]:
        """List all available MCP tools."""
        response = self.session.get(f'{self.base_url}/tools')
        response.raise_for_status()
        return response.json()

    def health_check(self) -> Dict[str, Any]:
        """Check service health."""
        response = self.session.get(f'{self.base_url}/health')
        response.raise_for_status()
        return response.json()

# Usage Example
if __name__ == '__main__':
    client = DataForSEOMCPClient()

    # Check health
    health = client.health_check()
    print(f"Service status: {health['status']}")

    # Get Google search results
    serp_results = client.call_tool('serp_google_organic_live', {
        'keyword': 'best restaurants near me',
        'location_code': 2840,
        'language_code': 'en',
        'device': 'desktop'
    })
    print(serp_results)

    # Get keyword search volume
    search_volume = client.call_tool('keywords_google_ads_search_volume', {
        'keywords': ['seo tools', 'digital marketing'],
        'location_code': 2840,
        'language_code': 'en'
    })
    print(search_volume)

    # Get backlinks
    backlinks = client.call_tool('backlinks_summary', {
        'target': 'example.com'
    })
    print(backlinks)
```

### TypeScript

```typescript
interface MCPRequest {
  jsonrpc: '2.0';
  method: string;
  params: {
    name: string;
    arguments: Record<string, any>;
  };
  id: number;
}

interface MCPResponse {
  result: {
    content: Array<{
      type: string;
      text: string;
    }>;
  };
  jsonrpc: '2.0';
  id: number;
  error?: {
    code: number;
    message: string;
  };
}

class DataForSEOMCPClient {
  private baseUrl: string;
  private requestId: number = 1;

  constructor(baseUrl: string = 'https://dataforseo-mcp-server-1030002812603.us-central1.run.app') {
    this.baseUrl = baseUrl;
  }

  async callTool<T = any>(toolName: string, args: Record<string, any>): Promise<T> {
    const request: MCPRequest = {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      },
      id: this.requestId++
    };

    const response = await fetch(`${this.baseUrl}/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: MCPResponse = await response.json();

    if (data.error) {
      throw new Error(`MCP Error: ${data.error.message}`);
    }

    const textContent = data.result.content.find(c => c.type === 'text');
    if (!textContent) {
      throw new Error('No text content in response');
    }

    return JSON.parse(textContent.text) as T;
  }

  async listTools(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/tools`);
    return await response.json();
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    return await response.json();
  }
}

// Usage Example
const client = new DataForSEOMCPClient();

interface SERPResult {
  tasks: Array<{
    result: any[];
  }>;
}

const results = await client.callTool<SERPResult>('serp_google_organic_live', {
  keyword: 'best seo tools',
  location_code: 2840,
  language_code: 'en',
  device: 'desktop'
});
```

### PHP

```php
<?php

class DataForSEOMCPClient {
    private $baseUrl;
    private $requestId = 1;

    public function __construct($baseUrl = 'https://dataforseo-mcp-server-1030002812603.us-central1.run.app') {
        $this->baseUrl = $baseUrl;
    }

    public function callTool($toolName, $arguments) {
        $payload = [
            'jsonrpc' => '2.0',
            'method' => 'tools/call',
            'params' => [
                'name' => $toolName,
                'arguments' => $arguments
            ],
            'id' => $this->requestId++
        ];

        $ch = curl_init($this->baseUrl . '/mcp');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 60);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            throw new Exception("HTTP error! status: $httpCode");
        }

        $data = json_decode($response, true);

        if (isset($data['error'])) {
            throw new Exception("MCP Error: " . $data['error']['message']);
        }

        // Find text content
        foreach ($data['result']['content'] as $content) {
            if ($content['type'] === 'text') {
                return json_decode($content['text'], true);
            }
        }

        throw new Exception('No text content in response');
    }

    public function listTools() {
        $response = file_get_contents($this->baseUrl . '/tools');
        return json_decode($response, true);
    }

    public function healthCheck() {
        $response = file_get_contents($this->baseUrl . '/health');
        return json_decode($response, true);
    }
}

// Usage Example
$client = new DataForSEOMCPClient();

// Get Google search results
$serpResults = $client->callTool('serp_google_organic_live', [
    'keyword' => 'best restaurants near me',
    'location_code' => 2840,
    'language_code' => 'en',
    'device' => 'desktop'
]);

print_r($serpResults);

// Get keyword search volume
$searchVolume = $client->callTool('keywords_google_ads_search_volume', [
    'keywords' => ['seo tools', 'digital marketing'],
    'location_code' => 2840,
    'language_code' => 'en'
]);

print_r($searchVolume);
?>
```

### cURL Examples

```bash
# Get Google SERP results
curl -X POST https://dataforseo-mcp-server-1030002812603.us-central1.run.app/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "serp_google_organic_live",
      "arguments": {
        "keyword": "best seo tools",
        "location_code": 2840,
        "language_code": "en",
        "device": "desktop",
        "depth": 10
      }
    },
    "id": 1
  }'

# Get keyword search volume
curl -X POST https://dataforseo-mcp-server-1030002812603.us-central1.run.app/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "keywords_google_ads_search_volume",
      "arguments": {
        "keywords": ["seo", "digital marketing", "content marketing"],
        "location_code": 2840,
        "language_code": "en"
      }
    },
    "id": 2
  }'

# Get backlinks summary
curl -X POST https://dataforseo-mcp-server-1030002812603.us-central1.run.app/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "backlinks_summary",
      "arguments": {
        "target": "example.com"
      }
    },
    "id": 3
  }'

# Get domain rank overview
curl -X POST https://dataforseo-mcp-server-1030002812603.us-central1.run.app/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "labs_google_domain_rank_overview",
      "arguments": {
        "target": "example.com",
        "location_code": 2840,
        "language_code": "en"
      }
    },
    "id": 4
  }'
```

---

## Available Tools Reference

### SERP API Tools
- `serp_google_organic_live` - Live Google organic search results
- `serp_google_maps_live` - Google Maps search results
- `serp_google_images_live` - Google Images results
- `serp_google_news_live` - Google News results
- `serp_google_shopping_live` - Google Shopping results
- `serp_google_jobs_live` - Google Jobs results
- `serp_bing_organic_live` - Bing search results
- `serp_yahoo_organic_live` - Yahoo search results
- `serp_youtube_organic_live` - YouTube search results

### Keywords API Tools
- `keywords_google_ads_search_volume` - Get search volume for keywords
- `keywords_google_ads_keywords_for_keyword` - Related keywords
- `keywords_google_ads_keywords_for_site` - Keywords for a domain
- `keywords_google_trends_explore` - Google Trends data

### Labs API Tools
- `labs_google_keyword_ideas` - Keyword ideas and suggestions
- `labs_google_related_keywords` - Related keywords analysis
- `labs_google_domain_rank_overview` - Domain ranking overview
- `labs_google_ranked_keywords` - Keywords a domain ranks for
- `labs_google_competitors_domain` - Competitor analysis
- `labs_google_bulk_keyword_difficulty` - Keyword difficulty scores

### Backlinks API Tools
- `backlinks_summary` - Backlink profile summary
- `backlinks_backlinks` - List of backlinks
- `backlinks_referring_domains` - Referring domains
- `backlinks_history` - Historical backlink data
- `backlinks_bulk_new_lost_backlinks` - Track gained/lost backlinks

### AI Optimization API Tools
- `ai_chatgpt_llm_responses_live` - Get ChatGPT responses for queries
- `ai_claude_llm_responses_live` - Get Claude AI responses
- `ai_gemini_llm_responses_live` - Get Gemini responses
- `ai_perplexity_llm_responses_live` - Get Perplexity responses
- `ai_keyword_data_search_volume_live` - AI search volume data

For a complete list of 50+ tools, call the `/tools` endpoint.

---

## Error Handling

### HTTP Errors

```javascript
try {
  const result = await client.callTool('serp_google_organic_live', args);
} catch (error) {
  if (error.response) {
    // Server responded with error status
    console.error('Status:', error.response.status);
    console.error('Data:', error.response.data);
  } else if (error.request) {
    // Request made but no response
    console.error('No response received');
  } else {
    // Other errors
    console.error('Error:', error.message);
  }
}
```

### MCP Protocol Errors

```javascript
const response = await fetch(url, options);
const data = await response.json();

if (data.error) {
  console.error('MCP Error Code:', data.error.code);
  console.error('MCP Error Message:', data.error.message);
  // Handle error appropriately
}
```

### Common Error Codes

- `-32700` - Parse error (invalid JSON)
- `-32600` - Invalid request (not JSON-RPC 2.0)
- `-32601` - Method not found
- `-32602` - Invalid params
- `-32603` - Internal error
- `500` - DataForSEO API error (check error.data for details)

---

## Best Practices

### 1. Use Connection Pooling

```javascript
// Reuse the same client instance
const client = new DataForSEOMCPClient();

// Make multiple calls with the same client
const results = await Promise.all([
  client.callTool('serp_google_organic_live', args1),
  client.callTool('keywords_google_ads_search_volume', args2),
  client.callTool('backlinks_summary', args3)
]);
```

### 2. Implement Retry Logic

```javascript
async function callWithRetry(client, toolName, args, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await client.callTool(toolName, args);
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      // Exponential backoff
      await new Promise(resolve =>
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }
}
```

### 3. Set Appropriate Timeouts

```javascript
// For long-running queries (e.g., SERP with depth=100)
const client = axios.create({
  baseURL: 'https://dataforseo-mcp-server-1030002812603.us-central1.run.app',
  timeout: 120000 // 2 minutes
});
```

### 4. Cache Results

```javascript
const cache = new Map();

async function getCachedResult(toolName, args) {
  const cacheKey = `${toolName}:${JSON.stringify(args)}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const result = await client.callTool(toolName, args);
  cache.set(cacheKey, result);

  // Clear cache after 1 hour
  setTimeout(() => cache.delete(cacheKey), 3600000);

  return result;
}
```

### 5. Monitor Health

```javascript
// Periodic health checks
setInterval(async () => {
  try {
    const health = await client.healthCheck();
    console.log('Service health:', health.status);
  } catch (error) {
    console.error('Health check failed:', error);
    // Alert or failover logic
  }
}, 60000); // Every minute
```

---

## Rate Limiting

The DataForSEO API has rate limits. Monitor your usage:

```javascript
const result = await client.callTool('serp_google_organic_live', args);

// DataForSEO returns cost information
console.log('API Cost:', result.cost);
console.log('Tasks Count:', result.tasks_count);
```

---

## Security Considerations

### Current Setup (Public Access)

The service is currently **publicly accessible** without authentication. Anyone with the URL can make requests.

### Adding Authentication (Recommended for Production)

**Option 1: API Key Authentication**

Modify your application to include an API key:

```javascript
const response = await fetch(url, {
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-secret-api-key' // Add this
  },
  ...
});
```

Then update Cloud Run to require authentication:
```bash
gcloud run services update dataforseo-mcp-server \
  --no-allow-unauthenticated \
  --region us-central1
```

**Option 2: IAM Authentication**

For service-to-service communication:

```javascript
const { GoogleAuth } = require('google-auth-library');

const auth = new GoogleAuth();
const client = await auth.getIdTokenClient(
  'https://dataforseo-mcp-server-1030002812603.us-central1.run.app'
);

const response = await client.request({
  url: 'https://dataforseo-mcp-server-1030002812603.us-central1.run.app/mcp',
  method: 'POST',
  data: mcpRequest
});
```

**Option 3: IP Whitelisting**

Restrict access to specific IP addresses using Cloud Armor (see deployment docs).

---

## Monitoring and Logging

### View Request Logs

```bash
# Stream logs in real-time
gcloud run services logs tail dataforseo-mcp-server --region us-central1

# View recent logs
gcloud logging read \
  'resource.type="cloud_run_revision" AND resource.labels.service_name="dataforseo-mcp-server"' \
  --limit 100
```

### Monitor in Your Application

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'mcp-client.log' })
  ]
});

async function callToolWithLogging(toolName, args) {
  const startTime = Date.now();

  try {
    logger.info('MCP call started', { toolName, args });

    const result = await client.callTool(toolName, args);

    const duration = Date.now() - startTime;
    logger.info('MCP call succeeded', {
      toolName,
      duration,
      cost: result.cost
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('MCP call failed', {
      toolName,
      duration,
      error: error.message
    });
    throw error;
  }
}
```

---

## Support and Resources

- **Service URL**: https://dataforseo-mcp-server-1030002812603.us-central1.run.app
- **Health Check**: https://dataforseo-mcp-server-1030002812603.us-central1.run.app/health
- **Tools List**: https://dataforseo-mcp-server-1030002812603.us-central1.run.app/tools
- **DataForSEO API Docs**: https://dataforseo.com/apis
- **Cloud Run Dashboard**: https://console.cloud.google.com/run/detail/us-central1/dataforseo-mcp-server?project=saltwater-sync

---

## Quick Reference

### Service Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check |
| `/` | GET | Service info |
| `/tools` | GET | List all tools |
| `/mcp` | POST | Execute MCP calls |

### Example Tool Calls

| Tool | Purpose | Example Args |
|------|---------|--------------|
| `serp_google_organic_live` | Google SERP | `{keyword, location_code, language_code}` |
| `keywords_google_ads_search_volume` | Search volume | `{keywords: [...], location_code, language_code}` |
| `backlinks_summary` | Backlink profile | `{target: "domain.com"}` |
| `labs_google_domain_rank_overview` | Domain ranking | `{target: "domain.com", location_code, language_code}` |

---

**Last Updated**: 2025-11-07
**Version**: 1.0.0
