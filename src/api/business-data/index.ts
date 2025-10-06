import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DataForSeoClient } from "../client.js";
import { registerTool } from "../tools.js";
import { DataForSeoResponse } from "../types.js";

export function registerBusinessDataTools(server: McpServer, apiClient: DataForSeoClient) {
  // Business Data Google My Business Info
  registerTool(
    server,
    "business_data_google_my_business_info",
    z.object({
      keyword: z.string().describe("Business name or related keyword"),
      location_name: z.string().optional().describe("Location name"),
      location_code: z.number().optional().describe("Location code"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/business_data/google/my_business_info/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Business Data Google Reviews
  registerTool(
    server,
    "business_data_google_reviews",
    z.object({
      keyword: z.string().optional().describe("Business name or related keyword"),
      place_id: z.string().optional().describe("Google Place ID"),
      depth: z.number().optional().describe("Number of reviews to retrieve"),
      sort_by: z.enum(["relevance", "newest"]).optional().describe("Sorting method"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/business_data/google/reviews/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Business Data Google Locations
  registerTool(
    server,
    "business_data_google_locations",
    z.object({
      country: z.string().optional().describe("Filter locations by country name")
    }),
    async (params, client) => {
      const url = params.country 
        ? `/business_data/google/locations?country=${encodeURIComponent(params.country)}`
        : "/business_data/google/locations";
        
      const response = await client.get<DataForSeoResponse<any>>(url);
      
      return response;
    },
    apiClient
  );
  
  // Business Data Google Languages
  registerTool(
    server,
    "business_data_google_languages",
    {},
    async (_params, client) => {
      const response = await client.get<DataForSeoResponse<any>>("/business_data/google/languages");
      
      return response;
    },
    apiClient
  );
  
  // Business Data TripAdvisor Search
  registerTool(
    server,
    "business_data_tripadvisor_search",
    z.object({
      keyword: z.string().describe("Business name or related keyword"),
      location_name: z.string().optional().describe("Location name"),
      priority: z.number().min(1).max(2).optional().describe("Priority: 1 (normal) or 2 (high)"),
      depth: z.number().optional().describe("Number of results to return"),
      limit: z.number().optional().describe("Maximum number of results to return per page"),
      offset: z.number().optional().describe("Offset for pagination")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/business_data/tripadvisor/search/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Business Data TripAdvisor Reviews
  registerTool(
    server,
    "business_data_tripadvisor_reviews",
    z.object({
      location_id: z.string().describe("TripAdvisor location ID"),
      depth: z.number().optional().describe("Number of reviews to retrieve"),
      offset: z.number().optional().describe("Offset for pagination"),
      sort_by: z.enum(["relevance", "date_of_visit"]).optional().describe("Sorting method"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/business_data/tripadvisor/reviews/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Business Data Trustpilot Search
  registerTool(
    server,
    "business_data_trustpilot_search",
    z.object({
      keyword: z.string().describe("Business name or related keyword"),
      location_name: z.string().optional().describe("Location name"),
      depth: z.number().optional().describe("Number of results to return"),
      limit: z.number().optional().describe("Maximum number of results to return per page"),
      offset: z.number().optional().describe("Offset for pagination"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/business_data/trustpilot/search/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Business Data Trustpilot Reviews
  registerTool(
    server,
    "business_data_trustpilot_reviews",
    z.object({
      domain: z.string().describe("Business domain"),
      depth: z.number().optional().describe("Number of reviews to retrieve"),
      offset: z.number().optional().describe("Offset for pagination"),
      limit: z.number().optional().describe("Maximum number of results to return per page"),
      sort_by: z.enum(["recency", "relevance"]).optional().describe("Sorting method"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/business_data/trustpilot/reviews/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );

  // === ADDED SOCIAL MEDIA ENDPOINTS ===
  
  // Business Data Facebook Search
  registerTool(
    server,
    "business_data_facebook_search",
    z.object({
      keyword: z.string().describe("Business name or related keyword"),
      location_name: z.string().optional().describe("Location name"),
      depth: z.number().optional().describe("Number of results to return"),
      limit: z.number().optional().describe("Maximum number of results to return per page"),
      offset: z.number().optional().describe("Offset for pagination")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/business_data/facebook/search/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Business Data Facebook Overview
  registerTool(
    server,
    "business_data_facebook_overview",
    z.object({
      id: z.string().describe("Facebook business ID"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/business_data/facebook/overview/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Business Data Pinterest Search
  registerTool(
    server,
    "business_data_pinterest_search",
    z.object({
      keyword: z.string().describe("Business name or related keyword"),
      depth: z.number().optional().describe("Number of results to return"),
      limit: z.number().optional().describe("Maximum number of results to return per page"),
      offset: z.number().optional().describe("Offset for pagination")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/business_data/pinterest/search/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Business Data Pinterest Info
  registerTool(
    server,
    "business_data_pinterest_info",
    z.object({
      url: z.string().describe("Pinterest business URL"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/business_data/pinterest/info/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Business Data Reddit Search
  registerTool(
    server,
    "business_data_reddit_search",
    z.object({
      keyword: z.string().describe("Keyword to search on Reddit"),
      depth: z.number().optional().describe("Number of results to return"),
      limit: z.number().optional().describe("Maximum number of results to return per page"),
      offset: z.number().optional().describe("Offset for pagination"),
      sort_by: z.enum(["relevance", "hot", "top", "new"]).optional().describe("Sorting method"),
      search_type: z.enum(["communities", "posts"]).optional().describe("Type of search to perform")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/business_data/reddit/search/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Business Data Reddit Info
  registerTool(
    server,
    "business_data_reddit_info",
    z.object({
      url: z.string().describe("Reddit URL (subreddit, post, etc.)"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/business_data/reddit/info/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // === GOOGLE HOTELS ENDPOINTS ===
  
  // Business Data Google Hotels Search
  registerTool(
    server,
    "business_data_google_hotels_search",
    z.object({
      keyword: z.string().describe("Hotel name or related keyword"),
      location_name: z.string().optional().describe("Location name"),
      location_code: z.number().optional().describe("Location code"),
      check_in: z.string().optional().describe("Check-in date in YYYY-MM-DD format"),
      check_out: z.string().optional().describe("Check-out date in YYYY-MM-DD format"),
      guests: z.number().optional().describe("Number of guests"),
      currency: z.string().optional().describe("Currency code"),
      depth: z.number().optional().describe("Number of results to return"),
      limit: z.number().optional().describe("Maximum number of results to return per page"),
      offset: z.number().optional().describe("Offset for pagination"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/business_data/google/hotels/search/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Business Data Google Hotels Info
  registerTool(
    server,
    "business_data_google_hotels_info",
    z.object({
      hotel_id: z.string().describe("Google hotel ID"),
      location_name: z.string().optional().describe("Location name"),
      location_code: z.number().optional().describe("Location code"),
      check_in: z.string().optional().describe("Check-in date in YYYY-MM-DD format"),
      check_out: z.string().optional().describe("Check-out date in YYYY-MM-DD format"),
      guests: z.number().optional().describe("Number of guests"),
      currency: z.string().optional().describe("Currency code"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/business_data/google/hotels/info/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Business Data Google Hotels Reviews
  registerTool(
    server,
    "business_data_google_hotels_reviews",
    z.object({
      hotel_id: z.string().describe("Google hotel ID"),
      depth: z.number().optional().describe("Number of reviews to retrieve"),
      offset: z.number().optional().describe("Offset for pagination"),
      sort_by: z.enum(["relevance", "newest"]).optional().describe("Sorting method"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/business_data/google/hotels/reviews/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // === BUSINESS LISTINGS ENDPOINTS ===
  
  // Business Data Business Listings Search
  registerTool(
    server,
    "business_data_business_listings_search",
    z.object({
      keyword: z.string().describe("Business name or related keyword"),
      location_name: z.string().optional().describe("Location name"),
      location_code: z.number().optional().describe("Location code"),
      depth: z.number().optional().describe("Number of results to return"),
      limit: z.number().optional().describe("Maximum number of results to return per page"),
      offset: z.number().optional().describe("Offset for pagination"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/business_data/business_listings/search/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Business Data Business Listings Categories
  registerTool(
    server,
    "business_data_business_listings_categories",
    z.object({
      country: z.string().optional().describe("Filter categories by country")
    }),
    async (params, client) => {
      const url = params.country 
        ? `/business_data/business_listings/categories?country=${encodeURIComponent(params.country)}`
        : "/business_data/business_listings/categories";
      
      const response = await client.get<DataForSeoResponse<any>>(url);
      
      return response;
    },
    apiClient
  );
  
  // Business Data Business Listings Locations
  registerTool(
    server,
    "business_data_business_listings_locations",
    z.object({
      country: z.string().optional().describe("Filter locations by country name")
    }),
    async (params, client) => {
      const url = params.country 
        ? `/business_data/business_listings/locations?country=${encodeURIComponent(params.country)}`
        : "/business_data/business_listings/locations";
      
      const response = await client.get<DataForSeoResponse<any>>(url);
      
      return response;
    },
    apiClient
  );
}