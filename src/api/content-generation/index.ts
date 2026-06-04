import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { DataForSeoClient } from "../client.js";
import { registerTool } from "../tools.js";
import { DataForSeoResponse } from "../types.js";

export function registerContentGenerationTools(server: McpServer, apiClient: DataForSeoClient) {
  // Content Generation Generate Text
  // FIX (SUSPECT): Marketing page lists this endpoint as 'generate_text' not
  // 'text'. Changing path from /content_generation/text/live to
  // /content_generation/generate_text/live per audit finding.
  registerTool(
    server,
    "content_generation_text",
    z.object({
      topic: z.string().describe("Topic for the generated content"),
      creative_level: z.coerce.number().min(0).max(1).optional().describe("Creative level (0-1)"),
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
        "/content_generation/generate_text/live",
        [params]
      );

      return response;
    },
    apiClient
  );

  // Content Generation Paraphrase
  // NOTE: Path /content_generation/paraphrase/live is listed as LIKELY_CORRECT
  // in the audit (consistent with marketing page). Keeping as-is.
  // If this returns 404, please report the issue.
  registerTool(
    server,
    "content_generation_paraphrase",
    z.object({
      text: z.string().describe("Text to paraphrase"),
      paraphrase_level: z.coerce.number().min(1).max(3).optional().describe("Paraphrase level (1-3)"),
      creative_level: z.coerce.number().min(0).max(1).optional().describe("Creative level (0-1)"),
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
  // FIX (SUSPECT): Marketing page lists this endpoint as 'generate_meta_tags'
  // not 'meta_tags'. Changing path from /content_generation/meta_tags/live to
  // /content_generation/generate_meta_tags/live per audit finding.
  registerTool(
    server,
    "content_generation_meta_tags",
    z.object({
      text: z.string().optional().describe("Text to generate meta tags from"),
      url: z.string().optional().describe("URL to extract text from"),
      language_code: z.string().optional().describe("Language code"),
      language_name: z.string().optional().describe("Language name"),
      creative_level: z.coerce.number().min(0).max(1).optional().describe("Creative level (0-1)")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/content_generation/generate_meta_tags/live",
        [params]
      );

      return response;
    },
    apiClient
  );

  // Content Generation Summarize
  // NOTE: Path not confirmed in DataForSEO docs. May return 404.
  // The marketing page does not explicitly list 'summarize' — endpoint may
  // exist but is not prominently documented. Report 404 if encountered.
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

  // Content Generation Title
  // NOTE: Path not confirmed in DataForSEO docs. May return 404.
  // The marketing page does not explicitly list 'title' as an endpoint.
  // Report 404 if encountered.
  registerTool(
    server,
    "content_generation_title",
    z.object({
      text: z.string().optional().describe("Text to generate title from"),
      url: z.string().optional().describe("URL to extract text from"),
      language_code: z.string().optional().describe("Language code"),
      language_name: z.string().optional().describe("Language name"),
      creative_level: z.coerce.number().min(0).max(1).optional().describe("Creative level (0-1)")
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
  // NOTE: Path not confirmed in DataForSEO docs. May return 404.
  // The marketing page does not list 'explain_code' as an endpoint.
  // This endpoint may not exist in the DataForSEO Content Generation API.
  // Report 404 if encountered.
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
