# DataForSEO MCP Server - GCP Deployment Plan

## Project Analysis

### Current Architecture
- **Type**: MCP (Model Context Protocol) Server
- **Transport**: stdio (stdin/stdout communication)
- **Runtime**: Node.js 20+ with TypeScript
- **APIs Integrated**:
  - DataForSEO (12 API categories: SERP, Keywords, Labs, Backlinks, OnPage, Domain Analytics, Content Analysis, Content Generation, Merchant, App Data, Business Data, AI Optimization)
  - Local Falcon (optional)

### Current Limitations
⚠️ **Critical**: This is a stdio-based MCP server designed for local use with Claude Desktop or similar clients. It communicates via stdin/stdout, NOT HTTP.

**For GCP deployment, we need to**:
1. Wrap the stdio server in an HTTP interface
2. Support both HTTP (for web clients) and stdio (for compatibility)
3. Ensure proper authentication and security

---

## Deployment Strategy

### Option 1: Cloud Run with HTTP Wrapper (RECOMMENDED)

**Pros**:
- Serverless, auto-scaling
- Pay-per-request pricing
- Managed infrastructure
- HTTPS out of the box
- Easy to deploy and update

**Cons**:
- Requires HTTP wrapper implementation
- Cold starts (mitigated with min instances)

### Option 2: GKE (For High Traffic)

**Pros**:
- Full control over infrastructure
- No cold starts
- Better for high, consistent traffic
- Advanced networking options

**Cons**:
- More expensive
- Requires more management
- Overkill for most use cases

### Option 3: Cloud Functions (NOT RECOMMENDED)

**Cons**:
- Limited execution time (60s default, 540s max)
- Not suitable for long-running MCP operations

---

## Recommended Architecture: Cloud Run + HTTP Wrapper

### Architecture Diagram

```
┌─────────────────┐
│   Client        │
│  (Claude API,   │
│   Web App, etc) │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────────────────────────────┐
│   Google Cloud Load Balancer            │
│   (Optional - for multi-region)         │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│   Cloud Run Service                     │
│   ┌─────────────────────────────────┐   │
│   │  HTTP Wrapper (Express.js)      │   │
│   │  ├─ POST /mcp (MCP requests)    │   │
│   │  ├─ GET /health (health check)  │   │
│   │  └─ GET /tools (list tools)     │   │
│   └──────────┬──────────────────────┘   │
│              │                           │
│   ┌──────────▼──────────────────────┐   │
│   │  DataForSEO MCP Server          │   │
│   │  (stdio → internal adapter)     │   │
│   └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│   Secret Manager                        │
│   - DATAFORSEO_LOGIN                    │
│   - DATAFORSEO_PASSWORD                 │
│   - LOCALFALCON_API_KEY (optional)      │
└─────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: HTTP Wrapper Implementation ✅ (Files to Create)

Create `src/server-http.ts` - HTTP wrapper for Cloud Run:

```typescript
import express from 'express';
import { spawn } from 'child_process';

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// List available tools
app.get('/tools', (req, res) => {
  // Return metadata about available MCP tools
  res.json({ tools: [...] });
});

// Main MCP endpoint
app.post('/mcp', async (req, res) => {
  // Spawn MCP process and communicate via stdio
  // Handle request/response
});

app.listen(port, () => {
  console.log(`MCP HTTP server on port ${port}`);
});
```

**Dependencies to Add**:
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "@types/express": "^4.17.21"
  }
}
```

### Phase 2: Containerization ✅ (Dockerfile)

Create production-ready Dockerfile:

```dockerfile
FROM node:20-slim AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-slim

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

# Non-root user for security
RUN useradd -m -u 1001 mcp
USER mcp

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD node -e "require('http').get('http://localhost:8080/health',(r)=>{process.exit(r.statusCode===200?0:1)})"

CMD ["node", "dist/server-http.js"]
```

### Phase 3: Environment Configuration ✅

Create `.env.example`:

```bash
# Required: DataForSEO API Credentials
DATAFORSEO_LOGIN=your_dataforseo_login
DATAFORSEO_PASSWORD=your_dataforseo_password

# Optional: Local Falcon API
LOCALFALCON_API_KEY=your_localfalcon_api_key
LOCALFALCON_API_URL=https://api.localfalcon.com

# GCP Configuration
PORT=8080
NODE_ENV=production

# Optional: Performance tuning
MAX_CONCURRENT_REQUESTS=100
REQUEST_TIMEOUT=30000
```

Create `.env.yaml` for Cloud Run:

```yaml
DATAFORSEO_LOGIN: ${DATAFORSEO_LOGIN}
DATAFORSEO_PASSWORD: ${DATAFORSEO_PASSWORD}
LOCALFALCON_API_KEY: ${LOCALFALCON_API_KEY}
PORT: "8080"
NODE_ENV: production
```

### Phase 4: GCP Deployment Configuration ✅

Create `deploy/cloud-run.yaml`:

