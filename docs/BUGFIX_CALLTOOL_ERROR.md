# Bug Fix: server.callTool is not a function

## Problem

External MCP clients were receiving this error when calling tools via the HTTP bridge:

```json
{
  "error": {
    "code": -32603,
    "message": "server.callTool is not a function"
  }
}
```

## Root Cause

The HTTP bridge in `src/server-http.ts` (line 207) was attempting to call `server.callTool()` on the McpServer instance:

```typescript
const result = await (server as any).callTool(params.name, params.arguments || {});
```

However, the `@modelcontextprotocol/sdk` McpServer class doesn't expose a `callTool()` method. Tool handlers are registered internally via `server.tool()` but cannot be invoked directly through the server object.

## Solution

### 1. Enhanced Tool Registry (`src/api/tools.ts`)

Modified the `toolRegistry` to store both metadata AND handler functions:

```typescript
// Before: Only stored metadata
toolRegistry.set(name, {
  name,
  description: '',
  inputSchema: schema
});

// After: Stores metadata AND handler
toolRegistry.set(name, {
  name,
  description: '',
  inputSchema: schema,
  handler: toolHandler  // Added handler function
});
```

### 2. HTTP Bridge Tool Calling (`src/server-http.ts`)

Changed from attempting to call a non-existent method to directly invoking the handler from the registry:

```typescript
// Before: Tried to call non-existent method
const result = await (server as any).callTool(params.name, params.arguments || {});

// After: Call handler directly from registry
const tool = toolRegistry.get(params.name);
if (!tool || !tool.handler) {
  return res.status(404).json({
    jsonrpc: '2.0',
    error: { code: -32601, message: `Tool not found: ${params.name}` },
    id
  });
}

const result = await tool.handler(params.arguments || {}, {});
```

## Files Modified

1. `src/api/tools.ts` - Enhanced toolRegistry to store handlers
2. `src/server-http.ts` - Fixed tool invocation in HTTP bridge

## Testing

After the fix, rebuild the project:

```bash
npm run build
```

Then redeploy:

```bash
# For Cloud Run
gcloud run deploy dataforseo-mcp-server \
  --region=us-central1 \
  --source=. \
  --allow-unauthenticated

# Or test locally
npm run start:http
```

## Verification

Test the HTTP endpoint with a tools/call request:

```bash
curl -X POST http://localhost:8080/mcp \
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
    "id": 1
  }'
```

Expected response: JSON result with tool execution data, not an error about `callTool`.

## Impact

- ✅ HTTP bridge now properly routes tool calls
- ✅ External MCP clients can successfully invoke tools
- ✅ No breaking changes to stdio MCP server functionality
- ✅ Tool handlers are reused between stdio and HTTP transports

## Related

- MCP SDK: `@modelcontextprotocol/sdk` v1.19.1
- HTTP Server: Express.js
- JSON-RPC 2.0 protocol compliance
