import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DataForSeoClient } from "../client.js";
import { registerTool, registerTaskTool } from "../tools.js";
import { DataForSeoResponse } from "../types.js";

export function registerOnPageTools(server: McpServer, apiClient: DataForSeoClient) {
  // OnPage Task Post
  registerTool(
    server,
    "onpage_task_post",
    z.object({
      target: z.string().describe("Target URL to analyze"),
      max_crawl_pages: z.coerce.number().optional().describe("Maximum number of pages to crawl"),
      load_resources: z.boolean().optional().describe("Load page resources"),
      enable_javascript: z.boolean().optional().describe("Enable JavaScript execution"),
      limit: z.coerce.number().optional().describe("Maximum number of results to return")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/on_page/task_post",
        [params]
      );

      return response;
    },
    apiClient
  );

  // OnPage Tasks Ready
  registerTool(
    server,
    "onpage_tasks_ready",
    {},
    async (_params, client) => {
      const response = await client.get<DataForSeoResponse<any>>("/on_page/tasks_ready");

      return response;
    },
    apiClient
  );

  // OnPage Task Result Summary — id in URL path is correct per docs
  registerTool(
    server,
    "onpage_summary",
    z.object({
      id: z.string().describe("Task ID")
    }),
    async (params, client) => {
      const response = await client.get<DataForSeoResponse<any>>(`/on_page/summary/${params.id}`);

      return response;
    },
    apiClient
  );

  // OnPage Task Result Pages
  // FIX: id moved from URL path into the POST body per docs
  // (POST /on_page/pages with id in body, not POST /on_page/pages/${id})
  registerTool(
    server,
    "onpage_pages",
    z.object({
      id: z.string().describe("Task ID"),
      limit: z.coerce.number().optional().describe("Maximum number of results to return"),
      offset: z.coerce.number().optional().describe("Offset for pagination"),
      filters: z.array(z.any()).optional().describe("Array of filter objects")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/on_page/pages",
        [params]
      );

      return response;
    },
    apiClient
  );

  // OnPage Task Result Resources
  // FIX: id moved from URL path into the POST body per docs
  // (POST /on_page/resources with id in body, not POST /on_page/resources/${id})
  registerTool(
    server,
    "onpage_resources",
    z.object({
      id: z.string().describe("Task ID"),
      url: z.string().describe("URL of the page to get resources for"),
      limit: z.coerce.number().optional().describe("Maximum number of results to return"),
      offset: z.coerce.number().optional().describe("Offset for pagination"),
      filters: z.array(z.any()).optional().describe("Array of filter objects")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/on_page/resources",
        [params]
      );

      return response;
    },
    apiClient
  );

  // OnPage Task Force Stop
  registerTool(
    server,
    "onpage_task_force_stop",
    z.object({
      id: z.string().describe("Task ID")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/on_page/task_force_stop",
        [{ id: params.id }]
      );

      return response;
    },
    apiClient
  );

  // OnPage Duplicate Content
  // FIX: id moved from URL path into the POST body per docs
  // (POST /on_page/duplicate_content with id in body, not POST /on_page/duplicate_content/${id})
  registerTool(
    server,
    "onpage_duplicate_content",
    z.object({
      id: z.string().describe("Task ID"),
      limit: z.coerce.number().optional().describe("Maximum number of results to return"),
      offset: z.coerce.number().optional().describe("Offset for pagination")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/on_page/duplicate_content",
        [params]
      );

      return response;
    },
    apiClient
  );
}
