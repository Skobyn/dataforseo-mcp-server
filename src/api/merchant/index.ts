import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DataForSeoClient } from "../client.js";
import { registerTool, registerTaskTool } from "../tools.js";
import { DataForSeoResponse } from "../types.js";

export function registerMerchantTools(server: McpServer, apiClient: DataForSeoClient) {

  // ---------------------------------------------------------------------------
  // DEPRECATED STUBS — endpoints that do not exist in the DataForSEO API
  // ---------------------------------------------------------------------------

  // merchant_google_search — /merchant/google/search/live does NOT exist
  registerTool(
    server,
    "merchant_google_search",
    z.object({}),
    async (_params, _client) => ({
      error:
        "No /merchant/google/search live endpoint. Use merchant_google_products_task_post/ready/get for Google Shopping product search by keyword."
    }),
    apiClient
  );

  // merchant_google_product_specs — phantom endpoint, no real DataForSEO path
  registerTool(
    server,
    "merchant_google_product_specs",
    z.object({}),
    async (_params, _client) => ({
      error:
        "merchant_google_product_specs is not a real DataForSEO endpoint. See /merchant/google/product_info/task_post for product details."
    }),
    apiClient
  );

  // merchant_google_product_info (live) — /merchant/google/product_info/live does NOT exist
  registerTool(
    server,
    "merchant_google_product_info",
    z.object({}),
    async (_params, _client) => ({
      error:
        "No live variant for product_info. Use merchant_google_product_info_task_post/ready/get."
    }),
    apiClient
  );

  // merchant_google_sellers (live) — /merchant/google/sellers/live does NOT exist
  registerTool(
    server,
    "merchant_google_sellers",
    z.object({}),
    async (_params, _client) => ({
      error:
        "No live variant for sellers. Use merchant_google_sellers_task_post/ready/get."
    }),
    apiClient
  );

  // merchant_google_reviews (live) — /merchant/google/reviews/live does NOT exist
  registerTool(
    server,
    "merchant_google_reviews",
    z.object({}),
    async (_params, _client) => ({
      error:
        "No live variant for reviews. Use merchant_google_reviews_task_post/ready/get."
    }),
    apiClient
  );

  // merchant_amazon_search — /merchant/amazon/search/live does NOT exist
  registerTool(
    server,
    "merchant_amazon_search",
    z.object({}),
    async (_params, _client) => ({
      error:
        "No /merchant/amazon/search live endpoint. Use merchant_amazon_products_task_post/ready/get."
    }),
    apiClient
  );

  // merchant_amazon_product_info — /merchant/amazon/product_info/live does NOT exist
  registerTool(
    server,
    "merchant_amazon_product_info",
    z.object({}),
    async (_params, _client) => ({
      error:
        "Use merchant_amazon_asin_task_post/ready/get — the real endpoint is /merchant/amazon/asin/task_post, not product_info."
    }),
    apiClient
  );

  // merchant_amazon_reviews — temporarily unavailable per DataForSEO docs
  registerTool(
    server,
    "merchant_amazon_reviews",
    z.object({}),
    async (_params, _client) => ({
      error:
        "Amazon Reviews endpoint is temporarily unavailable per DataForSEO docs."
    }),
    apiClient
  );

  // ---------------------------------------------------------------------------
  // TASK-BASED TOOLS — Google Shopping Products
  // ---------------------------------------------------------------------------

  registerTaskTool(
    server,
    "merchant_google_products_task",
    z.object({
      keyword: z.string().describe("Product name or related keyword"),
      location_code: z.coerce.number().optional().describe("Location code"),
      language_code: z.string().optional().describe("Language code (e.g. 'en')"),
      depth: z.coerce.number().optional().describe("Number of results to return"),
      se_domain: z.string().optional().describe("Google domain to scrape (e.g. 'google.com')"),
      price_min: z.coerce.number().optional().describe("Minimum price filter"),
      price_max: z.coerce.number().optional().describe("Maximum price filter"),
      category: z.string().optional().describe("Product category filter")
    }),
    async (params, client) => {
      return client.post<DataForSeoResponse<any>>(
        "/merchant/google/products/task_post",
        [params]
      );
    },
    async (client) => {
      return client.get<DataForSeoResponse<any>>(
        "/merchant/google/products/tasks_ready"
      );
    },
    async (id, client) => {
      return client.get<DataForSeoResponse<any>>(
        `/merchant/google/products/task_get/advanced/${id}`
      );
    },
    apiClient
  );

  // ---------------------------------------------------------------------------
  // TASK-BASED TOOLS — Google Product Info
  // ---------------------------------------------------------------------------

  registerTaskTool(
    server,
    "merchant_google_product_info_task",
    z.object({
      product_id: z.string().describe("Google Shopping product ID (from a prior products task)"),
      location_code: z.coerce.number().optional().describe("Location code"),
      language_code: z.string().optional().describe("Language code (e.g. 'en')"),
      location_name: z.string().optional().describe("Location name"),
      language_name: z.string().optional().describe("Language name")
    }),
    async (params, client) => {
      return client.post<DataForSeoResponse<any>>(
        "/merchant/google/product_info/task_post",
        [params]
      );
    },
    async (client) => {
      return client.get<DataForSeoResponse<any>>(
        "/merchant/google/product_info/tasks_ready"
      );
    },
    async (id, client) => {
      return client.get<DataForSeoResponse<any>>(
        `/merchant/google/product_info/task_get/advanced/${id}`
      );
    },
    apiClient
  );

  // ---------------------------------------------------------------------------
  // TASK-BASED TOOLS — Google Sellers
  // ---------------------------------------------------------------------------

  registerTaskTool(
    server,
    "merchant_google_sellers_task",
    z.object({
      product_id: z.string().describe("Google Shopping product ID"),
      location_code: z.coerce.number().optional().describe("Location code"),
      language_code: z.string().optional().describe("Language code (e.g. 'en')"),
      location_name: z.string().optional().describe("Location name"),
      language_name: z.string().optional().describe("Language name")
    }),
    async (params, client) => {
      return client.post<DataForSeoResponse<any>>(
        "/merchant/google/sellers/task_post",
        [params]
      );
    },
    async (client) => {
      return client.get<DataForSeoResponse<any>>(
        "/merchant/google/sellers/tasks_ready"
      );
    },
    async (id, client) => {
      return client.get<DataForSeoResponse<any>>(
        `/merchant/google/sellers/task_get/advanced/${id}`
      );
    },
    apiClient
  );

  // ---------------------------------------------------------------------------
  // TASK-BASED TOOLS — Google Reviews
  // ---------------------------------------------------------------------------

  registerTaskTool(
    server,
    "merchant_google_reviews_task",
    z.object({
      product_id: z.string().describe("Google Shopping product ID"),
      location_code: z.coerce.number().optional().describe("Location code"),
      language_code: z.string().optional().describe("Language code (e.g. 'en')"),
      location_name: z.string().optional().describe("Location name"),
      language_name: z.string().optional().describe("Language name"),
      depth: z.coerce.number().optional().describe("Number of reviews to retrieve"),
      offset: z.coerce.number().optional().describe("Offset for pagination")
    }),
    async (params, client) => {
      return client.post<DataForSeoResponse<any>>(
        "/merchant/google/reviews/task_post",
        [params]
      );
    },
    async (client) => {
      return client.get<DataForSeoResponse<any>>(
        "/merchant/google/reviews/tasks_ready"
      );
    },
    async (id, client) => {
      return client.get<DataForSeoResponse<any>>(
        `/merchant/google/reviews/task_get/advanced/${id}`
      );
    },
    apiClient
  );

  // ---------------------------------------------------------------------------
  // TASK-BASED TOOLS — Amazon Products
  // ---------------------------------------------------------------------------

  registerTaskTool(
    server,
    "merchant_amazon_products_task",
    z.object({
      keyword: z.string().describe("Product name or related keyword"),
      location_code: z.coerce.number().optional().describe("Location code"),
      language_code: z.string().optional().describe("Language code (e.g. 'en')"),
      depth: z.coerce.number().optional().describe("Number of results to return"),
      se_domain: z.string().optional().describe("Amazon domain to scrape (e.g. 'amazon.com')"),
      price_min: z.coerce.number().optional().describe("Minimum price filter"),
      price_max: z.coerce.number().optional().describe("Maximum price filter"),
      category: z.string().optional().describe("Product category filter")
    }),
    async (params, client) => {
      return client.post<DataForSeoResponse<any>>(
        "/merchant/amazon/products/task_post",
        [params]
      );
    },
    async (client) => {
      return client.get<DataForSeoResponse<any>>(
        "/merchant/amazon/products/tasks_ready"
      );
    },
    async (id, client) => {
      return client.get<DataForSeoResponse<any>>(
        `/merchant/amazon/products/task_get/advanced/${id}`
      );
    },
    apiClient
  );

  // ---------------------------------------------------------------------------
  // TASK-BASED TOOLS — Amazon ASIN
  // ---------------------------------------------------------------------------

  registerTaskTool(
    server,
    "merchant_amazon_asin_task",
    z.object({
      asin: z.string().describe("Amazon Standard Identification Number (ASIN)"),
      location_code: z.coerce.number().optional().describe("Location code"),
      language_code: z.string().optional().describe("Language code (e.g. 'en')"),
      location_name: z.string().optional().describe("Location name"),
      language_name: z.string().optional().describe("Language name"),
      se_domain: z.string().optional().describe("Amazon domain to scrape (e.g. 'amazon.com')")
    }),
    async (params, client) => {
      return client.post<DataForSeoResponse<any>>(
        "/merchant/amazon/asin/task_post",
        [params]
      );
    },
    async (client) => {
      return client.get<DataForSeoResponse<any>>(
        "/merchant/amazon/asin/tasks_ready"
      );
    },
    async (id, client) => {
      return client.get<DataForSeoResponse<any>>(
        `/merchant/amazon/asin/task_get/advanced/${id}`
      );
    },
    apiClient
  );

  // ---------------------------------------------------------------------------
  // LOCATION TOOLS — ISO code as path segment (fixed from ?country=<name>)
  // ---------------------------------------------------------------------------

  // Merchant Google Locations
  // Backward-compat alias `country` is accepted and treated as an ISO code when it
  // looks like one (1–3 alpha chars), mirroring serp_google_locations.
  registerTool(
    server,
    "merchant_google_locations",
    z.object({
      country_iso_code: z.string().optional().describe(
        "ISO country code (e.g. 'us', 'gb'). Omit to retrieve all locations."
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
        ? `/merchant/google/locations/${encodeURIComponent(isoCode.toLowerCase())}`
        : "/merchant/google/locations";

      return client.get<DataForSeoResponse<any>>(url);
    },
    apiClient
  );

  // Merchant Amazon Locations
  // Backward-compat alias `country` is accepted and treated as an ISO code when it
  // looks like one (1–3 alpha chars), mirroring serp_google_locations.
  registerTool(
    server,
    "merchant_amazon_locations",
    z.object({
      country_iso_code: z.string().optional().describe(
        "ISO country code (e.g. 'us', 'gb'). Omit to retrieve all locations."
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
        ? `/merchant/amazon/locations/${encodeURIComponent(isoCode.toLowerCase())}`
        : "/merchant/amazon/locations";

      return client.get<DataForSeoResponse<any>>(url);
    },
    apiClient
  );

  // ---------------------------------------------------------------------------
  // OK TOOLS — no changes needed
  // ---------------------------------------------------------------------------

  // Merchant Google Languages
  registerTool(
    server,
    "merchant_google_languages",
    {},
    async (_params, client) => {
      return client.get<DataForSeoResponse<any>>("/merchant/google/languages");
    },
    apiClient
  );

  // Merchant Amazon Languages
  registerTool(
    server,
    "merchant_amazon_languages",
    {},
    async (_params, client) => {
      return client.get<DataForSeoResponse<any>>("/merchant/amazon/languages");
    },
    apiClient
  );
}
