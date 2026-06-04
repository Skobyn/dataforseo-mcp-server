import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DataForSeoClient } from "../client.js";
import { registerTool, registerTaskTool } from "../tools.js";
import { DataForSeoResponse } from "../types.js";

export function registerAppDataTools(server: McpServer, apiClient: DataForSeoClient) {

  // ──────────────────────────────────────────────────────────────────
  // DEPRECATED STUB: app_data_google_play_search
  // The old path /app_data/google_play/search/live does not exist.
  // The correct endpoint is /app_data/google/app_listings/search/live
  // and it takes DIFFERENT parameters (categories/description/title/filters),
  // not keyword/location. Use app_data_google_app_listings_search instead.
  // ──────────────────────────────────────────────────────────────────
  registerTool(
    server,
    "app_data_google_play_search",
    z.object({
      keyword: z.string().optional().describe("Deprecated — not used by the real endpoint"),
      location_name: z.string().optional().describe("Deprecated — not used by the real endpoint"),
      location_code: z.coerce.number().optional().describe("Deprecated — not used by the real endpoint"),
      language_name: z.string().optional().describe("Deprecated — not used by the real endpoint"),
      language_code: z.string().optional().describe("Deprecated — not used by the real endpoint"),
      depth: z.coerce.number().optional().describe("Deprecated — not used by the real endpoint"),
      limit: z.coerce.number().optional().describe("Deprecated — not used by the real endpoint"),
      offset: z.coerce.number().optional().describe("Deprecated — not used by the real endpoint")
    }),
    async (_params, _client) => {
      return {
        error: "This tool wraps /app_data/google/app_listings/search/live which takes categories/description/title params, not keyword. See app_data_google_app_listings_search for the correct tool."
      };
    },
    apiClient
  );

  // NEW: app_data_google_app_listings_search — correct schema and path
  registerTool(
    server,
    "app_data_google_app_listings_search",
    z.object({
      categories: z.array(z.string()).optional().describe("Array of app category names to filter by"),
      description: z.string().optional().describe("Text to search within app descriptions"),
      title: z.string().optional().describe("Text to search within app titles"),
      filters: z.array(z.any()).optional().describe("Additional filters as per DataForSEO filter syntax"),
      limit: z.coerce.number().optional().describe("Maximum number of results to return"),
      offset: z.coerce.number().optional().describe("Offset for pagination"),
      order_by: z.array(z.string()).optional().describe("Sorting rules")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/app_data/google/app_listings/search/live",
        [params]
      );
      return response;
    },
    apiClient
  );

  // ──────────────────────────────────────────────────────────────────
  // DEPRECATED STUB: app_data_google_play_app_info
  // No live endpoint exists. Must use task-based flow.
  // Use app_data_google_app_info_post, _ready, _get instead.
  // ──────────────────────────────────────────────────────────────────
  registerTool(
    server,
    "app_data_google_play_app_info",
    z.object({
      app_id: z.string().optional().describe("Deprecated stub"),
      location_name: z.string().optional().describe("Deprecated stub"),
      location_code: z.coerce.number().optional().describe("Deprecated stub"),
      language_name: z.string().optional().describe("Deprecated stub"),
      language_code: z.string().optional().describe("Deprecated stub")
    }),
    async (_params, _client) => {
      return {
        error: "Google App Info has no live endpoint. Use app_data_google_app_info_post, then app_data_google_app_info_ready, then app_data_google_app_info_get to retrieve results."
      };
    },
    apiClient
  );

  // NEW: task-based Google App Info
  registerTaskTool(
    server,
    "app_data_google_app_info",
    z.object({
      app_id: z.string().describe("Google Play App ID (e.g. com.example.app)"),
      location_name: z.string().optional().describe("Location name"),
      location_code: z.coerce.number().optional().describe("Location code"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code"),
      priority: z.coerce.number().optional().describe("Task priority (1–2)"),
      postback_url: z.string().optional().describe("URL for postback notification"),
      pingback_url: z.string().optional().describe("URL for pingback notification")
    }),
    async (params, client) => {
      return client.post<DataForSeoResponse<any>>(
        "/app_data/google/app_info/task_post",
        [params]
      );
    },
    async (client) => {
      return client.get<DataForSeoResponse<any>>("/app_data/google/app_info/tasks_ready");
    },
    async (id, client) => {
      return client.get<DataForSeoResponse<any>>(
        `/app_data/google/app_info/task_get/advanced/${id}`
      );
    },
    apiClient
  );

  // ──────────────────────────────────────────────────────────────────
  // DEPRECATED STUB: app_data_google_play_reviews
  // No live endpoint exists. The correct segment is app_reviews (not reviews).
  // Use app_data_google_app_reviews_post, _ready, _get instead.
  // ──────────────────────────────────────────────────────────────────
  registerTool(
    server,
    "app_data_google_play_reviews",
    z.object({
      app_id: z.string().optional().describe("Deprecated stub"),
      location_name: z.string().optional().describe("Deprecated stub"),
      location_code: z.coerce.number().optional().describe("Deprecated stub"),
      language_name: z.string().optional().describe("Deprecated stub"),
      language_code: z.string().optional().describe("Deprecated stub"),
      depth: z.coerce.number().optional().describe("Deprecated stub"),
      sort_by: z.enum(["most_relevant", "newest"]).optional().describe("Deprecated stub"),
      limit: z.coerce.number().optional().describe("Deprecated stub"),
      offset: z.coerce.number().optional().describe("Deprecated stub")
    }),
    async (_params, _client) => {
      return {
        error: "Google App Reviews has no live endpoint. Use app_data_google_app_reviews_post/ready/get. Note: endpoint is 'app_reviews' not 'reviews'."
      };
    },
    apiClient
  );

  // NEW: task-based Google App Reviews
  registerTaskTool(
    server,
    "app_data_google_app_reviews",
    z.object({
      app_id: z.string().describe("Google Play App ID (e.g. com.example.app)"),
      location_name: z.string().optional().describe("Location name"),
      location_code: z.coerce.number().optional().describe("Location code"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code"),
      depth: z.coerce.number().optional().describe("Number of reviews to retrieve"),
      sort_by: z.enum(["most_relevant", "newest"]).optional().describe("Sorting method"),
      limit: z.coerce.number().optional().describe("Maximum number of results per page"),
      offset: z.coerce.number().optional().describe("Offset for pagination"),
      priority: z.coerce.number().optional().describe("Task priority (1–2)"),
      postback_url: z.string().optional().describe("URL for postback notification"),
      pingback_url: z.string().optional().describe("URL for pingback notification")
    }),
    async (params, client) => {
      return client.post<DataForSeoResponse<any>>(
        "/app_data/google/app_reviews/task_post",
        [params]
      );
    },
    async (client) => {
      return client.get<DataForSeoResponse<any>>("/app_data/google/app_reviews/tasks_ready");
    },
    async (id, client) => {
      return client.get<DataForSeoResponse<any>>(
        `/app_data/google/app_reviews/task_get/advanced/${id}`
      );
    },
    apiClient
  );

  // App Data Google Play Locations — fixed: google_play → google, country as path segment
  registerTool(
    server,
    "app_data_google_play_locations",
    z.object({
      country: z.string().optional().describe("ISO country code to filter locations (appended as path segment)")
    }),
    async (params, client) => {
      const url = params.country
        ? `/app_data/google/locations/${encodeURIComponent(params.country)}`
        : "/app_data/google/locations";
      return client.get<DataForSeoResponse<any>>(url);
    },
    apiClient
  );

  // App Data Google Play Languages — fixed: google_play → google
  registerTool(
    server,
    "app_data_google_play_languages",
    {},
    async (_params, client) => {
      return client.get<DataForSeoResponse<any>>("/app_data/google/languages");
    },
    apiClient
  );

  // ──────────────────────────────────────────────────────────────────
  // DEPRECATED STUB: app_data_app_store_search
  // Missing app_listings segment + wrong params (keyword vs categories/title).
  // Use app_data_apple_app_listings_search for the correct tool.
  // ──────────────────────────────────────────────────────────────────
  registerTool(
    server,
    "app_data_app_store_search",
    z.object({
      keyword: z.string().optional().describe("Deprecated — not used by the real endpoint"),
      location_name: z.string().optional().describe("Deprecated — not used by the real endpoint"),
      location_code: z.coerce.number().optional().describe("Deprecated — not used by the real endpoint"),
      language_name: z.string().optional().describe("Deprecated — not used by the real endpoint"),
      language_code: z.string().optional().describe("Deprecated — not used by the real endpoint"),
      depth: z.coerce.number().optional().describe("Deprecated — not used by the real endpoint"),
      limit: z.coerce.number().optional().describe("Deprecated — not used by the real endpoint"),
      offset: z.coerce.number().optional().describe("Deprecated — not used by the real endpoint")
    }),
    async (_params, _client) => {
      return {
        error: "This tool wraps /app_data/apple/app_listings/search/live which takes categories/description/title params, not keyword. See app_data_apple_app_listings_search for the correct tool."
      };
    },
    apiClient
  );

  // NEW: app_data_apple_app_listings_search — correct schema and path
  registerTool(
    server,
    "app_data_apple_app_listings_search",
    z.object({
      categories: z.array(z.string()).optional().describe("Array of app category names to filter by"),
      description: z.string().optional().describe("Text to search within app descriptions"),
      title: z.string().optional().describe("Text to search within app titles"),
      filters: z.array(z.any()).optional().describe("Additional filters as per DataForSEO filter syntax"),
      limit: z.coerce.number().optional().describe("Maximum number of results to return"),
      offset: z.coerce.number().optional().describe("Offset for pagination"),
      order_by: z.array(z.string()).optional().describe("Sorting rules")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/app_data/apple/app_listings/search/live",
        [params]
      );
      return response;
    },
    apiClient
  );

  // ──────────────────────────────────────────────────────────────────
  // DEPRECATED STUB: app_data_app_store_app_info
  // No live endpoint exists for Apple App Info.
  // Use app_data_apple_app_info_post, _ready, _get instead.
  // ──────────────────────────────────────────────────────────────────
  registerTool(
    server,
    "app_data_app_store_app_info",
    z.object({
      app_id: z.string().optional().describe("Deprecated stub"),
      location_name: z.string().optional().describe("Deprecated stub"),
      location_code: z.coerce.number().optional().describe("Deprecated stub"),
      language_name: z.string().optional().describe("Deprecated stub"),
      language_code: z.string().optional().describe("Deprecated stub")
    }),
    async (_params, _client) => {
      return {
        error: "Apple App Info has no live endpoint. Use app_data_apple_app_info_post, then app_data_apple_app_info_ready, then app_data_apple_app_info_get to retrieve results."
      };
    },
    apiClient
  );

  // NEW: task-based Apple App Info
  registerTaskTool(
    server,
    "app_data_apple_app_info",
    z.object({
      app_id: z.string().describe("Apple App Store App ID (numeric or bundle ID)"),
      location_name: z.string().optional().describe("Location name"),
      location_code: z.coerce.number().optional().describe("Location code"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code"),
      priority: z.coerce.number().optional().describe("Task priority (1–2)"),
      postback_url: z.string().optional().describe("URL for postback notification"),
      pingback_url: z.string().optional().describe("URL for pingback notification")
    }),
    async (params, client) => {
      return client.post<DataForSeoResponse<any>>(
        "/app_data/apple/app_info/task_post",
        [params]
      );
    },
    async (client) => {
      return client.get<DataForSeoResponse<any>>("/app_data/apple/app_info/tasks_ready");
    },
    async (id, client) => {
      return client.get<DataForSeoResponse<any>>(
        `/app_data/apple/app_info/task_get/advanced/${id}`
      );
    },
    apiClient
  );

  // ──────────────────────────────────────────────────────────────────
  // DEPRECATED STUB: app_data_app_store_reviews
  // No live endpoint exists + segment is app_reviews (not reviews).
  // Use app_data_apple_app_reviews_post, _ready, _get instead.
  // ──────────────────────────────────────────────────────────────────
  registerTool(
    server,
    "app_data_app_store_reviews",
    z.object({
      app_id: z.string().optional().describe("Deprecated stub"),
      location_name: z.string().optional().describe("Deprecated stub"),
      location_code: z.coerce.number().optional().describe("Deprecated stub"),
      language_name: z.string().optional().describe("Deprecated stub"),
      language_code: z.string().optional().describe("Deprecated stub"),
      depth: z.coerce.number().optional().describe("Deprecated stub"),
      sort_by: z.enum(["most_relevant", "most_recent"]).optional().describe("Deprecated stub"),
      limit: z.coerce.number().optional().describe("Deprecated stub"),
      offset: z.coerce.number().optional().describe("Deprecated stub")
    }),
    async (_params, _client) => {
      return {
        error: "Apple App Reviews has no live endpoint. Use app_data_apple_app_reviews_post, then app_data_apple_app_reviews_ready, then app_data_apple_app_reviews_get. Note: endpoint is 'app_reviews' not 'reviews'."
      };
    },
    apiClient
  );

  // NEW: task-based Apple App Reviews
  registerTaskTool(
    server,
    "app_data_apple_app_reviews",
    z.object({
      app_id: z.string().describe("Apple App Store App ID"),
      location_name: z.string().optional().describe("Location name"),
      location_code: z.coerce.number().optional().describe("Location code"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code"),
      depth: z.coerce.number().optional().describe("Number of reviews to retrieve"),
      sort_by: z.enum(["most_relevant", "most_recent"]).optional().describe("Sorting method"),
      limit: z.coerce.number().optional().describe("Maximum number of results per page"),
      offset: z.coerce.number().optional().describe("Offset for pagination"),
      priority: z.coerce.number().optional().describe("Task priority (1–2)"),
      postback_url: z.string().optional().describe("URL for postback notification"),
      pingback_url: z.string().optional().describe("URL for pingback notification")
    }),
    async (params, client) => {
      return client.post<DataForSeoResponse<any>>(
        "/app_data/apple/app_reviews/task_post",
        [params]
      );
    },
    async (client) => {
      return client.get<DataForSeoResponse<any>>("/app_data/apple/app_reviews/tasks_ready");
    },
    async (id, client) => {
      return client.get<DataForSeoResponse<any>>(
        `/app_data/apple/app_reviews/task_get/advanced/${id}`
      );
    },
    apiClient
  );

  // App Data App Store Locations — already OK per audit, kept as-is
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
      return client.get<DataForSeoResponse<any>>(url);
    },
    apiClient
  );

  // App Data App Store Languages — already OK per audit, kept as-is
  registerTool(
    server,
    "app_data_app_store_languages",
    {},
    async (_params, client) => {
      return client.get<DataForSeoResponse<any>>("/app_data/apple/languages");
    },
    apiClient
  );
}
