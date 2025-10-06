import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DataForSeoClient } from "../client.js";
import { registerTool } from "../tools.js";
import { DataForSeoResponse } from "../types.js";

// DataForSEO Labs API schemas
const keywordResearchBaseSchema = z.object({
  keyword: z.string().describe("Keyword(s) to research"),
  location_code: z.number().optional().describe("The location code for the search"),
  language_code: z.string().optional().describe("The language code for the search"),
  limit: z.number().optional().describe("Maximum number of results to return"),
  offset: z.number().optional().describe("Offset for pagination"),
  include_seed_keyword: z.boolean().optional().describe("Include the seed keyword in the results")
});

const domainResearchBaseSchema = z.object({
  target: z.string().describe("Target domain name"),
  location_code: z.number().optional().describe("The location code for the search"),
  language_code: z.string().optional().describe("The language code for the search"),
  limit: z.number().optional().describe("Maximum number of results to return"),
  offset: z.number().optional().describe("Offset for pagination")
});

export function registerLabsTools(server: McpServer, apiClient: DataForSeoClient) {
  // Keywords for Site
  registerTool(
    server,
    "labs_google_keywords_for_site",
    domainResearchBaseSchema.extend({
      include_serp_info: z.boolean().optional().describe("Include SERP information")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/google/keywords_for_site/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Related Keywords
  registerTool(
    server,
    "labs_google_related_keywords",
    keywordResearchBaseSchema,
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/google/related_keywords/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Keyword Suggestions
  registerTool(
    server,
    "labs_google_keyword_suggestions",
    keywordResearchBaseSchema,
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/google/keyword_suggestions/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Keyword Ideas
  registerTool(
    server,
    "labs_google_keyword_ideas",
    keywordResearchBaseSchema,
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/google/keyword_ideas/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Historical Search Volume
  registerTool(
    server,
    "labs_google_historical_search_volume",
    z.object({
      keywords: z.array(z.string()).describe("Keywords to get historical search volume for"),
      location_code: z.number().optional().describe("The location code for the search"),
      language_code: z.string().optional().describe("The language code for the search"),
      include_serp_info: z.boolean().optional().describe("Include SERP information")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/google/historical_search_volume/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Bulk Keyword Difficulty
  registerTool(
    server,
    "labs_google_bulk_keyword_difficulty",
    z.object({
      keywords: z.array(z.string()).describe("Keywords to calculate difficulty for"),
      location_code: z.number().optional().describe("The location code for the search"),
      language_code: z.string().optional().describe("The language code for the search")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/google/bulk_keyword_difficulty/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Search Intent
  registerTool(
    server,
    "labs_google_search_intent",
    z.object({
      keywords: z.array(z.string()).describe("Keywords to determine search intent"),
      location_code: z.number().optional().describe("The location code for the search"),
      language_code: z.string().optional().describe("The language code for the search")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/google/search_intent/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Categories for Domain
  registerTool(
    server,
    "labs_google_categories_for_domain",
    domainResearchBaseSchema,
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/google/categories_for_domain/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Domain Rank Overview
  registerTool(
    server,
    "labs_google_domain_rank_overview",
    domainResearchBaseSchema,
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/google/domain_rank_overview/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Ranked Keywords
  registerTool(
    server,
    "labs_google_ranked_keywords",
    domainResearchBaseSchema.extend({
      include_serp_info: z.boolean().optional().describe("Include SERP information"),
      filters: z.array(z.any()).optional().describe("Filters to apply to the results")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/google/ranked_keywords/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Competitors Domain
  registerTool(
    server,
    "labs_google_competitors_domain",
    domainResearchBaseSchema.extend({
      filters: z.array(z.any()).optional().describe("Filters to apply to the results")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/google/competitors_domain/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Domain Intersection
  registerTool(
    server,
    "labs_google_domain_intersection",
    z.object({
      domains: z.array(z.string()).min(2).max(20).describe("Domains to compare"),
      location_code: z.number().optional().describe("The location code for the search"),
      language_code: z.string().optional().describe("The language code for the search"),
      limit: z.number().optional().describe("Maximum number of results to return"),
      offset: z.number().optional().describe("Offset for pagination"),
      filters: z.array(z.any()).optional().describe("Filters to apply to the results")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/google/domain_intersection/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Subdomains
  registerTool(
    server,
    "labs_google_subdomains",
    domainResearchBaseSchema.extend({
      filters: z.array(z.any()).optional().describe("Filters to apply to the results")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/google/subdomains/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Relevant Pages
  registerTool(
    server,
    "labs_google_relevant_pages",
    domainResearchBaseSchema.extend({
      filters: z.array(z.any()).optional().describe("Filters to apply to the results")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/google/relevant_pages/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Bulk Traffic Estimation
  registerTool(
    server,
    "labs_google_bulk_traffic_estimation",
    z.object({
      targets: z.array(z.string()).describe("Domains to estimate traffic for"),
      location_code: z.number().optional().describe("The location code for the search"),
      language_code: z.string().optional().describe("The language code for the search")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/google/bulk_traffic_estimation/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // === AMAZON LABS API ===
  
  // Amazon Bulk Search Volume
  registerTool(
    server,
    "labs_amazon_bulk_search_volume",
    z.object({
      keywords: z.array(z.string()).describe("Keywords to get search volume for"),
      location_code: z.number().optional().describe("The location code for the search"),
      language_code: z.string().optional().describe("The language code for the search")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/amazon/bulk_search_volume/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Amazon Related Keywords
  registerTool(
    server,
    "labs_amazon_related_keywords",
    keywordResearchBaseSchema.extend({
      marketplace: z.string().optional().describe("Amazon marketplace (e.g., amazon.com)")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/amazon/related_keywords/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Amazon Ranked Keywords
  registerTool(
    server,
    "labs_amazon_ranked_keywords",
    z.object({
      target: z.string().describe("Target ASIN or Amazon domain"),
      marketplace: z.string().optional().describe("Amazon marketplace (e.g., amazon.com)"),
      location_code: z.number().optional().describe("The location code for the search"),
      language_code: z.string().optional().describe("The language code for the search"),
      limit: z.number().optional().describe("Maximum number of results to return"),
      offset: z.number().optional().describe("Offset for pagination"),
      filters: z.array(z.any()).optional().describe("Filters to apply to the results")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/amazon/ranked_keywords/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Amazon Product Competitors
  registerTool(
    server,
    "labs_amazon_product_competitors",
    z.object({
      asin: z.string().describe("Target Amazon ASIN"),
      marketplace: z.string().optional().describe("Amazon marketplace (e.g., amazon.com)"),
      location_code: z.number().optional().describe("The location code for the search"),
      language_code: z.string().optional().describe("The language code for the search"),
      limit: z.number().optional().describe("Maximum number of results to return"),
      offset: z.number().optional().describe("Offset for pagination")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/amazon/product_competitors/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // === BING LABS API ===
  
  // Bing Keywords for Site
  registerTool(
    server,
    "labs_bing_keywords_for_site",
    domainResearchBaseSchema.extend({
      include_serp_info: z.boolean().optional().describe("Include SERP information")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/bing/keywords_for_site/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Bing Related Keywords
  registerTool(
    server,
    "labs_bing_related_keywords",
    keywordResearchBaseSchema,
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/bing/related_keywords/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Bing Domain Rank Overview
  registerTool(
    server,
    "labs_bing_domain_rank_overview",
    domainResearchBaseSchema,
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/bing/domain_rank_overview/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Bing Ranked Keywords
  registerTool(
    server,
    "labs_bing_ranked_keywords",
    domainResearchBaseSchema.extend({
      include_serp_info: z.boolean().optional().describe("Include SERP information"),
      filters: z.array(z.any()).optional().describe("Filters to apply to the results")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/bing/ranked_keywords/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Bing Competitors Domain
  registerTool(
    server,
    "labs_bing_competitors_domain",
    domainResearchBaseSchema.extend({
      filters: z.array(z.any()).optional().describe("Filters to apply to the results")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/bing/competitors_domain/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // === GOOGLE PLAY AND APP STORE LABS API ===
  
  // Google Play Keywords for App
  registerTool(
    server,
    "labs_google_play_keywords_for_app",
    z.object({
      app_id: z.string().describe("Google Play app ID"),
      location_code: z.number().optional().describe("The location code for the search"),
      language_code: z.string().optional().describe("The language code for the search"),
      limit: z.number().optional().describe("Maximum number of results to return"),
      offset: z.number().optional().describe("Offset for pagination")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/google_play/keywords_for_app/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Google Play Ranked Apps
  registerTool(
    server,
    "labs_google_play_ranked_apps",
    keywordResearchBaseSchema.extend({
      filters: z.array(z.any()).optional().describe("Filters to apply to the results")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/google_play/ranked_apps/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Google Play App Competitors
  registerTool(
    server,
    "labs_google_play_app_competitors",
    z.object({
      app_id: z.string().describe("Google Play app ID"),
      location_code: z.number().optional().describe("The location code for the search"),
      language_code: z.string().optional().describe("The language code for the search"),
      limit: z.number().optional().describe("Maximum number of results to return"),
      offset: z.number().optional().describe("Offset for pagination")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/google_play/app_competitors/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // App Store Keywords for App
  registerTool(
    server,
    "labs_app_store_keywords_for_app",
    z.object({
      app_id: z.string().describe("App Store app ID"),
      location_code: z.number().optional().describe("The location code for the search"),
      language_code: z.string().optional().describe("The language code for the search"),
      limit: z.number().optional().describe("Maximum number of results to return"),
      offset: z.number().optional().describe("Offset for pagination")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/app_store/keywords_for_app/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // App Store Ranked Apps
  registerTool(
    server,
    "labs_app_store_ranked_apps",
    keywordResearchBaseSchema.extend({
      filters: z.array(z.any()).optional().describe("Filters to apply to the results")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/app_store/ranked_apps/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // App Store App Competitors
  registerTool(
    server,
    "labs_app_store_app_competitors",
    z.object({
      app_id: z.string().describe("App Store app ID"),
      location_code: z.number().optional().describe("The location code for the search"),
      language_code: z.string().optional().describe("The language code for the search"),
      limit: z.number().optional().describe("Maximum number of results to return"),
      offset: z.number().optional().describe("Offset for pagination")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/app_store/app_competitors/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // === META ENDPOINTS FOR LABS API ===
  
  // Categories
  registerTool(
    server,
    "labs_categories",
    z.object({
      engine: z.enum(["google", "amazon", "bing", "google_play", "app_store"]).describe("Engine to get categories for"),
      category_code: z.number().optional().describe("Parent category code"),
      language_code: z.string().optional().describe("Language code")
    }),
    async (params, client) => {
      const url = `/dataforseo_labs/${params.engine}/categories`;
      const queryParams = [];
      
      if (params.category_code) {
        queryParams.push(`category_code=${params.category_code}`);
      }
      
      if (params.language_code) {
        queryParams.push(`language_code=${params.language_code}`);
      }
      
      const fullUrl = queryParams.length > 0 ? `${url}?${queryParams.join('&')}` : url;
      const response = await client.get<DataForSeoResponse<any>>(fullUrl);
      
      return response;
    },
    apiClient
  );
  
  // Locations
  registerTool(
    server,
    "labs_locations",
    z.object({
      engine: z.enum(["google", "amazon", "bing", "google_play", "app_store"]).describe("Engine to get locations for"),
      country: z.string().optional().describe("Filter locations by country name")
    }),
    async (params, client) => {
      const url = `/dataforseo_labs/${params.engine}/locations`;
      const queryParams = [];
      
      if (params.country) {
        queryParams.push(`country=${encodeURIComponent(params.country)}`);
      }
      
      const fullUrl = queryParams.length > 0 ? `${url}?${queryParams.join('&')}` : url;
      const response = await client.get<DataForSeoResponse<any>>(fullUrl);
      
      return response;
    },
    apiClient
  );
  
  // Languages
  registerTool(
    server,
    "labs_languages",
    z.object({
      engine: z.enum(["google", "amazon", "bing", "google_play", "app_store"]).describe("Engine to get languages for")
    }),
    async (params, client) => {
      const url = `/dataforseo_labs/${params.engine}/languages`;
      const response = await client.get<DataForSeoResponse<any>>(url);
      
      return response;
    },
    apiClient
  );
  
  // Available History
  registerTool(
    server,
    "labs_available_history",
    z.object({
      engine: z.enum(["google", "amazon", "bing", "google_play", "app_store"]).describe("Engine to get available history for"),
      function: z.string().describe("Function name (e.g., keywords_for_site, serp)")
    }),
    async (params, client) => {
      const url = `/dataforseo_labs/${params.engine}/available_history/${params.function}`;
      const response = await client.get<DataForSeoResponse<any>>(url);
      
      return response;
    },
    apiClient
  );
}