```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: dataforseo-mcp-server
  labels:
    cloud.googleapis.com/location: us-central1
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/minScale: '1'
        autoscaling.knative.dev/maxScale: '100'
        run.googleapis.com/execution-environment: gen2
        run.googleapis.com/cpu-boost: 'true'
    spec:
      containerConcurrency: 80
      timeoutSeconds: 300
      serviceAccountName: dataforseo-mcp@PROJECT_ID.iam.gserviceaccount.com
      containers:
      - image: us-central1-docker.pkg.dev/PROJECT_ID/mcp-servers/dataforseo-mcp-server:latest
        ports:
        - name: http1
          containerPort: 8080
        env:
        - name: PORT
          value: '8080'
        - name: NODE_ENV
          value: production
        resources:
          limits:
            cpu: '2'
            memory: 1Gi
        startupProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 0
          periodSeconds: 3
          failureThreshold: 3
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          periodSeconds: 10
```

### Phase 5: CI/CD Pipeline ✅

Create `.github/workflows/deploy-gcp.yaml`:

```yaml
name: Deploy to GCP Cloud Run

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  SERVICE_NAME: dataforseo-mcp-server
  REGION: us-central1

jobs:
  deploy:
    runs-on: ubuntu-latest

    permissions:
      contents: read
      id-token: write

    steps:
      - uses: actions/checkout@v4

      - name: Authenticate to GCP
        uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: ${{ secrets.WIF_PROVIDER }}
          service_account: ${{ secrets.WIF_SERVICE_ACCOUNT }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Build and Deploy
        run: |
          gcloud run deploy $SERVICE_NAME \
            --source . \
            --region $REGION \
            --platform managed \
            --allow-unauthenticated \
            --memory 1Gi \
            --cpu 2 \
            --min-instances 1 \
            --max-instances 100 \
            --timeout 300s \
            --set-secrets="DATAFORSEO_LOGIN=dataforseo-login:latest,DATAFORSEO_PASSWORD=dataforseo-password:latest,LOCALFALCON_API_KEY=localfalcon-api-key:latest"

      - name: Get Service URL
        run: |
          SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
            --region $REGION \
            --format='value(status.url)')
          echo "Service deployed to: $SERVICE_URL"

      - name: Test Deployment
        run: |
          curl -f $SERVICE_URL/health
```

---

## Deployment Steps

### Step 1: Setup GCP Project

```bash
# 1. Set project ID
export PROJECT_ID="your-gcp-project-id"
gcloud config set project $PROJECT_ID

# 2. Enable required APIs
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com

# 3. Create service account
gcloud iam service-accounts create dataforseo-mcp \
  --display-name="DataForSEO MCP Server"

# 4. Grant permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:dataforseo-mcp@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Step 2: Store Secrets

```bash
# Create secrets in Secret Manager
echo -n "your_dataforseo_login" | \
  gcloud secrets create dataforseo-login --data-file=-

echo -n "your_dataforseo_password" | \
  gcloud secrets create dataforseo-password --data-file=-

echo -n "your_localfalcon_api_key" | \
  gcloud secrets create localfalcon-api-key --data-file=-

# Grant service account access to secrets
for SECRET in dataforseo-login dataforseo-password localfalcon-api-key; do
  gcloud secrets add-iam-policy-binding $SECRET \
    --member="serviceAccount:dataforseo-mcp@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
done
```

### Step 3: Build and Deploy

```bash
# Using the GCP MCP Deploy skill we just created!
cd /path/to/dataforseo-mcp-server

# Deploy to Cloud Run
.claude/skills/gcp-mcp-deploy/scripts/deploy.sh \
  --service-name dataforseo-mcp-server \
  --source . \
  --platform cloud-run \
  --region us-central1 \
  --memory 1Gi \
  --cpu 2 \
  --min-instances 1 \
  --max-instances 100 \
  --timeout 300s \
  --set-secrets="DATAFORSEO_LOGIN=dataforseo-login:latest,DATAFORSEO_PASSWORD=dataforseo-password:latest,LOCALFALCON_API_KEY=localfalcon-api-key:latest"
```

### Step 4: Verify Deployment

```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe dataforseo-mcp-server \
  --region us-central1 \
  --format='value(status.url)')

# Test health endpoint
curl $SERVICE_URL/health

# Test MCP endpoint (requires authentication)
curl -X POST $SERVICE_URL/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(gcloud auth print-identity-token)" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

---

## Security Considerations

### 1. Authentication & Authorization

**Implement API Key Authentication**:
- Add custom API key validation in HTTP wrapper
- Store allowed API keys in Secret Manager
- Validate on every request

**IAM-based Authentication**:
- Use Cloud Run IAM for service-to-service calls
- Require valid identity tokens

### 2. Rate Limiting

