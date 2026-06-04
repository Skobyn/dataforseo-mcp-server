import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DataForSeoClient } from "../client.js";
import { registerTool, registerTaskTool } from "../tools.js";
import {
  DataForSeoResponse,
  TaskPostResponse,
  TaskReadyResponse,
  TaskGetResponse
} from "../types.js";

// SERP Google Organic API schemas
// FIX: z.coerce.number() for all MCP-exposed numeric input fields so the MCP bridge's
//      stringified numbers coerce to integers correctly.
const googleOrganicLiveSchema = z.object({
  keyword: z.string().describe("The search query or keyword"),
  location_code: z.coerce.number().describe("The location code for the search"),
  language_code: z.string().describe("The language code for the search"),
  device: z.enum(["desktop", "mobile", "tablet"]).optional().describe("The device type for the search"),
  os: z.enum(["windows", "macos", "ios", "android"]).optional().describe("The operating system for the search"),
  depth: z.coerce.number().optional().describe("Maximum number of results to return"),
  se_domain: z.string().optional().describe("Search engine domain (e.g., google.com)")
});

const googleOrganicTaskSchema = googleOrganicLiveSchema.extend({
  priority: z.coerce.number().min(1).max(2).optional().describe("Task priority: 1 (normal) or 2 (high)"),
  tag: z.string().optional().describe("Custom identifier for the task"),
  postback_url: z.string().optional().describe("URL to receive a callback when the task is completed"),
  postback_data: z.string().optional().describe("Custom data to be passed in the callback")
});

// Google Organic Types
interface GoogleOrganicLiveResult {
  keyword: string;
  type: string;
  se_domain: string;
  location_code: number;
  language_code: string;
  items: any[];
  // ... other fields
}

interface GoogleOrganicTaskResult {
  keyword: string;
  se_domain: string;
  check_url: string;
  datetime: string;
  items: any[];
  // ... other fields
}

