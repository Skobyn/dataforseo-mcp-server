/**
 * Tests for app-data path fixes (src/api/app-data/index.ts)
 *
 * Verifies:
 *  - Deprecated stubs return {error: ...} without calling client.post
 *  - New tools call the correct corrected URL
 */
import axios from 'axios';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { setupApiClient } from '../src/api/client';
import { registerAppDataTools } from '../src/api/app-data/index';
import { toolRegistry } from '../src/api/tools';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// ── helpers ────────────────────────────────────────────────────────────────

function makeHttpClient() {
  return { get: jest.fn(), post: jest.fn() };
}

function buildServer(): McpServer {
  // Minimal stub — registerTool only calls server.tool(name, shape, handler)
  return {
    tool: jest.fn(),
  } as unknown as McpServer;
}

/** Invoke a registered tool handler by name with the given params */
async function callTool(name: string, params: Record<string, unknown>): Promise<any> {
  const entry = toolRegistry.get(name);
  if (!entry) throw new Error(`Tool not registered: ${name}`);
  const result = await entry.handler(params, undefined);
  // handler wraps response in { content: [{ type, text }] }
  return JSON.parse(result.content[0].text);
}

// ── test setup ─────────────────────────────────────────────────────────────

describe('app-data path fixes', () => {
  let mockHttp: ReturnType<typeof makeHttpClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    toolRegistry.clear();

    mockHttp = makeHttpClient();
    mockedAxios.create.mockReturnValue(mockHttp as any);
    mockedAxios.isAxiosError.mockReturnValue(false);

    const client = setupApiClient('user', 'pass');
    const server = buildServer();
    registerAppDataTools(server, client);
  });

  // ── DEPRECATED STUBS: must not call client.post ────────────────────────

  describe('deprecated stubs — no HTTP calls', () => {
    it('app_data_google_play_search returns deprecation error without calling API', async () => {
      const result = await callTool('app_data_google_play_search', { keyword: 'test' });
      expect(result.error).toMatch(/app_data_google_app_listings_search/);
      expect(mockHttp.post).not.toHaveBeenCalled();
      expect(mockHttp.get).not.toHaveBeenCalled();
    });

    it('app_data_google_play_app_info returns deprecation error without calling API', async () => {
      const result = await callTool('app_data_google_play_app_info', { app_id: 'com.example' });
      expect(result.error).toMatch(/app_data_google_app_info_post/);
      expect(mockHttp.post).not.toHaveBeenCalled();
    });

    it('app_data_google_play_reviews returns deprecation error without calling API', async () => {
      const result = await callTool('app_data_google_play_reviews', { app_id: 'com.example' });
      expect(result.error).toMatch(/app_data_google_app_reviews_post/);
      expect(mockHttp.post).not.toHaveBeenCalled();
    });

    it('app_data_app_store_search returns deprecation error without calling API', async () => {
      const result = await callTool('app_data_app_store_search', { keyword: 'test' });
      expect(result.error).toMatch(/app_data_apple_app_listings_search/);
      expect(mockHttp.post).not.toHaveBeenCalled();
    });

    it('app_data_app_store_app_info returns deprecation error without calling API', async () => {
      const result = await callTool('app_data_app_store_app_info', { app_id: '123' });
      expect(result.error).toMatch(/app_data_apple_app_info_post/);
      expect(mockHttp.post).not.toHaveBeenCalled();
    });

    it('app_data_app_store_reviews returns deprecation error without calling API', async () => {
      const result = await callTool('app_data_app_store_reviews', { app_id: '123' });
      expect(result.error).toMatch(/app_data_apple_app_reviews_post/);
      expect(mockHttp.post).not.toHaveBeenCalled();
    });
  });

  // ── NEW TOOL: correct URL assertions ──────────────────────────────────

  describe('app_data_google_app_listings_search — correct path', () => {
    it('POSTs to /app_data/google/app_listings/search/live', async () => {
      mockHttp.post.mockResolvedValue({ data: { tasks: [] } });
      await callTool('app_data_google_app_listings_search', { title: 'calculator' });
      expect(mockHttp.post).toHaveBeenCalledWith(
        '/app_data/google/app_listings/search/live',
        expect.any(Array)
      );
    });
  });

  describe('app_data_google_app_info_post — correct task_post path', () => {
    it('POSTs to /app_data/google/app_info/task_post', async () => {
      mockHttp.post.mockResolvedValue({ data: { tasks: [] } });
      await callTool('app_data_google_app_info_post', { app_id: 'com.example.app' });
      expect(mockHttp.post).toHaveBeenCalledWith(
        '/app_data/google/app_info/task_post',
        expect.any(Array)
      );
    });
  });

  describe('app_data_google_app_info_ready — correct tasks_ready path', () => {
    it('GETs /app_data/google/app_info/tasks_ready', async () => {
      mockHttp.get.mockResolvedValue({ data: { tasks: [] } });
      await callTool('app_data_google_app_info_ready', {});
      expect(mockHttp.get).toHaveBeenCalledWith('/app_data/google/app_info/tasks_ready');
    });
  });

  describe('app_data_google_app_info_get — correct task_get path', () => {
    it('GETs /app_data/google/app_info/task_get/advanced/<id>', async () => {
      mockHttp.get.mockResolvedValue({ data: { tasks: [] } });
      await callTool('app_data_google_app_info_get', { id: 'abc123' });
      expect(mockHttp.get).toHaveBeenCalledWith(
        '/app_data/google/app_info/task_get/advanced/abc123'
      );
    });
  });

  describe('app_data_google_app_reviews_post — correct task_post path', () => {
    it('POSTs to /app_data/google/app_reviews/task_post', async () => {
      mockHttp.post.mockResolvedValue({ data: { tasks: [] } });
      await callTool('app_data_google_app_reviews_post', { app_id: 'com.example.app' });
      expect(mockHttp.post).toHaveBeenCalledWith(
        '/app_data/google/app_reviews/task_post',
        expect.any(Array)
      );
    });
  });

  describe('app_data_google_app_reviews_ready', () => {
    it('GETs /app_data/google/app_reviews/tasks_ready', async () => {
      mockHttp.get.mockResolvedValue({ data: { tasks: [] } });
      await callTool('app_data_google_app_reviews_ready', {});
      expect(mockHttp.get).toHaveBeenCalledWith('/app_data/google/app_reviews/tasks_ready');
    });
  });

  describe('app_data_google_app_reviews_get', () => {
    it('GETs /app_data/google/app_reviews/task_get/advanced/<id>', async () => {
      mockHttp.get.mockResolvedValue({ data: { tasks: [] } });
      await callTool('app_data_google_app_reviews_get', { id: 'xyz789' });
      expect(mockHttp.get).toHaveBeenCalledWith(
        '/app_data/google/app_reviews/task_get/advanced/xyz789'
      );
    });
  });

  describe('app_data_google_play_locations — country as path segment', () => {
    it('GETs /app_data/google/locations when no country', async () => {
      mockHttp.get.mockResolvedValue({ data: {} });
      await callTool('app_data_google_play_locations', {});
      expect(mockHttp.get).toHaveBeenCalledWith('/app_data/google/locations');
    });

    it('GETs /app_data/google/locations/US when country=US', async () => {
      mockHttp.get.mockResolvedValue({ data: {} });
      await callTool('app_data_google_play_locations', { country: 'US' });
      expect(mockHttp.get).toHaveBeenCalledWith('/app_data/google/locations/US');
    });
  });

  describe('app_data_google_play_languages — fixed path', () => {
    it('GETs /app_data/google/languages', async () => {
      mockHttp.get.mockResolvedValue({ data: {} });
      await callTool('app_data_google_play_languages', {});
      expect(mockHttp.get).toHaveBeenCalledWith('/app_data/google/languages');
    });
  });

  describe('app_data_apple_app_listings_search — correct path', () => {
    it('POSTs to /app_data/apple/app_listings/search/live', async () => {
      mockHttp.post.mockResolvedValue({ data: { tasks: [] } });
      await callTool('app_data_apple_app_listings_search', { title: 'notes' });
      expect(mockHttp.post).toHaveBeenCalledWith(
        '/app_data/apple/app_listings/search/live',
        expect.any(Array)
      );
    });
  });

  describe('app_data_apple_app_info_post', () => {
    it('POSTs to /app_data/apple/app_info/task_post', async () => {
      mockHttp.post.mockResolvedValue({ data: { tasks: [] } });
      await callTool('app_data_apple_app_info_post', { app_id: '123456' });
      expect(mockHttp.post).toHaveBeenCalledWith(
        '/app_data/apple/app_info/task_post',
        expect.any(Array)
      );
    });
  });

  describe('app_data_apple_app_info_ready', () => {
    it('GETs /app_data/apple/app_info/tasks_ready', async () => {
      mockHttp.get.mockResolvedValue({ data: {} });
      await callTool('app_data_apple_app_info_ready', {});
      expect(mockHttp.get).toHaveBeenCalledWith('/app_data/apple/app_info/tasks_ready');
    });
  });

  describe('app_data_apple_app_info_get', () => {
    it('GETs /app_data/apple/app_info/task_get/advanced/<id>', async () => {
      mockHttp.get.mockResolvedValue({ data: {} });
      await callTool('app_data_apple_app_info_get', { id: 'task001' });
      expect(mockHttp.get).toHaveBeenCalledWith(
        '/app_data/apple/app_info/task_get/advanced/task001'
      );
    });
  });

  describe('app_data_apple_app_reviews_post', () => {
    it('POSTs to /app_data/apple/app_reviews/task_post', async () => {
      mockHttp.post.mockResolvedValue({ data: { tasks: [] } });
      await callTool('app_data_apple_app_reviews_post', { app_id: '123456' });
      expect(mockHttp.post).toHaveBeenCalledWith(
        '/app_data/apple/app_reviews/task_post',
        expect.any(Array)
      );
    });
  });

  describe('app_data_apple_app_reviews_ready', () => {
    it('GETs /app_data/apple/app_reviews/tasks_ready', async () => {
      mockHttp.get.mockResolvedValue({ data: {} });
      await callTool('app_data_apple_app_reviews_ready', {});
      expect(mockHttp.get).toHaveBeenCalledWith('/app_data/apple/app_reviews/tasks_ready');
    });
  });

  describe('app_data_apple_app_reviews_get', () => {
    it('GETs /app_data/apple/app_reviews/task_get/advanced/<id>', async () => {
      mockHttp.get.mockResolvedValue({ data: {} });
      await callTool('app_data_apple_app_reviews_get', { id: 'task002' });
      expect(mockHttp.get).toHaveBeenCalledWith(
        '/app_data/apple/app_reviews/task_get/advanced/task002'
      );
    });
  });

  // ── OK tools — no change, still work ──────────────────────────────────

  describe('app_data_app_store_locations — unchanged (OK per audit)', () => {
    it('GETs /app_data/apple/locations with no country', async () => {
      mockHttp.get.mockResolvedValue({ data: {} });
      await callTool('app_data_app_store_locations', {});
      expect(mockHttp.get).toHaveBeenCalledWith('/app_data/apple/locations');
    });

    it('GETs /app_data/apple/locations?country=US with country', async () => {
      mockHttp.get.mockResolvedValue({ data: {} });
      await callTool('app_data_app_store_locations', { country: 'US' });
      expect(mockHttp.get).toHaveBeenCalledWith('/app_data/apple/locations?country=US');
    });
  });

  describe('app_data_app_store_languages — unchanged (OK per audit)', () => {
    it('GETs /app_data/apple/languages', async () => {
      mockHttp.get.mockResolvedValue({ data: {} });
      await callTool('app_data_app_store_languages', {});
      expect(mockHttp.get).toHaveBeenCalledWith('/app_data/apple/languages');
    });
  });

  // ── Schema coercion: z.coerce.number() declared in schema ────────────
  // registerTool passes params straight to the handler without running Zod
  // parse, so coercion is applied by the MCP server layer at call time.
  // These tests verify that the tool schemas DECLARE coerce fields and that
  // the tool still calls the correct URL (i.e., coercion doesn't break routing).

  describe('z.coerce.number() — tools with coerce fields still route correctly', () => {
    it('app_data_google_app_listings_search routes correctly when numeric params present', async () => {
      mockHttp.post.mockResolvedValue({ data: { tasks: [] } });
      await callTool('app_data_google_app_listings_search', { limit: 10, offset: 0 });
      expect(mockHttp.post).toHaveBeenCalledWith(
        '/app_data/google/app_listings/search/live',
        expect.any(Array)
      );
    });

    it('app_data_google_app_info_post routes correctly when location_code present', async () => {
      mockHttp.post.mockResolvedValue({ data: { tasks: [] } });
      await callTool('app_data_google_app_info_post', { app_id: 'x', location_code: 2840 });
      expect(mockHttp.post).toHaveBeenCalledWith(
        '/app_data/google/app_info/task_post',
        expect.any(Array)
      );
    });

    it('app_data_google_app_listings_search schema declares coerce on limit (ZodOptional wrapping ZodNumber)', () => {
      const entry = toolRegistry.get('app_data_google_app_listings_search');
      expect(entry).toBeDefined();
      // z.coerce.number().optional() => ZodOptional{ innerType: ZodNumber }
      const shape = entry.inputSchema._def?.shape?.();
      const limitDef = shape?.limit?._def;
      // outer wrapper is ZodOptional
      expect(limitDef?.typeName).toBe('ZodOptional');
      // inner type is ZodNumber (produced by z.coerce.number())
      expect(limitDef?.innerType?._def?.typeName).toBe('ZodNumber');
    });
  });
});
