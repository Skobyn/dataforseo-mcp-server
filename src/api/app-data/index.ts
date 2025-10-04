import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DataForSeoClient } from "../client.js";
import { registerTool } from "../tools.js";
import { DataForSeoResponse } from "../types.js";

export function registerAppDataTools(server: McpServer, apiClient: DataForSeoClient) {
  // App Data Google Play Search
  registerTool(
    server,
    "app_data_google_play_search",
    z.object({
      keyword: z.string().describe("App name or related keyword"),
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
        "/app_data/google_play/search/live",
        [params]
      );

      return response;
    },
    apiClient
  );
  
  // App Data Google Play App Info
  registerTool(
    server,
    "app_data_google_play_app_info",
    z.object({
      app_id: z.string().describe("Google Play App ID"),
      location_name: z.string().optional().describe("Location name"),
      location_code: z.number().optional().describe("Location code"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/app_data/google_play/app_info/live",
        [params]
      );

      return response;
    },
    apiClient
  );

  // App Data Google Play Reviews
  registerTool(
    server,
    "app_data_google_play_reviews",
    z.object({
      app_id: z.string().describe("Google Play App ID"),
      location_name: z.string().optional().describe("Location name"),
      location_code: z.number().optional().describe("Location code"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code"),
      depth: z.number().optional().describe("Number of reviews to retrieve"),
      sort_by: z.enum(["most_relevant", "newest"]).optional().describe("Sorting method"),
      limit: z.number().optional().describe("Maximum number of results to return per page"),
      offset: z.number().optional().describe("Offset for pagination")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/app_data/google_play/reviews/live",
        [params]
      );

      return response;
    },
    apiClient
  );

  // App Data Google Play Locations
  registerTool(
    server,
    "app_data_google_play_locations",
    z.object({
      country: z.string().optional().describe("Filter locations by country name")
    }),
    async (params, client) => {
      const url = params.country 
        ? `/app_data/google_play/locations?country=${encodeURIComponent(params.country)}`
        : "/app_data/google_play/locations";
        
      const response = await client.get<DataForSeoResponse<any>>(url);

      return response;
    },
    apiClient
  );

  // App Data Google Play Languages
  registerTool(
    server,
    "app_data_google_play_languages",
    {},
    async (_params, client) => {
      const response = await client.get<DataForSeoResponse<any>>("/app_data/google_play/languages");

      return response;
    },
    apiClient
  );

  // App Data App Store Search
  registerTool(
    server,
    "app_data_app_store_search",
    z.object({
      keyword: z.string().describe("App name or related keyword"),
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
        "/app_data/apple/search/live",
        [params]
      );

      return response;
    },
    apiClient
  );

  // App Data App Store App Info
  registerTool(
    server,
    "app_data_app_store_app_info",
    z.object({
      app_id: z.string().describe("App Store App ID"),
      location_name: z.string().optional().describe("Location name"),
      location_code: z.number().optional().describe("Location code"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/app_data/apple/app_info/live",
        [params]
      );

      return response;
    },
    apiClient
  );

  // App Data App Store Reviews
  registerTool(
    server,
    "app_data_app_store_reviews",
    z.object({
      app_id: z.string().describe("App Store App ID"),
      location_name: z.string().optional().describe("Location name"),
      location_code: z.number().optional().describe("Location code"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code"),
      depth: z.number().optional().describe("Number of reviews to retrieve"),
      sort_by: z.enum(["most_relevant", "most_recent"]).optional().describe("Sorting method"),
      limit: z.number().optional().describe("Maximum number of results to return per page"),
      offset: z.number().optional().describe("Offset for pagination")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/app_data/apple/reviews/live",
        [params]
      );

      return response;
    },
    apiClient
  );

  // App Data App Store Locations
  registerTool(
    server,
    "app_data_app_store_locations",
    z.object({
      country: z.string().optional().describe("Filter locations by country name")
    }),
    async (params, client) => {
      const url = params.country 
        ? `/app_data/apple/locations?country=${encodeURIComponent(params.country)}`
        : "/app_data/apple/locations";
        
      const response = await client.get<DataForSeoResponse<any>>(url);

      return response;
    },
    apiClient
  );

  // App Data App Store Languages
  registerTool(
    server,
    "app_data_app_store_languages",
    {},
    async (_params, client) => {
      const response = await client.get<DataForSeoResponse<any>>("/app_data/apple/languages");

      return response;
    },
    apiClient
  );
}