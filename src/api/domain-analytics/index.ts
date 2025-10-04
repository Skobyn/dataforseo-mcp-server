import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DataForSeoClient } from "../client.js";
import { registerTool } from "../tools.js";
import { DataForSeoResponse } from "../types.js";

export function registerDomainAnalyticsTools(server: McpServer, apiClient: DataForSeoClient) {
  // Technologies Summary
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
        "/domain_analytics/technologies/summary/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Technologies Technologies
  registerTool(
    server,
    "domain_analytics_technologies_technologies",
    z.object({
      technology_name: z.string().optional().describe("Filter results by technology name"),
      technology_group: z.string().optional().describe("Filter results by technology group"),
      category: z.string().optional().describe("Filter results by category")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/domain_analytics/technologies/technologies/live",
        [params]
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
      limit: z.number().optional().describe("Maximum number of results to return"),
      offset: z.number().optional().describe("Offset for pagination")
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
      limit: z.number().optional().describe("Maximum number of results to return"),
      offset: z.number().optional().describe("Offset for pagination")
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
      limit: z.number().optional().describe("Maximum number of results to return"),
      offset: z.number().optional().describe("Offset for pagination")
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
  registerTool(
    server,
    "domain_analytics_technologies_domains_by_html_terms",
    z.object({
      terms: z.array(z.string()).describe("HTML terms to search for"),
      intersection_mode: z.enum(["and", "or"]).optional().describe("Intersection mode"),
      limit: z.number().optional().describe("Maximum number of results to return"),
      offset: z.number().optional().describe("Offset for pagination")
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