import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { registerTool } from "../tools.js";

interface LocalFalconClientConfig {
  apiKey: string;
  baseUrl?: string;
}

class LocalFalconClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: LocalFalconClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://www.localfalcon.com/api";
  }

  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Local Falcon API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  async post<T>(path: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Local Falcon API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json() as Promise<T>;
  }
}

export function registerLocalFalconTools(server: McpServer, config: LocalFalconClientConfig) {
  const client = new LocalFalconClient(config);

  // Local Falcon - Calculate Grid Points from Base Coordinate
  registerTool(
    server,
    "localfalcon_calculate_grid_points",
    z.object({
      lat: z.number().describe("Base latitude coordinate"),
      lng: z.number().describe("Base longitude coordinate"),
      distance: z.number().describe("Distance between grid points (in miles or kilometers)"),
      units: z.enum(["miles", "kilometers"]).default("miles").describe("Distance unit"),
      points: z.number().min(1).max(100).default(20).describe("Number of grid points to calculate")
    }),
    async (params) => {
      const response = await client.post<any>(
        "/v1/grid/",
        params
      );

      return response;
    },
    client as any
  );

  // Local Falcon - Search for Google My Business Locations
  registerTool(
    server,
    "localfalcon_search_gmb_locations",
    z.object({
      query: z.string().describe("Search query for finding Google My Business locations"),
      lat: z.number().optional().describe("Optional latitude to center search around"),
      lng: z.number().optional().describe("Optional longitude to center search around"),
      include_sabs: z.boolean().default(true).describe("Include Service Area Businesses in results")
    }),
    async (params) => {
      const response = await client.post<any>(
        "/v1/places/",
        params
      );

      return response;
    },
    client as any
  );

  // Local Falcon - Get Business Ranking at Specific Coordinate Point
  registerTool(
    server,
    "localfalcon_get_ranking_at_coordinate",
    z.object({
      lat: z.number().describe("Latitude for the search point"),
      lng: z.number().describe("Longitude for the search point"),
      keyword: z.string().describe("Search term to use"),
      place_id: z.string().describe("Google place ID to get ranking for"),
      language: z.string().optional().describe("Language code (e.g., 'en')"),
      country: z.string().optional().describe("Country code (e.g., 'us')")
    }),
    async (params) => {
      const response = await client.post<any>(
        "/v1/result/",
        params
      );

      return response;
    },
    client as any
  );

  // Local Falcon - Keyword Search at a Specific Coordinate Point
  registerTool(
    server,
    "localfalcon_keyword_search_at_coordinate",
    z.object({
      lat: z.number().describe("Latitude for the search point"),
      lng: z.number().describe("Longitude for the search point"),
      keyword: z.string().describe("Search term to use"),
      language: z.string().optional().describe("Language code (e.g., 'en')"),
      country: z.string().optional().describe("Country code (e.g., 'us')"),
      limit: z.number().min(1).max(20).default(20).optional().describe("Number of results to return")
    }),
    async (params) => {
      const response = await client.post<any>(
        "/v1/search/",
        params
      );

      return response;
    },
    client as any
  );

  // Local Falcon - Run a Full Grid Search
  registerTool(
    server,
    "localfalcon_run_grid_search",
    z.object({
      lat: z.number().describe("Base latitude coordinate"),
      lng: z.number().describe("Base longitude coordinate"),
      keyword: z.string().describe("Search term to use"),
      place_id: z.string().describe("Google place ID to get ranking for"),
      distance: z.number().describe("Distance between grid points (in miles or kilometers)"),
      units: z.enum(["miles", "kilometers"]).default("miles").describe("Distance unit"),
      points: z.number().min(1).max(100).default(20).describe("Number of grid points to use"),
      language: z.string().optional().describe("Language code (e.g., 'en')"),
      country: z.string().optional().describe("Country code (e.g., 'us')")
    }),
    async (params) => {
      const response = await client.post<any>(
        "/v1/scan/",
        params
      );

      return response;
    },
    client as any
  );
}