export function registerSerpTools(server: McpServer, apiClient: DataForSeoClient) {
  // Google Organic Live
  // FIX: path was /serp/google/organic/live → /serp/google/organic/live/advanced
  registerTool(
    server,
    "serp_google_organic_live",
    googleOrganicLiveSchema,
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<GoogleOrganicLiveResult>>(
        "/serp/google/organic/live/advanced",
        [params]
      );

      return response;
    },
    apiClient
  );

  // Google Organic Task-based (POST, READY, GET)
  // FIX: task_get path was /serp/google/organic/task_get/${id}
  //      → /serp/google/organic/task_get/advanced/${id}
  registerTaskTool(
    server,
    "serp_google_organic_task",
    googleOrganicTaskSchema,
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<TaskPostResponse>>(
        "/serp/google/organic/task_post",
        [params]
      );

      return response;
    },
    async (client) => {
      const response = await client.get<DataForSeoResponse<TaskReadyResponse>>(
        "/serp/google/organic/tasks_ready"
      );

      return response;
    },
    async (id, client) => {
      const response = await client.get<DataForSeoResponse<TaskGetResponse<GoogleOrganicTaskResult>>>(
        `/serp/google/organic/task_get/advanced/${id}`
      );

      return response;
    },
    apiClient
  );

  // Google Maps Live — path already correct (/serp/google/maps/live/advanced)
  // FIX: location_code coercion
  registerTool(
    server,
    "serp_google_maps_live",
    googleOrganicLiveSchema.extend({
      location_name: z.string().optional().describe("Full name of the location (e.g., 'London,England,United Kingdom')"),
      location_code: z.coerce.number().optional().describe("The location code for the search (optional if location_coordinate provided)"),
      location_coordinate: z.string().optional().describe("GPS coordinates as 'latitude,longitude,zoom' (e.g., '51.5074,-0.1278,15z'). Use for point-specific rankings."),
      search_this_area: z.boolean().optional().describe("Restrict results to the displayed map area"),
      local_pack_type: z.enum(["maps", "local_pack"]).optional().describe("Type of local pack results")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/serp/google/maps/live/advanced",
        [params]
      );

      return response;
    },
    apiClient
  );

  // Google Images Live
  // FIX: path was /serp/google/images/live → /serp/google/images/live/advanced
  registerTool(
    server,
    "serp_google_images_live",
    googleOrganicLiveSchema,
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/serp/google/images/live/advanced",
        [params]
      );

      return response;
    },
    apiClient
  );

  // Google News Live
  // FIX: path was /serp/google/news/live → /serp/google/news/live/advanced
  registerTool(
    server,
    "serp_google_news_live",
    googleOrganicLiveSchema,
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/serp/google/news/live/advanced",
        [params]
      );

      return response;
    },
    apiClient
  );

  // ---------------------------------------------------------------------------
  // Google Jobs — no live endpoint exists; replaced with task-based tools.
  // New tools: serp_google_jobs_task_post, serp_google_jobs_task_ready,
  //            serp_google_jobs_task_get (additive)
  // FIX: keep old name serp_google_jobs_live as a friendly-error stub for
  //      backward compat with existing MCP clients.
  // ---------------------------------------------------------------------------
  registerTool(
    server,
    "serp_google_jobs_live",
    googleOrganicLiveSchema,
    async (_params, _client) => {
      return {
        error:
          "SERP Google Jobs live endpoint does not exist. Use serp_google_jobs_task_post " +
          "(+ serp_google_jobs_task_ready / serp_google_jobs_task_get) for Google Jobs data."
      };
    },
    apiClient
  );

  registerTaskTool(
    server,
    "serp_google_jobs_task",
    googleOrganicLiveSchema,
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<TaskPostResponse>>(
        "/serp/google/jobs/task_post",
        [params]
      );
      return response;
    },
    async (client) => {
      const response = await client.get<DataForSeoResponse<TaskReadyResponse>>(
        "/serp/google/jobs/tasks_ready"
      );
      return response;
    },
    async (id, client) => {
      const response = await client.get<DataForSeoResponse<TaskGetResponse<any>>>(
        `/serp/google/jobs/task_get/advanced/${id}`
      );
      return response;
    },
    apiClient
  );

  // ---------------------------------------------------------------------------
  // Google Shopping — belongs to the Merchant API; no SERP path exists.
  // FIX: keep old name serp_google_shopping_live as a friendly-error stub.
  // ---------------------------------------------------------------------------
  registerTool(
    server,
    "serp_google_shopping_live",
    googleOrganicLiveSchema,
    async (_params, _client) => {
      return {
        error:
          "SERP Google Shopping does not exist. Use merchant_google_products_task_post " +
          "(from the merchant module) for Google Shopping data."
      };
    },
    apiClient
  );

  // Bing Organic Live
  // FIX: path was /serp/bing/organic/live → /serp/bing/organic/live/advanced
  registerTool(
    server,
    "serp_bing_organic_live",
    googleOrganicLiveSchema,
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/serp/bing/organic/live/advanced",
        [params]
      );

      return response;
    },
    apiClient
  );

  // Yahoo Organic Live
  // FIX: path was /serp/yahoo/organic/live → /serp/yahoo/organic/live/advanced
  registerTool(
    server,
    "serp_yahoo_organic_live",
    googleOrganicLiveSchema,
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/serp/yahoo/organic/live/advanced",
        [params]
      );

      return response;
    },
    apiClient
  );

  // ---------------------------------------------------------------------------
  // Baidu Organic — no live endpoint exists; replaced with task-based tools.
  // New tools: serp_baidu_organic_task_post, serp_baidu_organic_task_ready,
  //            serp_baidu_organic_task_get (additive)
  // FIX: keep old name serp_baidu_organic_live as a friendly-error stub.
  // ---------------------------------------------------------------------------
  registerTool(
    server,
    "serp_baidu_organic_live",
    googleOrganicLiveSchema,
    async (_params, _client) => {
      return {
        error:
          "SERP Baidu Organic live endpoint does not exist. Use serp_baidu_organic_task_post " +
          "(+ serp_baidu_organic_task_ready / serp_baidu_organic_task_get) for Baidu Organic data."
      };
    },
    apiClient
  );

  registerTaskTool(
    server,
    "serp_baidu_organic_task",
    googleOrganicLiveSchema,
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<TaskPostResponse>>(
        "/serp/baidu/organic/task_post",
        [params]
      );
      return response;
    },
    async (client) => {
      const response = await client.get<DataForSeoResponse<TaskReadyResponse>>(
        "/serp/baidu/organic/tasks_ready"
      );
      return response;
    },
    async (id, client) => {
      const response = await client.get<DataForSeoResponse<TaskGetResponse<any>>>(
        `/serp/baidu/organic/task_get/advanced/${id}`
      );
      return response;
    },
    apiClient
  );

  // YouTube Organic Live
  // FIX: path was /serp/youtube/organic/live → /serp/youtube/organic/live/advanced
  registerTool(
    server,
    "serp_youtube_organic_live",
    googleOrganicLiveSchema,
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/serp/youtube/organic/live/advanced",
        [params]
      );

      return response;
    },
    apiClient
  );

  // SERP API Locations
  // FIX: was GET /serp/google/locations?country=<name> (query string + country name)
  //      → GET /serp/google/locations/<iso_code> if ISO code provided,
  //        else GET /serp/google/locations
  // Schema field renamed from `country` to `country_iso_code`; backward-compat
  // alias `country` is accepted and treated as iso_code when it looks like one
  // (1–3 lowercase/uppercase letters), otherwise ignored.
  //
  // Note: we use a plain ZodObject (no .transform()) because registerTool only
  // accepts ZodObject<T> | ZodRawShape.  The coercion logic lives in the handler.
  registerTool(
    server,
    "serp_google_locations",
    z.object({
      country_iso_code: z
        .string()
        .optional()
        .describe("Two-letter ISO country code (e.g., 'us', 'ro'). Omit for the full list."),
      // backward-compat alias
      country: z
        .string()
        .optional()
        .describe(
          "Deprecated: use country_iso_code instead. Two-letter ISO country code (e.g., 'us')."
        )
    }),
    async (params, client) => {
      // Resolve which iso code to use.
      // Prefer country_iso_code; fall back to `country` if it looks like an ISO
      // code (≤3 alpha chars), otherwise ignore it.
      const isoCode: string | undefined =
        params.country_iso_code ??
        (params.country && /^[a-zA-Z]{1,3}$/.test(params.country)
          ? params.country
          : undefined);

      const url = isoCode
        ? `/serp/google/locations/${encodeURIComponent(isoCode.toLowerCase())}`
        : "/serp/google/locations";

      const response = await client.get<DataForSeoResponse<any>>(url);

      return response;
    },
    apiClient
  );

  // SERP API Languages — path already correct
  registerTool(
    server,
    "serp_google_languages",
    {},
    async (_params, client) => {
      const response = await client.get<DataForSeoResponse<any>>("/serp/google/languages");

      return response;
    },
    apiClient
  );
}
