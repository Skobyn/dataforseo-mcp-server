# SEO Tools MCP Server

A comprehensive stdio MCP (Model Context Protocol) server for SEO APIs. This server allows LLMs (Large Language Models) to interact with DataForSEO API functions and other SEO tools.

## Overview

The SEO Tools MCP Server enables seamless integration between LLMs like Claude and various SEO APIs, making it possible to perform SEO analysis, keyword research, backlink analysis, and many other SEO-related tasks directly through natural language interactions.

This implementation exposes all major DataForSEO API endpoints as MCP tools, which LLMs can call to retrieve specific SEO data. The server uses stdio as its transport layer, making it easy to integrate with various LLM platforms.

## Quick Start with MCP Clients

The fastest way to get started is to configure this server with your MCP client (Claude Desktop or Cursor):

### 1. Generate Configuration

After building the project, generate the MCP client configuration:

```bash
npm run build
npm run config
```

This will output ready-to-use JSON configurations for both local and npm-based setups.

### 2. Configure Your MCP Client

#### For Claude Desktop:

1. Open Claude Desktop settings
2. Navigate to the **Developer** tab
3. Edit the configuration file (`claude_desktop_config.json`)
4. Add the generated configuration to the `mcpServers` section
5. Replace `<your_login>` and `<your_password>` with your DataForSEO API credentials
6. Restart Claude Desktop

#### For Cursor:

1. Open Cursor settings
2. Navigate to the **MCP** section
3. Add the server configuration
4. Replace `<your_login>` and `<your_password>` with your DataForSEO API credentials
5. Restart Cursor

### 3. Example Configuration

Here's what your `claude_desktop_config.json` might look like:

```json
{
  "mcpServers": {
    "dataforseo": {
      "command": "node",
      "args": ["/path/to/your/project/dist/index.js"],
      "env": {
        "DATAFORSEO_LOGIN": "your_actual_login",
        "DATAFORSEO_PASSWORD": "your_actual_password"
      }
    }
  }
}
```

### 4. Template Configuration Files

This repository includes template configuration files you can copy and modify:

- **`claude_desktop_config.json`**: Basic configuration template for DataForSEO only
- **`claude_desktop_config_full.json`**: Full configuration template including Local Falcon integration

Simply copy one of these files, update the paths and credentials, and use it as your MCP client configuration.

## Features

- Comprehensive coverage of DataForSEO API endpoints
- Optional integration with Local Falcon and other third-party SEO tools
- Easy MCP client configuration with automated config generation
- Stdio transport for seamless integration
- Authentication handling
- Detailed error reporting
- Type-safe tool definitions with Zod schemas
- Extensible architecture for adding new API integrations

### Implemented API Categories

#### DataForSEO API

1. **SERP API** - Search engine results data from Google, Bing, Yahoo, and more
2. **Keywords Data API** - Keyword research, suggestions, and search volume data
3. **DataForSEO Labs API** - Advanced SEO analytics, domain comparisons, and keyword analysis
4. **Backlinks API** - Backlink profiles, referring domains, and anchor text analysis
5. **OnPage API** - Website audit, content analysis, and technical SEO checks
6. **Domain Analytics API** - Technology stack detection and domain data analysis
7. **Content Analysis API** - Content quality evaluation and semantic analysis
8. **Content Generation API** - AI-powered content generation tools
9. **Merchant API** - E-commerce data from Amazon and Google Shopping
10. **App Data API** - Mobile app data from Google Play and App Store
11. **Business Data API** - Business listing data from Google My Business, Trustpilot, and more

#### Local Falcon API (Optional)

1. **Calculate Grid Points** - Generate grid coordinates for local ranking analysis
2. **Search GMB Locations** - Find Google My Business locations by query
3. **Get Ranking at Coordinate** - Check business ranking at specific coordinates
4. **Keyword Search at Coordinate** - Test search terms at specific locations
5. **Run Grid Search** - Perform full grid-based local ranking analysis

## Installation

```bash
# Clone the repository
git clone https://github.com/Skobyn/dataforseo-mcp-server.git

# Change to the project directory
cd dataforseo-mcp-server

# Install dependencies
npm install

# Build the project
npm run build
```

## Advanced Usage

### Manual Server Execution

If you prefer to run the server manually (for development or debugging):

#### Running the Server with DataForSEO

```bash
# Set environment variables for DataForSEO authentication
export DATAFORSEO_LOGIN="your_login"
export DATAFORSEO_PASSWORD="your_password"

# Run the server
npm start
```

#### Running the Server with DataForSEO and Local Falcon

```bash
# Set environment variables for all API authentications
export DATAFORSEO_LOGIN="your_login"
export DATAFORSEO_PASSWORD="your_password"
export LOCALFALCON_API_KEY="your_localfalcon_api_key"
# Optional: Set custom Local Falcon API URL if needed
# export LOCALFALCON_API_URL="https://custom-localfalcon-url.com/api"

# Run the server
npm start
```

### Configuration Options

The server supports several configuration options through environment variables:

- **DATAFORSEO_LOGIN**: Your DataForSEO API login (required)
- **DATAFORSEO_PASSWORD**: Your DataForSEO API password (required)
- **LOCALFALCON_API_KEY**: Your Local Falcon API key (optional)
- **LOCALFALCON_API_URL**: Custom Local Falcon API URL (optional, defaults to official URL)

### MCP Client Integration

This server implements the Model Context Protocol, which allows LLMs to interact with external systems in a standardized way. The server is designed to work seamlessly with:

- **Claude Desktop**: Anthropic's desktop application
- **Cursor**: AI-powered code editor
- **Any MCP-compatible client**: Following the MCP specification

For the easiest setup, use the configuration generator as described in the Quick Start section above.

## MCP Setup Troubleshooting

### Common Issues and Solutions

#### 1. "Server not found" or "Command not found" errors

- **Cause**: Incorrect path to the server executable
- **Solution**: Use the full absolute path in the configuration, or ensure the server is published to npm for the npx approach

#### 2. "Authentication failed" errors

- **Cause**: Invalid or missing DataForSEO API credentials
- **Solution**:
  - Verify your credentials at [DataForSEO Dashboard](https://dataforseo.com/dashboard)
  - Ensure there are no extra spaces or characters in your credentials
  - Check that your account has sufficient credits

#### 3. "Local Falcon" tools not appearing

- **Cause**: Local Falcon API key not configured or invalid
- **Solution**:
  - Add your Local Falcon API key to the environment variables
  - Verify the API key at [Local Falcon](https://www.localfalcon.com/)

#### 4. Server appears to start but tools don't load

- **Cause**: MCP client might not be properly configured or needs restart
- **Solution**:
  - Restart your MCP client (Claude Desktop/Cursor) completely
  - Check that the JSON configuration is valid (use a JSON validator)
  - Ensure the server process can actually start by running it manually first

### Detailed MCP Client Setup

#### Claude Desktop Configuration Location

The Claude Desktop configuration file is typically located at:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

Create the file if it doesn't exist, and ensure it follows this structure:

```json
{
  "mcpServers": {
    "dataforseo": {
      "command": "node",
      "args": ["/full/path/to/your/project/dist/index.js"],
      "env": {
        "DATAFORSEO_LOGIN": "your_actual_login",
        "DATAFORSEO_PASSWORD": "your_actual_password",
        "LOCALFALCON_API_KEY": "your_localfalcon_key"
      }
    },
    "other_servers": {
      "// You can add other MCP servers here": ""
    }
  }
}
```

#### Testing Your Setup

1. **Test the server manually first**:

   ```bash
   DATAFORSEO_LOGIN=your_login DATAFORSEO_PASSWORD=your_password node dist/index.js
   ```

2. **Check server logs**: The server outputs useful debugging information to stderr, which helps identify configuration issues.

3. **Verify in your MCP client**: Look for the server name in your client's available tools or extensions list.

## Development

```bash
# Run in development mode with hot reloading
npm run dev
```

## Examples

Check out the `examples` directory for sample code showing how to use the SEO Tools MCP Server.

The basic example demonstrates:

- Starting the server
- Connecting to it from a client
- Making calls to different API endpoints
- Handling the results

## Available Tools

The server exposes hundreds of tools across all integrated API categories. Below are some examples of the most commonly used tools:

### DataForSEO SERP API Tools

- `serp_google_organic_live` - Get Google organic search results
- `serp_google_organic_task_post` - Create a Google organic search task
- `serp_google_maps_live` - Get Google Maps search results

### DataForSEO Keywords Data Tools

- `keywords_google_ads_search_volume` - Get search volume for keywords
- `keywords_google_ads_keywords_for_site` - Get keyword suggestions for a domain
- `keywords_google_trends_explore` - Explore keyword trends over time

### DataForSEO Labs Tools

- `labs_google_keyword_ideas` - Get keyword ideas based on seed keywords
- `labs_google_related_keywords` - Get related keywords
- `labs_google_domain_rank_overview` - Get domain ranking overview

### DataForSEO Backlinks Tools

- `backlinks_summary` - Get a summary of a domain's backlink profile
- `backlinks_backlinks` - Get a list of backlinks for a domain
- `backlinks_referring_domains` - Get referring domains for a target

### Local Falcon Tools (If Configured)

- `localfalcon_calculate_grid_points` - Calculate grid points around a base coordinate
- `localfalcon_search_gmb_locations` - Search for Google My Business locations
- `localfalcon_get_ranking_at_coordinate` - Get business ranking at specific coordinate
- `localfalcon_keyword_search_at_coordinate` - Search keywords at a specific location
- `localfalcon_run_grid_search` - Run a full grid search for local rankings

### Complete Tool List

For a complete list of all available tools and their parameters, check the implementation in the `src/api` directory.

## Extending the Server

The server is designed to be extensible. To add support for additional SEO APIs:

1. Create a new directory in `src/api/` for your integration
2. Implement client handling and tool registration
3. Add your integration to `src/index.ts`
4. Add environment variable handling for authentication

See the Local Falcon integration in `src/api/localfalcon/` for a template.

## License

MIT
