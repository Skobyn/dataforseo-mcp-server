import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DataForSeoClient } from "../client.js";
import { registerTool, registerTaskTool } from "../tools.js";
import { DataForSeoResponse } from "../types.js";

export function registerBusinessDataTools(server: McpServer, apiClient: DataForSeoClient) {
  // ─── CORRECT-AS-IS ────────────────────────────────────────────────────────

  // Business Data Google My Business Info  [AUDIT: OK]
  registerTool(
    server,
    "business_data_google_my_business_info",
    z.object({
      keyword: z.string().describe("Business name or related keyword"),
      location_name: z.string().optional().describe("Location name"),
      location_code: z.coerce.number().optional().describe("Location code"),
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

  // Business Data Google Reviews  [AUDIT: OK]
  registerTool(
    server,
    "business_data_google_reviews",
    z.object({
      keyword: z.string().optional().describe("Business name or related keyword"),
      place_id: z.string().optional().describe("Google Place ID"),
      depth: z.coerce.number().optional().describe("Number of reviews to retrieve"),
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

  // Business Data Google Languages  [AUDIT: OK]
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

  // Business Data Business Listings Search  [AUDIT: OK]
  registerTool(
    server,
    "business_data_business_listings_search",
    z.object({
      keyword: z.string().describe("Business name or related keyword"),
      location_name: z.string().optional().describe("Location name"),
      location_code: z.coerce.number().optional().describe("Location code"),
      depth: z.coerce.number().optional().describe("Number of results to return"),
      limit: z.coerce.number().optional().describe("Maximum number of results to return per page"),
      offset: z.coerce.number().optional().describe("Offset for pagination"),
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

  // ─── GOOGLE LOCATIONS FIX ─────────────────────────────────────────────────
  // FIX: country as ISO code path-segment, not query-param; field renamed to country_iso_code.
  // Backward-compat alias `country` is accepted and treated as an ISO code when it
  // looks like one (1–3 alpha chars), mirroring serp_google_locations.
  registerTool(
    server,
    "business_data_google_locations",
    z.object({
      country_iso_code: z.string().optional().describe(
        "ISO country code (e.g. 'us', 'gb'). Appended as a path segment: /business_data/google/locations/<iso>"
      ),
      country: z.string().optional().describe(
        "Deprecated: use country_iso_code instead. Two-letter ISO country code (e.g. 'us')."
      )
    }),
    async (params, client) => {
      const isoCode: string | undefined =
        params.country_iso_code ??
        (params.country && /^[a-zA-Z]{1,3}$/.test(params.country)
          ? params.country
          : undefined);
      const url = isoCode
        ? `/business_data/google/locations/${encodeURIComponent(isoCode.toLowerCase())}`
        : "/business_data/google/locations";
      const response = await client.get<DataForSeoResponse<any>>(url);
      return response;
    },
    apiClient
  );

  // ─── GOOGLE HOTELS FIXES ──────────────────────────────────────────────────

  // FIX: /hotels/search/live → /hotel_searches/live
  registerTool(
    server,
    "business_data_google_hotels_search",
    z.object({
      keyword: z.string().describe("Hotel name or related keyword"),
      location_name: z.string().optional().describe("Location name"),
      location_code: z.coerce.number().optional().describe("Location code"),
      check_in: z.string().optional().describe("Check-in date in YYYY-MM-DD format"),
      check_out: z.string().optional().describe("Check-out date in YYYY-MM-DD format"),
      guests: z.coerce.number().optional().describe("Number of guests"),
      currency: z.string().optional().describe("Currency code"),
      depth: z.coerce.number().optional().describe("Number of results to return"),
      limit: z.coerce.number().optional().describe("Maximum number of results to return per page"),
      offset: z.coerce.number().optional().describe("Offset for pagination"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/business_data/google/hotel_searches/live",
        [params]
      );
      return response;
    },
    apiClient
  );

  // FIX: /hotels/info/live → /hotel_info/live/advanced; hotel_id → hotel_identifier
  registerTool(
    server,
    "business_data_google_hotels_info",
    z.object({
      hotel_identifier: z.string().describe("Google hotel identifier (formerly hotel_id)"),
      location_name: z.string().optional().describe("Location name"),
      location_code: z.coerce.number().optional().describe("Location code"),
      check_in: z.string().optional().describe("Check-in date in YYYY-MM-DD format"),
      check_out: z.string().optional().describe("Check-out date in YYYY-MM-DD format"),
      guests: z.coerce.number().optional().describe("Number of guests"),
      currency: z.string().optional().describe("Currency code"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/business_data/google/hotel_info/live/advanced",
        [params]
      );
      return response;
    },
    apiClient
  );

  // FIX: Deprecated stub — no dedicated Google Hotels Reviews endpoint exists
  registerTool(
    server,
    "business_data_google_hotels_reviews",
    z.object({
      hotel_id: z.string().optional().describe("(deprecated — see error message)")
    }),
    async (_params, _client) => {
      return {
        error: "No dedicated Google Hotels Reviews endpoint exists. Use business_data_google_reviews with keyword/place_id for hotel reviews."
      };
    },
    apiClient
  );

  // ─── TRIPADVISOR — task-based only ────────────────────────────────────────

  // FIX: Deprecated stub for tripadvisor_search live
  registerTool(
    server,
    "business_data_tripadvisor_search",
    z.object({
      keyword: z.string().optional().describe("(deprecated — see error message)")
    }),
    async (_params, _client) => {
      return {
        error: "Tripadvisor Search has no live endpoint. Use business_data_tripadvisor_search_post/ready/get."
      };
    },
    apiClient
  );

  // Tripadvisor Search — task-based
  registerTaskTool(
    server,
    "business_data_tripadvisor_search",
    z.object({
      keyword: z.string().describe("Business name or location keyword"),
      location_name: z.string().optional().describe("Location name"),
      priority: z.coerce.number().min(1).max(2).optional().describe("Priority: 1 (normal) or 2 (high)"),
      depth: z.coerce.number().optional().describe("Number of results to return"),
      limit: z.coerce.number().optional().describe("Maximum number of results to return per page"),
      offset: z.coerce.number().optional().describe("Offset for pagination")
    }),
    async (params, client) => {
      return client.post<DataForSeoResponse<any>>(
        "/business_data/tripadvisor/search/task_post",
        [params]
      );
    },
    async (client) => {
      return client.get<DataForSeoResponse<any>>(
        "/business_data/tripadvisor/search/tasks_ready"
      );
    },
    async (id, client) => {
      return client.get<DataForSeoResponse<any>>(
        `/business_data/tripadvisor/search/task_get/advanced/${id}`
      );
    },
    apiClient
  );

  // FIX: Deprecated stub for tripadvisor_reviews live; field location_id → url_path in task tools
  registerTool(
    server,
    "business_data_tripadvisor_reviews",
    z.object({
      location_id: z.string().optional().describe("(deprecated — see error message)")
    }),
    async (_params, _client) => {
      return {
        error: "Tripadvisor Reviews has no live endpoint. Use business_data_tripadvisor_reviews_post/ready/get."
      };
    },
    apiClient
  );

  // Tripadvisor Reviews — task-based
  registerTaskTool(
    server,
    "business_data_tripadvisor_reviews",
    z.object({
      url_path: z.string().describe("TripAdvisor URL path segment (e.g. Restaurant_Review-g12345-d67890)"),
      depth: z.coerce.number().optional().describe("Number of reviews to retrieve"),
      offset: z.coerce.number().optional().describe("Offset for pagination"),
      sort_by: z.enum(["relevance", "date_of_visit"]).optional().describe("Sorting method"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code")
    }),
    async (params, client) => {
      return client.post<DataForSeoResponse<any>>(
        "/business_data/tripadvisor/reviews/task_post",
        [params]
      );
    },
    async (client) => {
      return client.get<DataForSeoResponse<any>>(
        "/business_data/tripadvisor/reviews/tasks_ready"
      );
    },
    async (id, client) => {
      return client.get<DataForSeoResponse<any>>(
        `/business_data/tripadvisor/reviews/task_get/advanced/${id}`
      );
    },
    apiClient
  );

  // ─── TRUSTPILOT — task-based only ────────────────────────────────────────

  // FIX: Deprecated stub for trustpilot_search live
  registerTool(
    server,
    "business_data_trustpilot_search",
    z.object({
      keyword: z.string().optional().describe("(deprecated — see error message)")
    }),
    async (_params, _client) => {
      return {
        error: "Trustpilot Search has no live endpoint. Use business_data_trustpilot_search_post/ready/get."
      };
    },
    apiClient
  );

  // Trustpilot Search — task-based
  registerTaskTool(
    server,
    "business_data_trustpilot_search",
    z.object({
      keyword: z.string().describe("Business name or domain keyword"),
      location_name: z.string().optional().describe("Location name"),
      depth: z.coerce.number().optional().describe("Number of results to return"),
      limit: z.coerce.number().optional().describe("Maximum number of results to return per page"),
      offset: z.coerce.number().optional().describe("Offset for pagination"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code")
    }),
    async (params, client) => {
      return client.post<DataForSeoResponse<any>>(
        "/business_data/trustpilot/search/task_post",
        [params]
      );
    },
    async (client) => {
      return client.get<DataForSeoResponse<any>>(
        "/business_data/trustpilot/search/tasks_ready"
      );
    },
    async (id, client) => {
      return client.get<DataForSeoResponse<any>>(
        `/business_data/trustpilot/search/task_get/advanced/${id}`
      );
    },
    apiClient
  );

  // FIX: Deprecated stub for trustpilot_reviews live
  registerTool(
    server,
    "business_data_trustpilot_reviews",
    z.object({
      domain: z.string().optional().describe("(deprecated — see error message)")
    }),
    async (_params, _client) => {
      return {
        error: "Trustpilot Reviews has no live endpoint. Use business_data_trustpilot_reviews_post/ready/get."
      };
    },
    apiClient
  );

  // Trustpilot Reviews — task-based
  registerTaskTool(
    server,
    "business_data_trustpilot_reviews",
    z.object({
      domain: z.string().describe("Business domain (e.g. example.com)"),
      depth: z.coerce.number().optional().describe("Number of reviews to retrieve"),
      offset: z.coerce.number().optional().describe("Offset for pagination"),
      limit: z.coerce.number().optional().describe("Maximum number of results to return per page"),
      sort_by: z.enum(["recency", "relevance"]).optional().describe("Sorting method"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code")
    }),
    async (params, client) => {
      return client.post<DataForSeoResponse<any>>(
        "/business_data/trustpilot/reviews/task_post",
        [params]
      );
    },
    async (client) => {
      return client.get<DataForSeoResponse<any>>(
        "/business_data/trustpilot/reviews/tasks_ready"
      );
    },
    async (id, client) => {
      return client.get<DataForSeoResponse<any>>(
        `/business_data/trustpilot/reviews/task_get/advanced/${id}`
      );
    },
    apiClient
  );

  // ─── FACEBOOK — NOT SUPPORTED ────────────────────────────────────────────

  // FIX: Facebook is not supported — deprecation stub
  registerTool(
    server,
    "business_data_facebook_search",
    z.object({
      keyword: z.string().optional().describe("(deprecated — see error message)")
    }),
    async (_params, _client) => {
      return {
        error: "Facebook is not supported by DataForSEO Business Data. Supported platforms are Pinterest and Reddit via business_data_social_media_pinterest and business_data_social_media_reddit."
      };
    },
    apiClient
  );

  registerTool(
    server,
    "business_data_facebook_overview",
    z.object({
      id: z.string().optional().describe("(deprecated — see error message)")
    }),
    async (_params, _client) => {
      return {
        error: "Facebook is not supported by DataForSEO Business Data. Supported platforms are Pinterest and Reddit via business_data_social_media_pinterest and business_data_social_media_reddit."
      };
    },
    apiClient
  );

  // ─── PINTEREST (old) — deprecated stubs ──────────────────────────────────

  registerTool(
    server,
    "business_data_pinterest_search",
    z.object({
      keyword: z.string().optional().describe("(deprecated — see error message)")
    }),
    async (_params, _client) => {
      return {
        error: "Use business_data_social_media_pinterest_live with a targets array of URLs to get pin counts. The old search-based schema does not match the DataForSEO API."
      };
    },
    apiClient
  );

  registerTool(
    server,
    "business_data_pinterest_info",
    z.object({
      url: z.string().optional().describe("(deprecated — see error message)")
    }),
    async (_params, _client) => {
      return {
        error: "Use business_data_social_media_pinterest_live with a targets array of URLs to get pin counts. The old search-based schema does not match the DataForSEO API."
      };
    },
    apiClient
  );

  // ─── REDDIT (old) — deprecated stubs ─────────────────────────────────────

  registerTool(
    server,
    "business_data_reddit_search",
    z.object({
      keyword: z.string().optional().describe("(deprecated — see error message)")
    }),
    async (_params, _client) => {
      return {
        error: "Use business_data_social_media_reddit_live with a targets array of URLs. The old search-based schema does not match the DataForSEO API."
      };
    },
    apiClient
  );

  registerTool(
    server,
    "business_data_reddit_info",
    z.object({
      url: z.string().optional().describe("(deprecated — see error message)")
    }),
    async (_params, _client) => {
      return {
        error: "Use business_data_social_media_reddit_live with a targets array of URLs. The old search-based schema does not match the DataForSEO API."
      };
    },
    apiClient
  );

  // ─── NEW: Social Media Pinterest Live ────────────────────────────────────
  // POST /business_data/social_media/pinterest/live
  // Schema: targets array of URLs (1–10)
  registerTool(
    server,
    "business_data_social_media_pinterest_live",
    z.object({
      targets: z.array(z.string()).min(1).max(10).describe(
        "Array of 1–10 URLs to retrieve Pinterest pin counts for"
      )
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/business_data/social_media/pinterest/live",
        [params]
      );
      return response;
    },
    apiClient
  );

  // ─── NEW: Social Media Reddit Live ───────────────────────────────────────
  // POST /business_data/social_media/reddit/live
  // Schema: targets array of URLs (1–10)
  registerTool(
    server,
    "business_data_social_media_reddit_live",
    z.object({
      targets: z.array(z.string()).min(1).max(10).describe(
        "Array of 1–10 URLs to retrieve Reddit interaction data for"
      )
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/business_data/social_media/reddit/live",
        [params]
      );
      return response;
    },
    apiClient
  );

  // ─── BUSINESS LISTINGS FIXES ──────────────────────────────────────────────

  // FIX: Remove country query param — docs show bare GET only.
  // The `country` field is kept for backward compat but is a no-op (not sent to URL).
  /** @deprecated country param is a no-op; the API does not accept a country filter */
  registerTool(
    server,
    "business_data_business_listings_categories",
    z.object({
      /** @deprecated No-op. The categories endpoint does not accept a country filter. */
      country: z.string().optional().describe(
        "(deprecated, no-op) The categories endpoint does not accept a country filter."
      )
    }),
    async (_params, client) => {
      // country is intentionally not sent to the URL
      const response = await client.get<DataForSeoResponse<any>>(
        "/business_data/business_listings/categories"
      );
      return response;
    },
    apiClient
  );

  // FIX: Remove country query param — docs show bare GET only.
  /** @deprecated country param is a no-op; use the bare endpoint */
  registerTool(
    server,
    "business_data_business_listings_locations",
    z.object({
      /** @deprecated No-op. The locations endpoint does not accept a country query param. */
      country: z.string().optional().describe(
        "(deprecated, no-op) The locations endpoint does not accept a country filter."
      )
    }),
    async (_params, client) => {
      // country is intentionally not sent to the URL
      const response = await client.get<DataForSeoResponse<any>>(
        "/business_data/business_listings/locations"
      );
      return response;
    },
    apiClient
  );
}
