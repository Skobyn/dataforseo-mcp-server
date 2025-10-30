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

// Backlinks API schemas
const targetSchema = z.object({
  target: z.string().describe("Target domain, subdomain or URL to analyze"),
  limit: z.number().optional().describe("Maximum number of results to return"),
  offset: z.number().optional().describe("Offset for pagination"),
  filters: z.array(z.any()).optional().describe("Array of filter objects")
});

export function registerBacklinksTools(server: McpServer, apiClient: DataForSeoClient) {
  // Backlinks Summary
  registerTool(
    server,
    "backlinks_summary",
    targetSchema,
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/backlinks/summary/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Backlinks List
  registerTool(
    server,
    "backlinks_backlinks",
    targetSchema.extend({
      mode: z.enum(["as_is", "as_csv"]).optional().describe("Data presentation mode"),
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/backlinks/backlinks/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Anchors
  registerTool(
    server,
    "backlinks_anchors",
    targetSchema,
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/backlinks/anchors/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Backlinks Domain Pages
  registerTool(
    server,
    "backlinks_domain_pages",
    targetSchema,
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/backlinks/domain_pages/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Domain Pages Summary
  registerTool(
    server,
    "backlinks_domain_pages_summary",
    targetSchema,
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/backlinks/domain_pages_summary/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Referring Domains
  registerTool(
    server,
    "backlinks_referring_domains",
    targetSchema,
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/backlinks/referring_domains/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Referring Networks
  registerTool(
    server,
    "backlinks_referring_networks",
    targetSchema,
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/backlinks/referring_networks/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Bulk Backlinks
  registerTool(
    server,
    "backlinks_bulk_backlinks",
    z.object({
      targets: z.array(z.string()).describe("List of targets to analyze (domains, subdomains, URLs)"),
      limit: z.number().optional().describe("Maximum number of results to return per target"),
      offset: z.number().optional().describe("Offset for pagination"),
      internal_list_limit: z.number().optional().describe("Maximum number of items in internal lists per target")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/backlinks/bulk_backlinks/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Bulk Referring Domains
  registerTool(
    server,
    "backlinks_bulk_referring_domains",
    z.object({
      targets: z.array(z.string()).describe("List of targets to analyze (domains, subdomains, URLs)"),
      limit: z.number().optional().describe("Maximum number of results to return per target"),
      offset: z.number().optional().describe("Offset for pagination"),
      internal_list_limit: z.number().optional().describe("Maximum number of items in internal lists per target")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/backlinks/bulk_referring_domains/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Bulk Spam Score
  registerTool(
    server,
    "backlinks_bulk_spam_score",
    z.object({
      targets: z.array(z.string()).describe("List of targets to analyze (domains, subdomains, URLs)")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/backlinks/bulk_spam_score/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Bulk Rank Overview
  registerTool(
    server,
    "backlinks_bulk_ranks",
    z.object({
      targets: z.array(z.string()).describe("List of targets to analyze (domains, subdomains, URLs)")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/backlinks/bulk_ranks/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Domain Competitors
  registerTool(
    server,
    "backlinks_competitors",
    targetSchema,
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/backlinks/competitors/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Domain Intersection
  registerTool(
    server,
    "backlinks_domain_intersection",
    z.object({
      targets: z.array(z.string()).min(2).max(20).describe("List of domains to compare"),
      limit: z.number().optional().describe("Maximum number of results to return"),
      offset: z.number().optional().describe("Offset for pagination"),
      exclude_targets: z.boolean().optional().describe("Whether to exclude the target domains from the results")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/backlinks/domain_intersection/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Page Intersection
  registerTool(
    server,
    "backlinks_page_intersection",
    z.object({
      targets: z.array(z.string()).min(2).max(20).describe("List of URLs to compare"),
      limit: z.number().optional().describe("Maximum number of results to return"),
      offset: z.number().optional().describe("Offset for pagination"),
      exclude_targets: z.boolean().optional().describe("Whether to exclude the target URLs from the results")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/backlinks/page_intersection/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Timeseries New Lost Summary
  registerTool(
    server,
    "backlinks_timeseries_new_lost_summary",
    targetSchema.extend({
      date_from: z.string().describe("Start date in YYYY-MM-DD format"),
      date_to: z.string().describe("End date in YYYY-MM-DD format")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/backlinks/timeseries_new_lost_summary/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Backlinks Index
  registerTool(
    server,
    "backlinks_index",
    {},
    async (_params, client) => {
      const response = await client.get<DataForSeoResponse<any>>("/backlinks/index");
      
      return response;
    },
    apiClient
  );
  
  // Backlinks Status
  registerTool(
    server,
    "backlinks_errors",
    {},
    async (_params, client) => {
      const response = await client.get<DataForSeoResponse<any>>("/backlinks/errors");

      return response;
    },
    apiClient
  );

  // Available Filters
  registerTool(
    server,
    "backlinks_available_filters",
    {},
    async (_params, client) => {
      const response = await client.get<DataForSeoResponse<any>>("/backlinks/available_filters");

      return response;
    },
    apiClient
  );

  // ID List
  registerTool(
    server,
    "backlinks_id_list",
    {},
    async (_params, client) => {
      const response = await client.get<DataForSeoResponse<any>>("/backlinks/id_list");

      return response;
    },
    apiClient
  );

  // Backlinks History
  registerTool(
    server,
    "backlinks_history",
    targetSchema.extend({
      date_from: z.string().optional().describe("Start date in YYYY-MM-DD format"),
      date_to: z.string().optional().describe("End date in YYYY-MM-DD format")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/backlinks/history/live",
        [params]
      );

      return response;
    },
    apiClient
  );

  // Timeseries Summary
  registerTool(
    server,
    "backlinks_timeseries_summary",
    targetSchema.extend({
      date_from: z.string().describe("Start date in YYYY-MM-DD format"),
      date_to: z.string().describe("End date in YYYY-MM-DD format")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/backlinks/timeseries_summary/live",
        [params]
      );

      return response;
    },
    apiClient
  );

  // Bulk New Lost Backlinks
  registerTool(
    server,
    "backlinks_bulk_new_lost_backlinks",
    z.object({
      targets: z.array(z.string()).describe("List of targets to analyze (domains, subdomains, URLs)"),
      date_from: z.string().describe("Start date in YYYY-MM-DD format"),
      date_to: z.string().describe("End date in YYYY-MM-DD format"),
      limit: z.number().optional().describe("Maximum number of results to return per target"),
      offset: z.number().optional().describe("Offset for pagination"),
      internal_list_limit: z.number().optional().describe("Maximum number of items in internal lists per target")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/backlinks/bulk_new_lost_backlinks/live",
        [params]
      );

      return response;
    },
    apiClient
  );

  // Bulk New Lost Referring Domains
  registerTool(
    server,
    "backlinks_bulk_new_lost_referring_domains",
    z.object({
      targets: z.array(z.string()).describe("List of targets to analyze (domains, subdomains, URLs)"),
      date_from: z.string().describe("Start date in YYYY-MM-DD format"),
      date_to: z.string().describe("End date in YYYY-MM-DD format"),
      limit: z.number().optional().describe("Maximum number of results to return per target"),
      offset: z.number().optional().describe("Offset for pagination"),
      internal_list_limit: z.number().optional().describe("Maximum number of items in internal lists per target")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/backlinks/bulk_new_lost_referring_domains/live",
        [params]
      );

      return response;
    },
    apiClient
  );

  // Bulk Pages Summary
  registerTool(
    server,
    "backlinks_bulk_pages_summary",
    z.object({
      targets: z.array(z.string()).describe("List of targets to analyze (domains, subdomains, URLs)"),
      limit: z.number().optional().describe("Maximum number of results to return per target"),
      offset: z.number().optional().describe("Offset for pagination"),
      internal_list_limit: z.number().optional().describe("Maximum number of items in internal lists per target")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/backlinks/bulk_pages_summary/live",
        [params]
      );

      return response;
    },
    apiClient
  );
}