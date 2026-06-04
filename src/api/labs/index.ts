import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DataForSeoClient } from "../client.js";
import { registerTool } from "../tools.js";
import { DataForSeoResponse } from "../types.js";

// DataForSEO Labs API schemas
const keywordResearchBaseSchema = z.object({
  keyword: z.string().describe("Keyword(s) to research"),
  location_code: z.coerce.number().optional().describe("The location code for the search"),
  language_code: z.string().optional().describe("The language code for the search"),
  limit: z.coerce.number().optional().describe("Maximum number of results to return"),
  offset: z.coerce.number().optional().describe("Offset for pagination"),
  include_seed_keyword: z.boolean().optional().describe("Include the seed keyword in the results")
});

const domainResearchBaseSchema = z.object({
  target: z.string().describe("Target domain name"),
  location_code: z.coerce.number().optional().describe("The location code for the search"),
  language_code: z.string().optional().describe("The language code for the search"),
  limit: z.coerce.number().optional().describe("Maximum number of results to return"),
  offset: z.coerce.number().optional().describe("Offset for pagination")
});

/**
 * Engine enum used by meta endpoints (labs_categories, labs_locations,
 * labs_languages, labs_available_history).
 *
 * FIX (MEDIUM): Old enum included 'google_play' and 'app_store' which do NOT
 * match DataForSEO's actual URL segments.  The correct segments are 'google'
 * (for Google Play) and 'apple' (for App Store).
 *
 * Accepted values include the deprecated aliases 'google_play' and 'app_store'
 * for backward compatibility. The mapping is applied in each handler via
 * normalizeEngine() because the MCP framework passes raw params without running
 * them through Zod transforms.
 *
 * @deprecated Passing 'google_play' is deprecated — use 'google' instead.
 * @deprecated Passing 'app_store' is deprecated — use 'apple' instead.
 */
const engineEnum = z
  .enum(["google", "amazon", "bing", "apple", "google_play", "app_store"])
  .describe(
    "Engine name. Use 'google' (also covers Google Play) or 'apple' (also covers App Store). " +
    "Values 'google_play' and 'app_store' are deprecated aliases and will be mapped automatically."
  );

/**
 * Maps deprecated engine alias values to their correct DataForSEO URL segments.
 *   'google_play' → 'google'
 *   'app_store'   → 'apple'
 * All other values are returned unchanged.
 */
