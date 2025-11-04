# SEO Tools MCP Server

[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/skobyn-dataforseo-mcp-server-badge.png)](https://mseep.ai/app/skobyn-dataforseo-mcp-server)

A comprehensive stdio MCP (Model Context Protocol) server for SEO APIs. This server allows LLMs (Large Language Models) to interact with DataForSEO API functions and other SEO tools.

<a href="https://glama.ai/mcp/servers/@Skobyn/dataforseo-mcp-server">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@Skobyn/dataforseo-mcp-server/badge" alt="SEO Tools Server MCP server" />
</a>

## Overview

The SEO Tools MCP Server enables seamless integration between LLMs like Claude and various SEO APIs, making it possible to perform SEO analysis, keyword research, backlink analysis, and many other SEO-related tasks directly through natural language interactions.

This implementation exposes all major DataForSEO API endpoints as MCP tools, which LLMs can call to retrieve specific SEO data. The server uses stdio as its transport layer, making it easy to integrate with various LLM platforms.

## Features

- Comprehensive coverage of DataForSEO API endpoints
- Optional integration with Local Falcon and other third-party SEO tools
- Stdio transport for easy integration
- Authentication handling
- Detailed error reporting
- Type-safe tool definitions with Zod schemas
- Extensible architecture for adding new API integrations

# Sign up for Data for Seo

https://dataforseo.com/?aff=200885

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
12. **AI Optimization API** - LLM responses, AI scraper, and AI keyword data from ChatGPT, Claude, Gemini, and Perplexity

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

## Usage

To use this MCP server, you need API credentials for the services you want to use.

### Running the Server with DataForSEO

```bash
# Set environment variables for DataForSEO authentication
export DATAFORSEO_LOGIN="your_login"
export DATAFORSEO_PASSWORD="your_password"

# Run the server
npm start
```

### Running the Server with DataForSEO and Local Falcon

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

### Using with Claude or other LLMs

This server implements the Model Context Protocol, which allows LLMs to interact with external systems in a standardized way. To use it with Claude, you'll need to integrate it with your LLM platform according to their specific MCP implementation.

See the examples directory for usage examples.

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
- `backlinks_history` - Get historical backlink data for a target
- `backlinks_timeseries_summary` - Get time series data on backlinks
- `backlinks_bulk_new_lost_backlinks` - Get new and lost backlinks for multiple targets
- `backlinks_bulk_new_lost_referring_domains` - Get new and lost referring domains for multiple targets
- `backlinks_bulk_pages_summary` - Get page summaries for multiple targets

### DataForSEO AI Optimization Tools
- `ai_chatgpt_models` - Get list of available ChatGPT models
- `ai_chatgpt_llm_responses_live` - Get live responses from ChatGPT
- `ai_chatgpt_scraper_locations` - Get available locations for ChatGPT scraper
- `ai_chatgpt_scraper_languages` - Get available languages for ChatGPT scraper
- `ai_claude_models` - Get list of available Claude models
- `ai_claude_llm_responses_live` - Get live responses from Claude
- `ai_gemini_models` - Get list of available Gemini models
- `ai_gemini_llm_responses_live` - Get live responses from Gemini
- `ai_perplexity_models` - Get list of available Perplexity models
- `ai_perplexity_llm_responses_live` - Get live responses from Perplexity
- `ai_keyword_data_search_volume_live` - Get AI keyword search volume data
- `ai_keyword_data_locations_and_languages` - Get available locations and languages for AI keyword data

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