# OpenAI MCP Integration Guide

## Service URL for OpenAI
```
https://dataforseo-mcp-server-1030002812603.us-central1.run.app/sse
```

---

## How to Add to OpenAI

### In ChatGPT (Web or App)

1. **Open ChatGPT Settings**
   - Click your profile icon
   - Go to **Settings**
   - Select **Beta Features** or **Integrations**

2. **Add MCP Server**
   - Look for "Model Context Protocol" or "MCP Servers"
   - Click **Add Server** or **Connect**

3. **Enter Server Details**
   ```
   Name: DataForSEO MCP Server
   URL: https://dataforseo-mcp-server-1030002812603.us-central1.run.app/sse
   Authentication: None (currently unauthenticated)
   ```

4. **Test Connection**
   - OpenAI will attempt to connect via SSE
   - Should show "Connected" with 50+ tools available

### In OpenAI API (Custom Integration)

If you're building a custom app with OpenAI's API:

```javascript
// OpenAI expects SSE endpoint for MCP
const mcpServerUrl = 'https://dataforseo-mcp-server-1030002812603.us-central1.run.app/sse';

// Add to your OpenAI client configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // MCP configuration
  mcpServers: [{
    name: 'dataforseo',
    url: mcpServerUrl,
    transport: 'sse'
  }]
});
```

---

## Available Endpoints

Your MCP server now has **4 endpoints**:

| Endpoint | Purpose | Client |
|----------|---------|--------|
| `GET /sse` | Server-Sent Events stream | **OpenAI** |
| `POST /mcp` | JSON-RPC 2.0 requests | Custom apps |
| `GET /tools` | List all tools | Testing |
| `GET /health` | Health check | Monitoring |

---

## Testing SSE Endpoint

### Using cURL (will stream events)

```bash
curl -N https://dataforseo-mcp-server-1030002812603.us-central1.run.app/sse
```

This will keep the connection open and stream MCP events.

### Using JavaScript EventSource

```javascript
const eventSource = new EventSource('https://dataforseo-mcp-server-1030002812603.us-central1.run.app/sse');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('MCP Event:', data);
};

eventSource.onerror = (error) => {
  console.error('SSE Error:', error);
};
```

---

## OpenAI Configuration Examples

### Option 1: Simple Configuration

```
Server Name: DataForSEO
Server URL: https://dataforseo-mcp-server-1030002812603.us-central1.run.app/sse
Authentication: None
```

### Option 2: With Custom Headers (if you add auth later)

```
Server Name: DataForSEO
Server URL: https://dataforseo-mcp-server-1030002812603.us-central1.run.app/sse
Authentication: Custom
Headers:
  X-API-Key: your-api-key-here
```

---

## Troubleshooting OpenAI Connection

### Issue: "Unable to load tools"

**Possible Causes:**
1. SSE endpoint not responding
2. CORS headers missing
3. Network/firewall blocking SSE

**Solutions:**

1. **Test SSE endpoint manually:**
```bash
curl -N https://dataforseo-mcp-server-1030002812603.us-central1.run.app/sse
```

2. **Check Cloud Run logs:**
```bash
gcloud run services logs tail dataforseo-mcp-server --region us-central1
```

3. **Verify service is running:**
```bash
curl https://dataforseo-mcp-server-1030002812603.us-central1.run.app/health
```

### Issue: "Authentication failed"

Currently set to **no authentication**. If you see auth errors:

1. Make sure "Authentication" is set to "None" in OpenAI
2. Or leave the authentication fields blank

### Issue: Connection drops

SSE connections can timeout. The server sends heartbeats every 30 seconds to keep alive.

If connection drops frequently:
```bash
# Increase timeout
gcloud run services update dataforseo-mcp-server \
  --timeout 900s \
  --region us-central1
```

---

## What OpenAI Will See

Once connected, OpenAI will have access to **50+ DataForSEO tools**:

### SERP Tools
- Google Organic, Maps, Images, Shopping, News, Jobs
- Bing, Yahoo, YouTube, Baidu search results

### Keyword Research
- Search volume data
- Keyword suggestions and ideas
- Google Trends analysis
- Keyword difficulty scores

### Domain Analysis
- Domain rank overview
- Ranked keywords for domains
- Competitor analysis
- Traffic estimation

### Backlinks
- Backlink profiles
- Referring domains
- Historical backlink data
- New/lost backlinks tracking

### AI Optimization
- ChatGPT, Claude, Gemini, Perplexity response data
- AI keyword search volumes
- LLM-specific analytics

---

## Using with OpenAI API (Programmatic)

If OpenAI provides MCP configuration in their API:

```javascript
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  mcpServers: [{
    name: 'dataforseo',
    url: 'https://dataforseo-mcp-server-1030002812603.us-central1.run.app/sse',
    description: 'DataForSEO SEO API tools'
  }]
});

const openai = new OpenAIApi(configuration);

// OpenAI will now be able to call DataForSEO tools
const response = await openai.createChatCompletion({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'What is the search volume for "seo tools"?' }],
  tools: 'auto' // Let OpenAI choose which MCP tools to use
});
```

---

## Monitoring OpenAI Usage

### View SSE Connections in Logs

```bash
# Stream logs to see OpenAI connections
gcloud run services logs tail dataforseo-mcp-server --region us-central1

# Look for:
# - "SSE connection established"
# - "SSE connection closed by client"
# - Tool call logs
```

### Track API Usage

DataForSEO API calls are logged. Check Cloud Run logs to see:
- Which tools OpenAI is calling
- API costs per request
- Response times

---

## Quick Reference

**For OpenAI ChatGPT Settings:**
```
Name: DataForSEO MCP Server
URL: https://dataforseo-mcp-server-1030002812603.us-central1.run.app/sse
Auth: None
```

**Test SSE Connection:**
```bash
curl -N https://dataforseo-mcp-server-1030002812603.us-central1.run.app/sse
```

**View Logs:**
```bash
gcloud run services logs tail dataforseo-mcp-server --region us-central1
```

---

## Next Steps

1. Add the server in OpenAI settings using the SSE URL above
2. Test with a query like "What's the search volume for 'AI tools'?"
3. Monitor logs to see OpenAI making tool calls
4. Add Local Falcon API when ready (just update secrets and redeploy)

---

**SSE Endpoint**: https://dataforseo-mcp-server-1030002812603.us-central1.run.app/sse
**Status**: Live and ready for OpenAI integration