function normalizeEngine(engine: string): string {
  if (engine === "google_play") return "google";
  if (engine === "app_store") return "apple";
  return engine;
}

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
      location_code: z.coerce.number().optional().describe("The location code for the search"),
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
      location_code: z.coerce.number().optional().describe("The location code for the search"),
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
      location_code: z.coerce.number().optional().describe("The location code for the search"),
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
  // NOTE (LOW): 'domains' array param may need to be 'targets' object per docs.
  // Leave as-is per audit instructions; needs live verification.
  registerTool(
    server,
    "labs_google_domain_intersection",
    z.object({
      domains: z.array(z.string()).min(2).max(20).describe("Domains to compare"),
      location_code: z.coerce.number().optional().describe("The location code for the search"),
      language_code: z.string().optional().describe("The language code for the search"),
      limit: z.coerce.number().optional().describe("Maximum number of results to return"),
      offset: z.coerce.number().optional().describe("Offset for pagination"),
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
      location_code: z.coerce.number().optional().describe("The location code for the search"),
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
      location_code: z.coerce.number().optional().describe("The location code for the search"),
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
  // NOTE: `marketplace` is not a documented DataForSEO field for this endpoint.
  // Use `location_code` instead.
  /** @deprecated marketplace is not a documented DataForSEO field. Use location_code instead. */
  registerTool(
    server,
    "labs_amazon_related_keywords",
    keywordResearchBaseSchema.extend({
      marketplace: z.string().optional().describe(
        "@deprecated Not a documented DataForSEO field — use location_code instead."
      )
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
  // NOTE: `marketplace` is not a documented DataForSEO field.  Use location_code instead.
  /** @deprecated marketplace is not a documented DataForSEO field. Use location_code instead. */
  registerTool(
    server,
    "labs_amazon_ranked_keywords",
    z.object({
      target: z.string().describe("Target ASIN or Amazon domain"),
      marketplace: z.string().optional().describe(
        "@deprecated Not a documented DataForSEO field — use location_code instead."
      ),
      location_code: z.coerce.number().optional().describe("The location code for the search"),
      language_code: z.string().optional().describe("The language code for the search"),
      limit: z.coerce.number().optional().describe("Maximum number of results to return"),
      offset: z.coerce.number().optional().describe("Offset for pagination"),
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
  // NOTE: `marketplace` is not a documented DataForSEO field.  Use location_code instead.
  /** @deprecated marketplace is not a documented DataForSEO field. Use location_code instead. */
  registerTool(
    server,
    "labs_amazon_product_competitors",
    z.object({
      asin: z.string().describe("Target Amazon ASIN"),
      marketplace: z.string().optional().describe(
        "@deprecated Not a documented DataForSEO field — use location_code instead."
      ),
      location_code: z.coerce.number().optional().describe("The location code for the search"),
      language_code: z.string().optional().describe("The language code for the search"),
      limit: z.coerce.number().optional().describe("Maximum number of results to return"),
      offset: z.coerce.number().optional().describe("Offset for pagination")
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
  // FIX (CRITICAL): Was using wrong engine segment 'google_play'. Correct path
  // uses 'google' — /dataforseo_labs/google/keywords_for_app/live.
  registerTool(
    server,
    "labs_google_play_keywords_for_app",
    z.object({
      app_id: z.string().describe("Google Play app ID"),
      location_code: z.coerce.number().optional().describe("The location code for the search"),
      language_code: z.string().optional().describe("The language code for the search"),
      limit: z.coerce.number().optional().describe("Maximum number of results to return"),
      offset: z.coerce.number().optional().describe("Offset for pagination")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/google/keywords_for_app/live",
        [params]
      );

      return response;
    },
    apiClient
  );

  // Google Play Ranked Apps — DEPRECATED STUB
  // FIX: This endpoint does not exist in DataForSEO Labs Google Play (or Google).
  // Official available endpoints: app_competitors, keywords_for_app,
  // bulk_app_metrics, app_intersection. Returning a helpful error instead of
  // hitting a guaranteed-404 path.
  registerTool(
    server,
    "labs_google_play_ranked_apps",
    z.object({
      keyword: z.string().optional().describe("(Unused — tool is deprecated)"),
    }),
    async (_params, _client) => {
      return {
        error:
          "ranked_apps is not an endpoint in DataForSEO Labs Google Play. " +
          "Available: app_competitors, keywords_for_app, bulk_app_metrics, app_intersection."
      };
    },
    apiClient
  );

  // Google Play App Competitors
  // FIX (CRITICAL): Was using wrong engine segment 'google_play'. Correct path
  // uses 'google' — /dataforseo_labs/google/app_competitors/live.
  registerTool(
    server,
    "labs_google_play_app_competitors",
    z.object({
      app_id: z.string().describe("Google Play app ID"),
      location_code: z.coerce.number().optional().describe("The location code for the search"),
      language_code: z.string().optional().describe("The language code for the search"),
      limit: z.coerce.number().optional().describe("Maximum number of results to return"),
      offset: z.coerce.number().optional().describe("Offset for pagination")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/google/app_competitors/live",
        [params]
      );

      return response;
    },
    apiClient
  );

  // App Store Keywords for App
  // FIX (CRITICAL): Was using wrong engine segment 'app_store'. Correct path
  // uses 'apple' — /dataforseo_labs/apple/keywords_for_app/live.
  registerTool(
    server,
    "labs_app_store_keywords_for_app",
    z.object({
      app_id: z.string().describe("App Store app ID"),
      location_code: z.coerce.number().optional().describe("The location code for the search"),
      language_code: z.string().optional().describe("The language code for the search"),
      limit: z.coerce.number().optional().describe("Maximum number of results to return"),
      offset: z.coerce.number().optional().describe("Offset for pagination")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/apple/keywords_for_app/live",
        [params]
      );

      return response;
    },
    apiClient
  );

  // App Store Ranked Apps — DEPRECATED STUB
  // FIX: This endpoint does not exist in DataForSEO Labs App Store (apple).
  // Official available endpoints: app_competitors, keywords_for_app,
  // bulk_app_metrics, app_intersection. Returning a helpful error.
  registerTool(
    server,
    "labs_app_store_ranked_apps",
    z.object({
      keyword: z.string().optional().describe("(Unused — tool is deprecated)"),
    }),
    async (_params, _client) => {
      return {
        error:
          "ranked_apps is not an endpoint in DataForSEO Labs App Store (Apple). " +
          "Available: app_competitors, keywords_for_app, bulk_app_metrics, app_intersection."
      };
    },
    apiClient
  );

  // App Store App Competitors
  // FIX (CRITICAL): Was using wrong engine segment 'app_store'. Correct path
  // uses 'apple' — /dataforseo_labs/apple/app_competitors/live.
  registerTool(
    server,
    "labs_app_store_app_competitors",
    z.object({
      app_id: z.string().describe("App Store app ID"),
      location_code: z.coerce.number().optional().describe("The location code for the search"),
      language_code: z.string().optional().describe("The language code for the search"),
      limit: z.coerce.number().optional().describe("Maximum number of results to return"),
      offset: z.coerce.number().optional().describe("Offset for pagination")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/dataforseo_labs/apple/app_competitors/live",
        [params]
      );

      return response;
    },
    apiClient
  );

  // === META ENDPOINTS FOR LABS API ===

  // Categories
  // FIX (MEDIUM): Updated engine enum — removed 'google_play'/'app_store' as
  // valid values (they cause 404s); added backward-compat .transform() that maps
  // old values to their correct path segments automatically.
  registerTool(
    server,
    "labs_categories",
    z.object({
      engine: engineEnum,
      category_code: z.coerce.number().optional().describe("Parent category code"),
      language_code: z.string().optional().describe("Language code")
    }),
    async (params, client) => {
      const url = `/dataforseo_labs/${normalizeEngine(params.engine)}/categories`;
      const queryParams: string[] = [];

      if (params.category_code) {
        queryParams.push(`category_code=${params.category_code}`);
      }

      if (params.language_code) {
        queryParams.push(`language_code=${params.language_code}`);
      }

      const fullUrl = queryParams.length > 0 ? `${url}?${queryParams.join("&")}` : url;
      const response = await client.get<DataForSeoResponse<any>>(fullUrl);

      return response;
    },
    apiClient
  );

  // Locations
  // FIX (MEDIUM): Same engine enum fix as labs_categories.
  registerTool(
    server,
    "labs_locations",
    z.object({
      engine: engineEnum,
      country: z.string().optional().describe("Filter locations by country name")
    }),
    async (params, client) => {
      const url = `/dataforseo_labs/${normalizeEngine(params.engine)}/locations`;
      const queryParams: string[] = [];

      if (params.country) {
        queryParams.push(`country=${encodeURIComponent(params.country)}`);
      }

      const fullUrl = queryParams.length > 0 ? `${url}?${queryParams.join("&")}` : url;
      const response = await client.get<DataForSeoResponse<any>>(fullUrl);

      return response;
    },
    apiClient
  );

  // Languages
  // FIX (MEDIUM): Same engine enum fix as labs_categories.
  registerTool(
    server,
    "labs_languages",
    z.object({
      engine: engineEnum
    }),
    async (params, client) => {
      const url = `/dataforseo_labs/${normalizeEngine(params.engine)}/languages`;
      const response = await client.get<DataForSeoResponse<any>>(url);

      return response;
    },
    apiClient
  );

  // Available History
  // FIX (MEDIUM): Same engine enum fix as labs_categories.
  registerTool(
    server,
    "labs_available_history",
    z.object({
      engine: engineEnum,
      function: z.string().describe("Function name (e.g., keywords_for_site, serp)")
    }),
    async (params, client) => {
      const url = `/dataforseo_labs/${normalizeEngine(params.engine)}/available_history/${params.function}`;
      const response = await client.get<DataForSeoResponse<any>>(url);

      return response;
    },
    apiClient
  );
}
