import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DataForSeoClient } from "../client.js";
import { registerTool } from "../tools.js";
import { DataForSeoResponse } from "../types.js";

export function registerContentGenerationTools(server: McpServer, apiClient: DataForSeoClient) {
  // Content Generation Generate Text
  registerTool(
    server,
    "content_generation_text",
    z.object({
      topic: z.string().describe("Topic for the generated content"),
      creative_level: z.number().min(0).max(1).optional().describe("Creative level (0-1)"),
      language_code: z.string().optional().describe("Language code"),
      language_name: z.string().optional().describe("Language name"),
      target_audience: z.array(z.string()).optional().describe("Target audience"),
      text_style: z.string().optional().describe("Text style"),
      writer_experience_level: z.enum(["expert", "beginner", "intermediate"]).optional().describe("Writer experience level"),
      subject_experience_level: z.enum(["expert", "beginner", "intermediate"]).optional().describe("Subject experience level"),
      text_format: z.enum(["plain", "html"]).optional().describe("Text format")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/content_generation/text/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Content Generation Generate Paraphrase
  registerTool(
    server,
    "content_generation_paraphrase",
    z.object({
      text: z.string().describe("Text to paraphrase"),
      paraphrase_level: z.number().min(1).max(3).optional().describe("Paraphrase level (1-3)"),
      creative_level: z.number().min(0).max(1).optional().describe("Creative level (0-1)"),
      language_code: z.string().optional().describe("Language code"),
      language_name: z.string().optional().describe("Language name")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/content_generation/paraphrase/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Content Generation Generate Meta Tags
  registerTool(
    server,
    "content_generation_meta_tags",
    z.object({
      text: z.string().optional().describe("Text to generate meta tags from"),
      url: z.string().optional().describe("URL to extract text from"),
      language_code: z.string().optional().describe("Language code"),
      language_name: z.string().optional().describe("Language name"),
      creative_level: z.number().min(0).max(1).optional().describe("Creative level (0-1)")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/content_generation/meta_tags/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Content Generation Generate Summarize
  registerTool(
    server,
    "content_generation_summarize",
    z.object({
      text: z.string().optional().describe("Text to summarize"),
      url: z.string().optional().describe("URL to extract text from"),
      language_code: z.string().optional().describe("Language code"),
      language_name: z.string().optional().describe("Language name"),
      summary_size: z.enum(["small", "medium", "large"]).optional().describe("Summary size")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/content_generation/summarize/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Content Generation Generate Title
  registerTool(
    server,
    "content_generation_title",
    z.object({
      text: z.string().optional().describe("Text to generate title from"),
      url: z.string().optional().describe("URL to extract text from"),
      language_code: z.string().optional().describe("Language code"),
      language_name: z.string().optional().describe("Language name"),
      creative_level: z.number().min(0).max(1).optional().describe("Creative level (0-1)")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/content_generation/title/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
  
  // Content Generation Explain Code
  registerTool(
    server,
    "content_generation_explain_code",
    z.object({
      code: z.string().describe("Code to explain"),
      language_code: z.string().optional().describe("Language code"),
      language_name: z.string().optional().describe("Language name"),
      code_language: z.string().optional().describe("Programming language of the code"),
      explanation_type: z.enum(["line_by_line", "function", "block"]).optional().describe("Type of explanation")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/content_generation/explain_code/live",
        [params]
      );
      
      return response;
    },
    apiClient
  );
}