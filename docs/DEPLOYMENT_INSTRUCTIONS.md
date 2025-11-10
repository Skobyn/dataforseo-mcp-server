# Deployment Instructions After Bug Fix

## What Was Fixed

The HTTP MCP server was throwing `"server.callTool is not a function"` error because it tried to call a non-existent method on the McpServer instance.

### Root Cause
- HTTP bridge (`src/server-http.ts:207`) attempted `server.callTool()`
- MCP SDK doesn't expose this method
- Tool handlers are registered internally but not callable via server object

### Solution Applied
1. **Modified `src/api/tools.ts`**: Enhanced `toolRegistry` to store both metadata AND handler functions
2. **Modified `src/server-http.ts`**: Changed to call handlers directly from registry instead of through server

## Files Changed
- `src/api/tools.ts` - Store tool handlers in registry
- `src/server-http.ts` - Call handlers directly from registry
- Build output: `dist/` directory regenerated

## Deployment Steps

### 1. Prerequisites Check

```bash
# Ensure you're in the project directory
cd /mnt/c/Dev/dataforseo-mcp-server/dataforseo-mcp-server

# Verify the build is current
ls -la dist/server-http.js
# Should show timestamp: Nov 10 17:08 (or current time)
```

### 2. Option A: Deploy to Google Cloud Run (Recommended)

```bash
# Deploy with environment variables
gcloud run deploy dataforseo-mcp-server \
  --region=us-central1 \
  --source=. \
  --allow-unauthenticated \
  --set-env-vars="DATAFORSEO_LOGIN=your_login,DATAFORSEO_PASSWORD=your_password"

# OR with Secret Manager (more secure)
gcloud run deploy dataforseo-mcp-server \
  --region=us-central1 \
  --source=. \
  --allow-unauthenticated \
  --set-secrets="DATAFORSEO_LOGIN=dataforseo-login:latest,DATAFORSEO_PASSWORD=dataforseo-password:latest"
```

### 3. Option B: Test Locally First

```bash
# Set credentials
export DATAFORSEO_LOGIN="your_login"
export DATAFORSEO_PASSWORD="your_password"

# Start HTTP server
npm run start:http

# In another terminal, test it
curl -X POST http://localhost:8080/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'
```

### 4. Verify Deployment

After deployment, test the endpoint:

```bash
# Get your Cloud Run URL
SERVICE_URL=$(gcloud run services describe dataforseo-mcp-server \
  --region=us-central1 \
  --format='value(status.url)')

# Test health endpoint
curl $SERVICE_URL/health

# Test tools/list
curl -X POST $SERVICE_URL/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'

# Test actual tool call
curl -X POST $SERVICE_URL/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "dataforseo_serp_google",
      "arguments": {
        "keyword": "test",
        "location_name": "United States"
      }
    },
    "id": 2
  }'
```

### 5. Monitor Logs

```bash
# View recent logs
gcloud run services logs read dataforseo-mcp-server \
  --region=us-central1 \
  --limit=50

# Follow logs in real-time
gcloud run services logs tail dataforseo-mcp-server \
  --region=us-central1
```

## Expected Behavior After Fix

### Before (Error)
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32603,
    "message": "server.callTool is not a function"
  },
  "id": 1
}
```

### After (Success)
```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{...actual tool response data...}"
      }
    ]
  },
  "id": 1
}
```

## Troubleshooting

### Issue: Still getting callTool error
**Solution**: Ensure you deployed the LATEST build
```bash
# Verify build timestamp
ls -la dist/server-http.js
# Should be recent, not Nov 7
```

### Issue: Missing credentials error
**Solution**: Set environment variables or secrets
```bash
# For Cloud Run
gcloud run services update dataforseo-mcp-server \
  --region=us-central1 \
  --set-env-vars="DATAFORSEO_LOGIN=xxx,DATAFORSEO_PASSWORD=yyy"
```

### Issue: Tool not found
**Solution**: Check tool name in request matches registered tools
```bash
# List all available tools
curl -X POST $SERVICE_URL/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}'
```

## Additional Resources

- Bug fix details: See `docs/BUGFIX_CALLTOOL_ERROR.md`
- MCP Protocol: https://modelcontextprotocol.io/
- DataForSEO API: https://dataforseo.com/apis
- Cloud Run docs: https://cloud.google.com/run/docs

## Support

If you encounter issues:
1. Check deployment logs: `gcloud run services logs read dataforseo-mcp-server --region=us-central1`
2. Verify credentials are set correctly
3. Test locally first with `npm run start:http`
4. Ensure build is up-to-date with `npm run build`
