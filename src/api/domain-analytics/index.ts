import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DataForSeoClient } from "../client.js";
import { registerTool } from "../tools.js";
import { DataForSeoResponse } from "../types.js";

export function registerDomainAnalyticsTools(server: McpServer, apiClient: DataForSeoClient) {
  // Technologies Summary
  // FIX: path corrected from /technologies/summary/live → /technologies/technologies_summary/live
  registerTool(
    server,
    "domain_analytics_technologies_summary",
    z.object({
      technology_name: z.string().optional().describe("Filter results by technology name"),
      technology_group: z.string().optional().describe("Filter results by technology group"),
      category: z.string().optional().describe("Filter results by category")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/domain_analytics/technologies/technologies_summary/live",
        [params]
      );

      return response;
    },
    apiClient
  );

  // Technologies Technologies
  // FIX: method changed from POST → GET; /live suffix removed.
  // This is a free reference endpoint — no POST body. The schema inputs
  // (technology_name, technology_group, category) cannot be sent to a GET
  // endpoint without a body; they are kept here for backwards-compatible MCP
  // schema but are effectively unused until the API supports query params.
  // TODO v1.2: remove these params or map them to query-string when/if docs
  // confirm query-param support.
  registerTool(
    server,
    "domain_analytics_technologies_technologies",
    {},
    async (_params, client) => {
      const response = await client.get<DataForSeoResponse<any>>(
        "/domain_analytics/technologies/technologies"
      );

      return response;
    },
    apiClient
  );

  // Technologies Domains by Technology
  registerTool(
    server,
    "domain_analytics_technologies_domains_by_technology",
    z.object({
      technology_name: z.string().describe("Technology name to search for"),
      technology_group: z.string().optional().describe("Filter results by technology group"),
      category: z.string().optional().describe("Filter results by category"),
      limit: z.coerce.number().optional().describe("Maximum number of results to return"),
      offset: z.coerce.number().optional().describe("Offset for pagination")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/domain_analytics/technologies/domains_by_technology/live",
        [params]
      );

      return response;
    },
    apiClient
  );

  // Technologies Domain Technologies
  registerTool(
    server,
    "domain_analytics_technologies_domain_technologies",
    z.object({
      target: z.string().describe("Target domain to analyze"),
      limit: z.coerce.number().optional().describe("Maximum number of results to return"),
      offset: z.coerce.number().optional().describe("Offset for pagination")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/domain_analytics/technologies/domain_technologies/live",
        [params]
      );

      return response;
    },
    apiClient
  );

  // Technologies Technology Stats
  registerTool(
    server,
    "domain_analytics_technologies_technology_stats",
    z.object({
      technology_name: z.string().describe("Technology name to get stats for"),
      limit: z.coerce.number().optional().describe("Maximum number of results to return"),
      offset: z.coerce.number().optional().describe("Offset for pagination")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/domain_analytics/technologies/technology_stats/live",
        [params]
      );

      return response;
    },
    apiClient
  );

  // Technologies Domains by HTML Terms
  // TODO v1.2: param 'terms' should be renamed to 'search_terms' to match the
  // DataForSEO docs (required field is 'search_terms' array). Rename deferred
  // to avoid breaking existing MCP clients.
  registerTool(
    server,
    "domain_analytics_technologies_domains_by_html_terms",
    z.object({
      terms: z.array(z.string()).describe("HTML terms to search for"),
      intersection_mode: z.enum(["and", "or"]).optional().describe("Intersection mode"),
      limit: z.coerce.number().optional().describe("Maximum number of results to return"),
      offset: z.coerce.number().optional().describe("Offset for pagination")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/domain_analytics/technologies/domains_by_html_terms/live",
        [params]
      );

      return response;
    },
    apiClient
  );

  // Whois Overview
  // TODO v1.2: docs expect a 'filters' array (not a top-level 'domain' field).
  // The current 'domain' param is kept for backwards compat with existing MCP
  // clients. Rename/restructure deferred to v1.2.
  registerTool(
    server,
    "domain_analytics_whois_overview",
    z.object({
      domain: z.string().describe("Domain to get WHOIS information for")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/domain_analytics/whois/overview/live",
        [params]
      );

      return response;
    },
    apiClient
  );
}
