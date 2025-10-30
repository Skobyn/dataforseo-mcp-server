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

// Common schemas
const messageChainItemSchema = z.object({
  role: z.enum(["user", "ai"]).describe("Role in the conversation"),
  message: z.string().max(500).describe("Message content")
});

const llmResponseBaseSchema = z.object({
  user_prompt: z.string().max(500).describe("Prompt for the AI model"),
  model_name: z.string().describe("Name of the AI model"),
  max_output_tokens: z.number().min(16).max(4096).optional().describe("Maximum number of tokens in the AI response"),
  temperature: z.number().min(0).max(2).optional().describe("Randomness of the AI response (0-2, default: 0.94)"),
  top_p: z.number().min(0).max(1).optional().describe("Diversity of the AI response (0-1, default: 0.92)"),
  web_search: z.boolean().optional().describe("Enable web search"),
  force_web_search: z.boolean().optional().describe("Force AI to use web search"),
  web_search_country_iso_code: z.string().optional().describe("ISO country code for web search"),
  web_search_city: z.string().optional().describe("City name for web search"),
  system_message: z.string().max(500).optional().describe("Instructions for AI behavior"),
  message_chain: z.array(messageChainItemSchema).max(10).optional().describe("Conversation history"),
  tag: z.string().max(255).optional().describe("User-defined task identifier")
});

const llmResponseTaskSchema = llmResponseBaseSchema.extend({
  priority: z.number().min(1).max(2).optional().describe("Task priority: 1 (normal) or 2 (high)"),
  postback_url: z.string().optional().describe("URL to receive a callback when the task is completed"),
  postback_data: z.string().optional().describe("Custom data to be passed in the callback")
});

const llmScraperTaskSchema = z.object({
  keyword: z.string().max(512).describe("Search query or keyword"),
  location_name: z.string().optional().describe("Full name of location"),
  location_code: z.number().optional().describe("Unique location identifier"),
  language_name: z.string().optional().describe("Full name of language"),
  language_code: z.string().optional().describe("Language code"),
  priority: z.number().min(1).max(2).optional().describe("Task priority: 1 (normal) or 2 (high)"),
  tag: z.string().max(255).optional().describe("User-defined task identifier"),
  postback_url: z.string().optional().describe("URL to receive a callback when the task is completed"),
  postback_data: z.string().optional().describe("Custom data to be passed in the callback")
});

