import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DataForSeoClient } from "../client.js";
import { registerTool } from "../tools.js";
import { DataForSeoResponse } from "../types.js";

export function registerKeywordsTools(server: McpServer, apiClient: DataForSeoClient) {
  // Google Ads Keywords Data
  // FIX (HIGH): Audit found wrapper sent `keyword` (string) but API requires
  // `keywords` (array, up to 20 items).  We now accept BOTH for backward
  // compatibility: if `keyword` is provided it is wrapped in an array and sent
  // as `keywords`; if `keywords` array is provided it is used as-is.
  // At least one of the two must be supplied — validated at runtime.
  registerTool(
    server,
    "keywords_google_ads_keywords_for_keyword",
    z.object({
      keyword: z.string().optional().describe(
        "Single keyword to get data for (backward-compat). Internally wrapped into the `keywords` array."
      ),
      keywords: z.array(z.string()).optional().describe(
        "Array of up to 20 keywords to get data for (preferred, docs-correct field)."
      ),
      location_code: z.coerce.number().optional().describe("The location code for the search"),
      language_code: z.string().optional().describe("The language code for the search"),
    }),
    async (params, client) => {
      // Validate: at least one keyword source must be provided
      if (!params.keyword && (!params.keywords || params.keywords.length === 0)) {
        return { error: "At least one of `keyword` or `keywords` must be provided." };
      }

      // Build docs-correct payload: always send `keywords` array
      const { keyword, keywords, ...rest } = params;
      const keywordsArray: string[] = keywords && keywords.length > 0
        ? keywords
        : [keyword as string];

      // Enforce the documented limit at runtime. Inputs can reach this handler
      // without Zod parsing (e.g. via the HTTP bridge), so the schema constraint
      // alone is not guaranteed — guard here to avoid a rejected API request.
      if (keywordsArray.length > 20) {
        return { error: "`keywords` accepts at most 20 items per the DataForSEO Google Ads API." };
      }

      const response = await client.post<DataForSeoResponse<any>>(
        "/keywords_data/google_ads/keywords_for_keywords/live",
        [{ ...rest, keywords: keywordsArray }]
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
      location_code: z.coerce.number().optional().describe("The location code for the search"),
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
      location_code: z.coerce.number().optional().describe("The location code for the search"),
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
  // FIX (LOW): Added .max(5) guard per docs — the API rejects arrays with >5 keywords.
  registerTool(
    server,
    "keywords_google_trends_explore",
    z.object({
      keywords: z.array(z.string()).max(5).describe("Keywords to explore (max 5 per docs)"),
      location_code: z.coerce.number().optional().describe("The location code for the search"),
      language_code: z.string().optional().describe("The language code for the search"),
      date_from: z.string().optional().describe("Start date in YYYY-MM-DD format"),
      date_to: z.string().optional().describe("End date in YYYY-MM-DD format"),
      category_code: z.coerce.number().optional().describe("Google Trends category code")
    }),
    async (params, client) => {
      // Enforce the documented limit at runtime. Inputs can reach this handler
      // without Zod parsing (e.g. via the HTTP bridge), so the schema's max(5)
      // alone is not guaranteed — guard here to avoid a rejected API request.
      if (params.keywords && params.keywords.length > 5) {
        return { error: "`keywords` accepts at most 5 items per the DataForSEO Google Trends API." };
      }

      const response = await client.post<DataForSeoResponse<any>>(
        "/keywords_data/google_trends/explore/live",
        [params]
      );

      return response;
    },
    apiClient
  );

  // Bing Keyword Data
  // FIX (HIGH): Same as keywords_google_ads_keywords_for_keyword — wrapper was
  // sending `keyword` (string) but Bing API requires `keywords` array (up to 200).
  // Accept both; wrap single keyword into array when needed.
  registerTool(
    server,
    "keywords_bing_keywords_for_keywords",
    z.object({
      keyword: z.string().optional().describe(
        "Single keyword to get data for (backward-compat). Internally wrapped into the `keywords` array."
      ),
      keywords: z.array(z.string()).optional().describe(
        "Array of up to 200 keywords to get data for (preferred, docs-correct field)."
      ),
      location_code: z.coerce.number().optional().describe("The location code for the search"),
      language_code: z.string().optional().describe("The language code for the search"),
    }),
    async (params, client) => {
      // Validate: at least one keyword source must be provided
      if (!params.keyword && (!params.keywords || params.keywords.length === 0)) {
        return { error: "At least one of `keyword` or `keywords` must be provided." };
      }

      // Build docs-correct payload: always send `keywords` array
      const { keyword, keywords, ...rest } = params;
      const keywordsArray: string[] = keywords && keywords.length > 0
        ? keywords
        : [keyword as string];

      // Enforce the documented limit at runtime. Inputs can reach this handler
      // without Zod parsing (e.g. via the HTTP bridge), so the schema constraint
      // alone is not guaranteed — guard here to avoid a rejected API request.
      if (keywordsArray.length > 200) {
        return { error: "`keywords` accepts at most 200 items per the DataForSEO Bing API." };
      }

      const response = await client.post<DataForSeoResponse<any>>(
        "/keywords_data/bing/keywords_for_keywords/live",
        [{ ...rest, keywords: keywordsArray }]
      );

      return response;
    },
    apiClient
  );
}
