import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DataForSeoClient } from "../client.js";
import { registerTool } from "../tools.js";
import { DataForSeoResponse } from "../types.js";

export function registerMerchantTools(server: McpServer, apiClient: DataForSeoClient) {
  // Merchant Google Search
  registerTool(
    server,
    "merchant_google_search",
    z.object({
      keyword: z.string().describe("Product name or related keyword"),
      location_name: z.string().optional().describe("Location name"),
      location_code: z.number().optional().describe("Location code"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code"),
      depth: z.number().optional().describe("Number of results to return"),
      limit: z.number().optional().describe("Maximum number of results to return per page"),
      offset: z.number().optional().describe("Offset for pagination")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/merchant/google/search/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Merchant Google Product Specs
  registerTool(
    server,
    "merchant_google_product_specs",
    z.object({
      product_id: z.string().describe("Google Shopping Product ID"),
      location_name: z.string().optional().describe("Location name"),
      location_code: z.number().optional().describe("Location code"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/merchant/google/product_specs/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Merchant Google Product Info
  registerTool(
    server,
    "merchant_google_product_info",
    z.object({
      product_id: z.string().describe("Google Shopping Product ID"),
      location_name: z.string().optional().describe("Location name"),
      location_code: z.number().optional().describe("Location code"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/merchant/google/product_info/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Merchant Google Sellers
  registerTool(
    server,
    "merchant_google_sellers",
    z.object({
      product_id: z.string().describe("Google Shopping Product ID"),
      location_name: z.string().optional().describe("Location name"),
      location_code: z.number().optional().describe("Location code"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/merchant/google/sellers/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Merchant Google Reviews
  registerTool(
    server,
    "merchant_google_reviews",
    z.object({
      product_id: z.string().describe("Google Shopping Product ID"),
      location_name: z.string().optional().describe("Location name"),
      location_code: z.number().optional().describe("Location code"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code"),
      depth: z.number().optional().describe("Number of reviews to retrieve"),
      offset: z.number().optional().describe("Offset for pagination")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/merchant/google/reviews/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Merchant Google Locations
  registerTool(
    server,
    "merchant_google_locations",
    z.object({
      country: z.string().optional().describe("Filter locations by country name")
    }),
    async (params, client) => {
      const url = params.country 
        ? `/merchant/google/locations?country=${encodeURIComponent(params.country)}`
        : "/merchant/google/locations";
        
      const response = await client.get<DataForSeoResponse<any>>(url);
      
      return response;
    },
    apiClient
  );
  
  // Merchant Google Languages
  registerTool(
    server,
    "merchant_google_languages",
    {},
    async (_params, client) => {
      const response = await client.get<DataForSeoResponse<any>>("/merchant/google/languages");
      
      return response;
    },
    apiClient
  );
  
  // Merchant Amazon Search
  registerTool(
    server,
    "merchant_amazon_search",
    z.object({
      keyword: z.string().describe("Product name or related keyword"),
      location_name: z.string().optional().describe("Location name"),
      location_code: z.number().optional().describe("Location code"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code"),
      depth: z.number().optional().describe("Number of results to return"),
      limit: z.number().optional().describe("Maximum number of results to return per page"),
      offset: z.number().optional().describe("Offset for pagination")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/merchant/amazon/search/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Merchant Amazon Product Info
  registerTool(
    server,
    "merchant_amazon_product_info",
    z.object({
      asin: z.string().describe("Amazon ASIN"),
      location_name: z.string().optional().describe("Location name"),
      location_code: z.number().optional().describe("Location code"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/merchant/amazon/product_info/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Merchant Amazon Reviews
  registerTool(
    server,
    "merchant_amazon_reviews",
    z.object({
      asin: z.string().describe("Amazon ASIN"),
      location_name: z.string().optional().describe("Location name"),
      location_code: z.number().optional().describe("Location code"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code"),
      depth: z.number().optional().describe("Number of reviews to retrieve"),
      offset: z.number().optional().describe("Offset for pagination")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/merchant/amazon/reviews/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Merchant Amazon Locations
  registerTool(
    server,
    "merchant_amazon_locations",
    z.object({
      country: z.string().optional().describe("Filter locations by country name")
    }),
    async (params, client) => {
      const url = params.country 
        ? `/merchant/amazon/locations?country=${encodeURIComponent(params.country)}`
        : "/merchant/amazon/locations";
        
      const response = await client.get<DataForSeoResponse<any>>(url);
      
      return response;
    },
    apiClient
  );
  
  // Merchant Amazon Languages
  registerTool(
    server,
    "merchant_amazon_languages",
    {},
    async (_params, client) => {
      const response = await client.get<DataForSeoResponse<any>>("/merchant/amazon/languages");
      
      return response;
    },
    apiClient
  );
}