export function registerAiOptimizationTools(server: McpServer, apiClient: DataForSeoClient) {
  // ============================================
  // ChatGPT LLM Responses
  // ============================================

  // ChatGPT Models List
  registerTool(
    server,
    "ai_chatgpt_models",
    {},
    async (_params, client) => {
      const response = await client.get<DataForSeoResponse<any>>(
        "/ai_optimization/chat_gpt/llm_responses/models"
      );

      return response;
    },
    apiClient
  );

  // ChatGPT LLM Responses Live
  registerTool(
    server,
    "ai_chatgpt_llm_responses_live",
    llmResponseBaseSchema,
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/ai_optimization/chat_gpt/llm_responses/live",
        [params]
      );

      return response;
    },
    apiClient
  );

  // ChatGPT LLM Responses Task-based (POST, READY, GET)
  registerTaskTool(
    server,
    "ai_chatgpt_llm_responses_task",
    llmResponseTaskSchema,
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<TaskPostResponse>>(
        "/ai_optimization/chat_gpt/llm_responses/task_post",
        [params]
      );

      return response;
    },
    async (client) => {
      const response = await client.get<DataForSeoResponse<TaskReadyResponse>>(
        "/ai_optimization/chat_gpt/llm_responses/tasks_ready"
      );

      return response;
    },
    async (id, client) => {
      const response = await client.get<DataForSeoResponse<TaskGetResponse<any>>>(
        `/ai_optimization/chat_gpt/llm_responses/task_get/${id}`
      );

      return response;
    },
    apiClient
  );

  // ============================================
  // ChatGPT LLM Scraper
  // ============================================

  // ChatGPT Scraper Locations
  registerTool(
    server,
    "ai_chatgpt_scraper_locations",
    {},
    async (_params, client) => {
      const response = await client.get<DataForSeoResponse<any>>(
        "/ai_optimization/chat_gpt/llm_scraper/locations"
      );

      return response;
    },
    apiClient
  );

  // ChatGPT Scraper Locations by Country
  registerTool(
    server,
    "ai_chatgpt_scraper_locations_country",
    z.object({
      country: z.string().describe("Country code (e.g., 'us', 'uk', 'fr')")
    }),
    async (params, client) => {
      const response = await client.get<DataForSeoResponse<any>>(
        `/ai_optimization/chat_gpt/llm_scraper/locations/${params.country}`
      );

      return response;
    },
    apiClient
  );

  // ChatGPT Scraper Languages
  registerTool(
    server,
    "ai_chatgpt_scraper_languages",
    {},
    async (_params, client) => {
      const response = await client.get<DataForSeoResponse<any>>(
        "/ai_optimization/chat_gpt/llm_scraper/languages"
      );

      return response;
    },
    apiClient
  );

  // ChatGPT Scraper Task-based (POST, READY, GET Advanced, GET HTML)
  registerTaskTool(
    server,
    "ai_chatgpt_scraper_task",
    llmScraperTaskSchema,
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<TaskPostResponse>>(
        "/ai_optimization/chat_gpt/llm_scraper/task_post",
        [params]
      );

      return response;
    },
    async (client) => {
      const response = await client.get<DataForSeoResponse<TaskReadyResponse>>(
        "/ai_optimization/chat_gpt/llm_scraper/tasks_ready"
      );

      return response;
    },
    async (id, client) => {
      const response = await client.get<DataForSeoResponse<TaskGetResponse<any>>>(
        `/ai_optimization/chat_gpt/llm_scraper/task_get/advanced/${id}`
      );

      return response;
    },
    apiClient
  );

  // ChatGPT Scraper Task Get HTML
  registerTool(
    server,
    "ai_chatgpt_scraper_task_get_html",
    z.object({
      id: z.string().describe("Task identifier in UUID format")
    }),
    async (params, client) => {
      const response = await client.get<DataForSeoResponse<any>>(
        `/ai_optimization/chat_gpt/llm_scraper/task_get/html/${params.id}`
      );

      return response;
    },
    apiClient
  );

  // ============================================
  // Claude LLM Responses
  // ============================================

  // Claude Models List
  registerTool(
    server,
    "ai_claude_models",
    {},
    async (_params, client) => {
      const response = await client.get<DataForSeoResponse<any>>(
        "/ai_optimization/claude/llm_responses/models"
      );

      return response;
    },
    apiClient
  );

  // Claude LLM Responses Live
  registerTool(
    server,
    "ai_claude_llm_responses_live",
    llmResponseBaseSchema,
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/ai_optimization/claude/llm_responses/live",
        [params]
      );

      return response;
    },
    apiClient
  );

  // Claude LLM Responses Task-based (POST, READY, GET)
  registerTaskTool(
    server,
    "ai_claude_llm_responses_task",
    llmResponseTaskSchema,
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<TaskPostResponse>>(
        "/ai_optimization/claude/llm_responses/task_post",
        [params]
      );

      return response;
    },
    async (client) => {
      const response = await client.get<DataForSeoResponse<TaskReadyResponse>>(
        "/ai_optimization/claude/llm_responses/tasks_ready"
      );

      return response;
    },
    async (id, client) => {
      const response = await client.get<DataForSeoResponse<TaskGetResponse<any>>>(
        `/ai_optimization/claude/llm_responses/task_get/${id}`
      );

      return response;
    },
    apiClient
  );

  // ============================================
  // Gemini LLM Responses
  // ============================================

  // Gemini Models List
  registerTool(
    server,
    "ai_gemini_models",
    {},
    async (_params, client) => {
      const response = await client.get<DataForSeoResponse<any>>(
        "/ai_optimization/gemini/llm_responses/models"
      );

      return response;
    },
    apiClient
  );

  // Gemini LLM Responses Live
  registerTool(
    server,
    "ai_gemini_llm_responses_live",
    llmResponseBaseSchema,
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/ai_optimization/gemini/llm_responses/live",
        [params]
      );

      return response;
    },
    apiClient
  );

  // ============================================
  // Perplexity LLM Responses
  // ============================================

  // Perplexity Models List
  registerTool(
    server,
    "ai_perplexity_models",
    {},
    async (_params, client) => {
      const response = await client.get<DataForSeoResponse<any>>(
        "/ai_optimization/perplexity/llm_responses/models"
      );

      return response;
    },
    apiClient
  );

  // Perplexity LLM Responses Live
  registerTool(
    server,
    "ai_perplexity_llm_responses_live",
    llmResponseBaseSchema,
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/ai_optimization/perplexity/llm_responses/live",
        [params]
      );

      return response;
    },
    apiClient
  );

  // ============================================
  // AI Keyword Data
  // ============================================

  // AI Keyword Data Available Filters
  registerTool(
    server,
    "ai_keyword_data_available_filters",
    {},
    async (_params, client) => {
      const response = await client.get<DataForSeoResponse<any>>(
        "/ai_optimization/ai_keyword_data/available_filters"
      );

      return response;
    },
    apiClient
  );

  // AI Keyword Data Locations and Languages
  registerTool(
    server,
    "ai_keyword_data_locations_and_languages",
    {},
    async (_params, client) => {
      const response = await client.get<DataForSeoResponse<any>>(
        "/ai_optimization/ai_keyword_data/locations_and_languages"
      );

      return response;
    },
    apiClient
  );

  // AI Keyword Data Keywords Search Volume Live
  registerTool(
    server,
    "ai_keyword_data_search_volume_live",
    z.object({
      keywords: z.array(z.string()).min(1).max(1000).describe("Keywords to get search volume for"),
      location_name: z.string().optional().describe("Full name of location"),
      location_code: z.number().optional().describe("Unique location identifier"),
      language_name: z.string().optional().describe("Full name of language"),
      language_code: z.string().optional().describe("Language code"),
      filters: z.array(z.any()).optional().describe("Array of filter objects"),
      tag: z.string().max(255).optional().describe("User-defined task identifier")
    }),
    async (params, client) => {
      const response = await client.post<DataForSeoResponse<any>>(
        "/ai_optimization/ai_keyword_data/keywords_search_volume/live",
        [params]
      );

      return response;
    },
    apiClient
  );
}
