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

// Utility function to print a ready-to-use MCP configuration snippet for
// Claude Desktop and Cursor. This allows users to copy/paste the JSON
// directly into the respective config files instead of typing it manually.
function printConfigSnippet() {
  /* eslint-disable no-console */

  // Local installation configuration
  const localConfig = {
    mcpServers: {
      dataforseo: {
        command: "node",
        args: [process.cwd() + "/dist/index.js"],
        env: {
          DATAFORSEO_LOGIN: "<your_login>",
          DATAFORSEO_PASSWORD: "<your_password>",
          // Uncomment the following lines if you plan to use Local Falcon as well
          // LOCALFALCON_API_KEY: "<your_localfalcon_api_key>",
          // Optionally override the default Local Falcon API URL
          // LOCALFALCON_API_URL: "https://custom-localfalcon-url.com/api"
        },
      },
    },
  };

  // NPM package configuration (if published)
  const npmConfig = {
    mcpServers: {
      dataforseo: {
        command: "npx",
        args: ["-y", "dataforseo-mcp-server"],
        env: {
          DATAFORSEO_LOGIN: "<your_login>",
          DATAFORSEO_PASSWORD: "<your_password>",
          // Uncomment the following lines if you plan to use Local Falcon as well
          // LOCALFALCON_API_KEY: "<your_localfalcon_api_key>",
          // Optionally override the default Local Falcon API URL
          // LOCALFALCON_API_URL: "https://custom-localfalcon-url.com/api"
        },
      },
    },
  };

  console.log("=".repeat(80));
  console.log("MCP CLIENT CONFIGURATION FOR DATAFORSEO SERVER");
  console.log("=".repeat(80));
  console.log("");
  console.log(
    "Copy one of the JSON configurations below and paste it into your MCP client:"
  );
  console.log("");
  console.log("For Claude Desktop:");
  console.log("  - Open Claude Desktop settings");
  console.log("  - Navigate to the Developer tab");
  console.log("  - Edit the configuration file (claude_desktop_config.json)");
  console.log("  - Add the configuration to the 'mcpServers' section");
  console.log("");
  console.log("For Cursor:");
  console.log("  - Open Cursor settings");
  console.log("  - Navigate to the MCP section");
  console.log("  - Add the server configuration");
  console.log("");
  console.log("OPTION 1: Local Installation (Current Setup)");
  console.log("=".repeat(50));
  console.log(JSON.stringify(localConfig, null, 2));
  console.log("");
  console.log("OPTION 2: NPM Package (Global Installation)");
  console.log("=".repeat(50));
  console.log(JSON.stringify(npmConfig, null, 2));
  console.log("");
  console.log("=".repeat(80));
  console.log("IMPORTANT SETUP NOTES:");
  console.log("=".repeat(80));
  console.log(
    "1. Replace <your_login> and <your_password> with your DataForSEO API credentials"
  );
  console.log(
    "2. Optionally uncomment Local Falcon configuration if you have an API key"
  );
  console.log(
    "3. For Option 1: Ensure this server is built (npm run build) and paths are correct"
  );
  console.log(
    "4. For Option 2: The package must be published to npm registry first"
  );
  console.log("");
  console.log(
    "After configuration, restart your MCP client to load the server."
  );
  console.log("=".repeat(80));
  console.log("");

  process.exit(0);
}

// If the user only wants the config snippet, print it and exit early. We check
// for both long and short flags so it is ergonomic (`--config` or `--config-snippet`).
if (
  process.argv.includes("--config") ||
  process.argv.includes("--config-snippet")
) {
  printConfigSnippet();
}

async function main() {
  // Get authentication credentials from environment variables
  const dataForSeoLogin = process.env.DATAFORSEO_LOGIN;
  const dataForSeoPassword = process.env.DATAFORSEO_PASSWORD;

  if (!dataForSeoLogin || !dataForSeoPassword) {
    console.error("Error: DataForSEO API credentials not provided");
    console.error(
      "Please set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD environment variables"
    );
    process.exit(1);
  }

  // Setup API client
  const apiClient = setupApiClient(dataForSeoLogin, dataForSeoPassword);

  // Expose the API client globally so it can be retrieved inside generic
  // tool handlers without relying on SDK-specific context extensions.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  globalThis.__dataForSeoClient = apiClient;

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

  // Register third-party API tools

  // Local Falcon API (optional integration)
  const localFalconApiKey = process.env.LOCALFALCON_API_KEY;
  if (localFalconApiKey) {
    console.error(
      "Local Falcon API key found - registering Local Falcon tools"
    );
    registerLocalFalconTools(server, {
      apiKey: localFalconApiKey,
      baseUrl: process.env.LOCALFALCON_API_URL, // Optional, uses default if not provided
    });
  } else {
    console.error(
      "Local Falcon API key not found - skipping Local Falcon integration"
    );
    console.error(
      "To enable, set the LOCALFALCON_API_KEY environment variable"
    );
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
