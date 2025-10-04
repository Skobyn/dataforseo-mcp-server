import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DataForSeoClient } from "../client.js";
import { registerTool, registerTaskTool } from "../tools.js";
import { DataForSeoResponse } from "../types.js";

export function registerContentAnalysisTools(server: McpServer, apiClient: DataForSeoClient) {
  // Content Analysis Summary
  registerTool(
    server,
    "content_analysis_summary",
    z.object({
      url: z.string().describe("URL to analyze"),
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
      const response = await client.post<DataForSeoResponse<any>>(
        "/content_analysis/summary/live",
        [params]
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
      limit: z.number().optional().describe("Maximum number of results to return"),
      offset: z.number().optional().describe("Offset for pagination")
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
  
  // Content Analysis Category
  registerTool(
    server,
    "content_analysis_category",
    z.object({
      url: z.string().describe("URL to categorize"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/content_analysis/category/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Content Analysis Sentiment Analysis
  registerTool(
    server,
    "content_analysis_sentiment_analysis",
    z.object({
      text: z.string().describe("Text to analyze"),
      language_name: z.string().optional().describe("Language name"),
      language_code: z.string().optional().describe("Language code")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/content_analysis/sentiment_analysis/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Content Analysis Rating Distribution
  registerTool(
    server,
    "content_analysis_rating_distribution",
    z.object({
      rating_values: z.array(z.number()).describe("Array of rating values"),
      algo: z.enum(["percentile", "linear", "exponential"]).optional().describe("Algorithm for distribution calculation")
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