import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DataForSeoClient } from "../client.js";
import { registerTool } from "../tools.js";
import { DataForSeoResponse } from "../types.js";

export function registerKeywordsTools(server: McpServer, apiClient: DataForSeoClient) {
  // Google Ads Keywords Data
  registerTool(
    server,
    "keywords_google_ads_keywords_for_keyword",
    z.object({
      keyword: z.string().describe("Keyword to get data for"),
      location_code: z.number().optional().describe("The location code for the search"),
      language_code: z.string().optional().describe("The language code for the search"),
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/keywords_data/google_ads/keywords_for_keywords/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Google Ads Keywords Suggestions
  registerTool(
    server,
    "keywords_google_ads_keywords_for_site",
    z.object({
      target: z.string().describe("Target domain, subdomain or URL to analyze"),
      location_code: z.number().optional().describe("The location code for the search"),
      language_code: z.string().optional().describe("The language code for the search"),
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/keywords_data/google_ads/keywords_for_site/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Google Ads Search Volume
  registerTool(
    server,
    "keywords_google_ads_search_volume",
    z.object({
      keywords: z.array(z.string()).describe("Keywords to get search volume for"),
      location_code: z.number().optional().describe("The location code for the search"),
      language_code: z.string().optional().describe("The language code for the search"),
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/keywords_data/google_ads/search_volume/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Google Ads Keywords Locations
  registerTool(
    server,
    "keywords_google_ads_locations",
    z.object({
      country: z.string().optional().describe("Filter locations by country name")
    }),
    async (params, client) => {
      const url = params.country 
        ? `/keywords_data/google_ads/locations?country=${encodeURIComponent(params.country)}`
        : "/keywords_data/google_ads/locations";
        
      const response = await client.get<DataForSeoResponse<any>>(url);
      
      return response;
    },
    apiClient
  );
  
  // Google Ads Keywords Languages
  registerTool(
    server,
    "keywords_google_ads_languages",
    {},
    async (_params, client) => {
      const response = await client.get<DataForSeoResponse<any>>("/keywords_data/google_ads/languages");
      
      return response;
    },
    apiClient
  );
  
  // Google Ads Keywords Categories
  registerTool(
    server,
    "keywords_google_ads_categories",
    {},
    async (_params, client) => {
      const response = await client.get<DataForSeoResponse<any>>("/keywords_data/google_ads/categories");
      
      return response;
    },
    apiClient
  );
  
  // Google Trends
  registerTool(
    server,
    "keywords_google_trends_explore",
    z.object({
      keywords: z.array(z.string()).describe("Keywords to explore"),
      location_code: z.number().optional().describe("The location code for the search"),
      language_code: z.string().optional().describe("The language code for the search"),
      date_from: z.string().optional().describe("Start date in YYYY-MM-DD format"),
      date_to: z.string().optional().describe("End date in YYYY-MM-DD format"),
      category_code: z.number().optional().describe("Google Trends category code")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/keywords_data/google_trends/explore/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Bing Keyword Data
  registerTool(
    server,
    "keywords_bing_keywords_for_keywords",
    z.object({
      keyword: z.string().describe("Keyword to get data for"),
      location_code: z.number().optional().describe("The location code for the search"),
      language_code: z.string().optional().describe("The language code for the search"),
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/keywords_data/bing/keywords_for_keywords/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
}