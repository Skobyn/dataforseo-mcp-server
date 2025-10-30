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
import { registerLocalFalconTools } from "./api/localfalcon/index.js";
import { registerAiOptimizationTools } from "./api/ai-optimization/index.js";

async function main() {
  // Get authentication credentials from environment variables
  const dataForSeoLogin = process.env.DATAFORSEO_LOGIN;
  const dataForSeoPassword = process.env.DATAFORSEO_PASSWORD;
  
  if (!dataForSeoLogin || !dataForSeoPassword) {
    console.error("Error: DataForSEO API credentials not provided");
    console.error("Please set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD environment variables");
    process.exit(1);
  }
  
  // Setup API client
  const apiClient = setupApiClient(dataForSeoLogin, dataForSeoPassword);
  
  // Create an MCP server
  const server = new McpServer({
    name: "SEO Tools MCP Server",
    version: "1.0.0",
  });

  // Register tools for each DataForSEO API category
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
  registerAiOptimizationTools(server, apiClient);

  // Register third-party API tools
  
  // Local Falcon API (optional integration)
  const localFalconApiKey = process.env.LOCALFALCON_API_KEY;
  if (localFalconApiKey) {
    console.error("Local Falcon API key found - registering Local Falcon tools");
    registerLocalFalconTools(server, {
      apiKey: localFalconApiKey,
      baseUrl: process.env.LOCALFALCON_API_URL // Optional, uses default if not provided
    });
  } else {
    console.error("Local Falcon API key not found - skipping Local Falcon integration");
    console.error("To enable, set the LOCALFALCON_API_KEY environment variable");
  }
  
  // Add more third-party API integrations here
  // Example:
  // if (process.env.ANOTHER_SEO_TOOL_API_KEY) {
  //   registerAnotherSeoToolTools(server, { apiKey: process.env.ANOTHER_SEO_TOOL_API_KEY });
  // }

  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  console.error("SEO Tools MCP Server starting...");
  
  await server.connect(transport);
  console.error("SEO Tools MCP Server connected");
}

main().catch((error) => {
  console.error("Error in SEO Tools MCP Server:", error);
  process.exit(1);
});