Implement rate limiting to prevent abuse:

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/mcp', limiter);
```

### 3. Input Validation

- Validate all MCP requests against JSON-RPC 2.0 spec
- Sanitize inputs before passing to DataForSEO API
- Implement request size limits

### 4. Secret Management

✅ Use Secret Manager (not environment variables in code)
✅ Rotate secrets regularly
✅ Audit secret access

---

## Cost Estimation

### Cloud Run Pricing (us-central1)

**Assumptions**:
- Average request duration: 2 seconds
- Memory: 1GB
- CPU: 2 vCPU
- Requests per month: 100,000
- Min instances: 1

**Estimated Monthly Cost**:
- **Requests**: $0.40 per million requests = $0.04
- **CPU time**: 100,000 × 2s × 2 vCPU × $0.00002400 = $9.60
- **Memory**: 100,000 × 2s × 1GB × $0.00000250 = $0.50
- **Min instance (idle)**: ~$30/month
- **Total**: ~$40/month

**Cost Optimization**:
- Set min-instances to 0 if cold starts acceptable (save ~$30/mo)
- Use CPU boost for faster cold starts
- Scale down during off-hours with Cloud Scheduler

---

## Monitoring & Logging

### Cloud Logging Queries

```bash
# View all logs
gcloud logging read \
  'resource.type="cloud_run_revision" AND resource.labels.service_name="dataforseo-mcp-server"' \
  --limit 100

# Error logs only
gcloud logging read \
  'resource.type="cloud_run_revision" AND severity>=ERROR' \
  --limit 50

# Stream logs in real-time
gcloud run services logs tail dataforseo-mcp-server --region us-central1
```

### Cloud Monitoring Alerts

Set up alerts for:
- Error rate > 5%
- P95 latency > 5 seconds
- Instance count > 80 (approaching max)
- DataForSEO API failures

---

## Performance Optimization

### 1. Connection Pooling
- Reuse HTTP connections to DataForSEO API
- Implement connection pooling in API client

### 2. Caching
- Cache frequently requested data (keyword search volume, etc.)
- Use Cloud Memorystore (Redis) for distributed caching
- Set appropriate TTLs based on data freshness requirements

### 3. Request Batching
- Batch multiple MCP requests when possible
- Leverage DataForSEO batch endpoints

### 4. Async Processing
- For long-running tasks, return task ID immediately
- Process in background
- Provide status endpoint for polling

---

## Disaster Recovery

### Backup Strategy
1. **Configuration**: Store all configs in version control (Git)
2. **Secrets**: Secret Manager has built-in versioning
3. **Logs**: Export logs to Cloud Storage for long-term retention

### Multi-Region Deployment

For high availability, deploy to multiple regions:

```bash
REGIONS=("us-central1" "europe-west1" "asia-northeast1")

for region in "${REGIONS[@]}"; do
  gcloud run deploy dataforseo-mcp-server \
    --source . \
    --region "$region" \
    --platform managed
done

# Setup global load balancer
gcloud compute backend-services create dataforseo-mcp-backend \
  --global \
  --load-balancing-scheme=EXTERNAL_MANAGED
```

---

## Testing Plan

### Local Testing
```bash
# Build Docker image
docker build -t dataforseo-mcp-server:test .

# Run locally
docker run -p 8080:8080 \
  -e DATAFORSEO_LOGIN=your_login \
  -e DATAFORSEO_PASSWORD=your_password \
  dataforseo-mcp-server:test

# Test endpoints
curl http://localhost:8080/health
curl -X POST http://localhost:8080/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

### Integration Testing
- Test all DataForSEO API endpoints
- Verify Local Falcon integration
- Load testing with 1000+ concurrent requests
- Error handling and recovery

---

## Rollback Plan

If deployment fails:

```bash
# List revisions
gcloud run revisions list \
  --service dataforseo-mcp-server \
  --region us-central1

# Rollback to previous revision
gcloud run services update-traffic dataforseo-mcp-server \
  --to-revisions PREVIOUS_REVISION=100 \
  --region us-central1
```

---

## Next Steps

1. ✅ Create HTTP wrapper (`src/server-http.ts`)
2. ✅ Create Dockerfile
3. ✅ Update package.json with new dependencies
4. ✅ Create deployment scripts
5. ✅ Setup GCP project and secrets
6. ✅ Test locally with Docker
7. ✅ Deploy to Cloud Run
8. ✅ Setup monitoring and alerts
9. ✅ Configure CI/CD pipeline
10. ✅ Performance testing and optimization

---

## Support & Documentation

- **GCP Cloud Run Docs**: https://cloud.google.com/run/docs
- **MCP Protocol**: https://modelcontextprotocol.io
- **DataForSEO API**: https://dataforseo.com/apis
- **This Deployment Skill**: `.claude/skills/gcp-mcp-deploy/SKILL.md`

---

**Estimated Time to Deploy**: 2-3 hours (including testing)
**Skill Level Required**: Intermediate (GCP + Node.js knowledge)
**Recommended Deployment**: Cloud Run with min-instances=1 for production
