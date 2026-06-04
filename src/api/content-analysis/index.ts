import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DataForSeoClient } from "../client.js";
import { registerTool } from "../tools.js";
import { DataForSeoResponse } from "../types.js";

export function registerContentAnalysisTools(server: McpServer, apiClient: DataForSeoClient) {
  // Content Analysis Summary
  // FIX (MEDIUM): Docs require `keyword` as the primary field; the old wrapper
  // exposed `url` as the only "identity" param.  We now accept BOTH:
  //   - `keyword` is the preferred / docs-correct field.
  //   - `url` is kept for backward compatibility; if `url` is provided but
  //     `keyword` is not, `url` is mapped to `keyword` in the outgoing payload.
  registerTool(
    server,
    "content_analysis_summary",
    z.object({
      keyword: z.string().optional().describe(
        "Keyword to analyze (required by docs — preferred field)."
      ),
      url: z.string().optional().describe(
        "URL to analyze (backward-compat alias for keyword; mapped to keyword if keyword is absent)."
      ),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code"),
      calculate_sentiment: z.boolean().optional().describe("Calculate sentiment"),
      calculate_toxicity: z.boolean().optional().describe("Calculate toxicity"),
      calculate_readability: z.boolean().optional().describe("Calculate readability"),
      calculate_keyword_density: z.boolean().optional().describe("Calculate keyword density"),
      calculate_information_score: z.boolean().optional().describe("Calculate information score"),
      calculate_adult_score: z.boolean().optional().describe("Calculate adult score")
    }),
    async (params, client) => {
      const { keyword, url, ...rest } = params;

      // Resolve the `keyword` field: prefer explicit keyword, fall back to url
      const resolvedKeyword = keyword ?? url;

      if (!resolvedKeyword) {
        return { error: "Either `keyword` or `url` must be provided." };
      }

      const response = await client.post<DataForSeoResponse<any>>(
        "/content_analysis/summary/live",
        [{ ...rest, keyword: resolvedKeyword }]
      );

      return response;
    },
    apiClient
  );

  // Content Analysis Search
  registerTool(
    server,
    "content_analysis_search",
    z.object({
      query: z.string().describe("Search query"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code"),
      search_mode: z.enum(["web", "news"]).optional().describe("Search mode"),
      calculate_sentiment: z.boolean().optional().describe("Calculate sentiment"),
      calculate_toxicity: z.boolean().optional().describe("Calculate toxicity"),
      calculate_readability: z.boolean().optional().describe("Calculate readability"),
      calculate_information_score: z.boolean().optional().describe("Calculate information score"),
      calculate_keyword_density: z.boolean().optional().describe("Calculate keyword density"),
      calculate_adult_score: z.boolean().optional().describe("Calculate adult score"),
      limit: z.coerce.number().optional().describe("Maximum number of results to return"),
      offset: z.coerce.number().optional().describe("Offset for pagination")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/content_analysis/search/live",
        [params]
      );

      return response;
    },
    apiClient
  );

  // Content Analysis Category Trends
  // FIX (HIGH): The endpoint '/content_analysis/category/live' does NOT exist
  // in DataForSEO.  The correct endpoint is '/content_analysis/category_trends/live'.
  // Schema updated: `keyword` is the required field per docs; the old `url` param
  // is kept as a deprecated optional alias.
  registerTool(
    server,
    "content_analysis_category",
    z.object({
      keyword: z.string().optional().describe(
        "Keyword to analyze category trends for (required by docs — preferred field)."
      ),
      url: z.string().optional().describe(
        "@deprecated Use `keyword` instead. Kept for backward compatibility."
      ),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code")
    }),
    async (params, client) => {
      const { keyword, url, ...rest } = params;
      const resolvedKeyword = keyword ?? url;

      if (!resolvedKeyword) {
        return { error: "Either `keyword` or `url` must be provided." };
      }

      const response = await client.post<DataForSeoResponse<any>>(
        "/content_analysis/category_trends/live",
        [{ ...rest, keyword: resolvedKeyword }]
      );

      return response;
    },
    apiClient
  );

  // Content Analysis Sentiment Analysis
  // FIX (MEDIUM): Docs require `keyword` as the primary field; old wrapper used
  // `text`.  Both are now accepted — if `text` is provided but `keyword` is not,
  // `text` is mapped to `keyword` in the outgoing payload.
  registerTool(
    server,
    "content_analysis_sentiment_analysis",
    z.object({
      keyword: z.string().optional().describe(
        "Keyword to run sentiment analysis on (required by docs — preferred field)."
      ),
      text: z.string().optional().describe(
        "Text to analyze (backward-compat alias for keyword; mapped to keyword if keyword is absent)."
      ),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code")
    }),
    async (params, client) => {
      const { keyword, text, ...rest } = params;
      const resolvedKeyword = keyword ?? text;

      if (!resolvedKeyword) {
        return { error: "Either `keyword` or `text` must be provided." };
      }

      const response = await client.post<DataForSeoResponse<any>>(
        "/content_analysis/sentiment_analysis/live",
        [{ ...rest, keyword: resolvedKeyword }]
      );

      return response;
    },
    apiClient
  );

  // Content Analysis Rating Distribution
  // FIX (MEDIUM): Docs show `keyword` as the required field.  The old wrapper
  // sent `rating_values` (array) and `algo` (enum) which are not documented
  // params and will likely be ignored or rejected.
  //   - `keyword` added as primary required field.
  //   - `rating_values` and `algo` kept as optional with deprecation notes for
  //     backward compatibility (they pass through to the API as-is).
  registerTool(
    server,
    "content_analysis_rating_distribution",
    z.object({
      keyword: z.string().describe(
        "Keyword to get rating distribution for (required by docs)."
      ),
      rating_values: z.array(z.coerce.number()).optional().describe(
        "@deprecated Not a documented DataForSEO parameter — may be ignored by the API."
      ),
      algo: z.enum(["percentile", "linear", "exponential"]).optional().describe(
        "@deprecated Not a documented DataForSEO parameter — may be ignored by the API."
      )
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/content_analysis/rating_distribution/live",
        [params]
      );

      return response;
    },
    apiClient
  );
}
