import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { setupApiClient } from "./api/client.js";
import { registerSerpTools } from "./api/serp/index.js";
import { registerKeywordsTools } from "./api/keywords/index.js";
import { registerLabsTools } from "./api/labs/index.js";
import { registerBacklinksTools } from "./api/backlinks/index.js";
import { registerOnPageTools } from "./api/onpage/index.js";
import { registerDomainAnalyticsTools } from "./api/domain-analytics/index.js";
import { registerContentAnalysisTools } from "./api/content-analysis/index.js";
import { registerContentGenerationTools } from "./api/content-generation/index.js";
import { registerMerchantTools } from "./api/merchant/index.js";
import { registerAppDataTools } from "./api/app-data/index.js";
import { registerBusinessDataTools } from "./api/business-data/index.js";

async function main() {
  // Get authentication credentials from environment variables
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  
  if (!login || !password) {
    console.error("Error: DataForSEO API credentials not provided");
    console.error("Please set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD environment variables");
    process.exit(1);
  }
  
  // Setup API client
  const apiClient = setupApiClient(login, password);
  
  // Create an MCP server
  const server = new McpServer({
    name: "DataForSEO MCP Server",
    version: "1.0.0",
  });

  // Register tools for each API category
  registerSerpTools(server, apiClient);
  registerKeywordsTools(server, apiClient);
  registerLabsTools(server, apiClient);
  registerBacklinksTools(server, apiClient);
  registerOnPageTools(server, apiClient);
  registerDomainAnalyticsTools(server, apiClient);
  registerContentAnalysisTools(server, apiClient);
  registerContentGenerationTools(server, apiClient);
  registerMerchantTools(server, apiClient);
  registerAppDataTools(server, apiClient);
  registerBusinessDataTools(server, apiClient);

  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  console.error("DataForSEO MCP Server starting...");
  
  await server.connect(transport);
  console.error("DataForSEO MCP Server connected");
}

main().catch((error) => {
  console.error("Error in DataForSEO MCP Server:", error);
  process.exit(1);
});