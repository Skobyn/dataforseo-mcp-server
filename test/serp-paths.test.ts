/**
 * Tests for src/api/serp/index.ts — verifies that each tool handler calls
 * the correct DataForSEO API path after the v1.1.0 endpoint corrections.
 *
 * Mocking strategy mirrors test/client.test.ts: we intercept client.post /
 * client.get directly on a fake DataForSeoClient object.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSerpTools } from "../src/api/serp/index.js";
import { DataForSeoClient } from "../src/api/client.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal fake DataForSeoClient with jest spy methods. */
function makeFakeClient() {
  const mockPost = jest.fn().mockResolvedValue({});
  const mockGet = jest.fn().mockResolvedValue({});

  const client = {
    login: "test",
    password: "test",
    baseUrl: "https://api.dataforseo.com/v3",
    httpClient: {} as any,
    post: mockPost,
    get: mockGet,
  } as unknown as DataForSeoClient;

  return { client, mockPost, mockGet };
}

/** Build a minimal fake McpServer. registerTool / registerTaskTool call
 *  (server.tool as any)(name, shape, handler) — we need to capture those
 *  handlers so tests can call them directly without spinning up a real MCP
 *  server.
 */
function makeFakeServer() {
  const handlers: Record<string, (params: any, client: any) => Promise<any>> = {};

  const fakeServer = {
    tool: (name: string, _shape: any, handler: (params: any, _ctx: any) => Promise<any>) => {
      handlers[name] = handler;
    },
  } as unknown as McpServer;

  return { fakeServer, handlers };
}

/**
 * Extract the inner handler from a registerTool wrapper.
 *
 * registerTool wraps the user's handler in a try/catch closure that returns
 * { content: [{ type: 'text', text: JSON }] }.  We call it and unwrap the
 * first content item's text back to an object so assertions are simple.
 */
async function invoke(handler: (params: any, ctx: any) => Promise<any>, params: any) {
  const result = await handler(params, {});
  if (result && Array.isArray(result.content)) {
    try {
      return JSON.parse(result.content[0].text);
    } catch {
      return result;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Common params used across tests
// ---------------------------------------------------------------------------
const baseParams = {
  keyword: "test keyword",
  location_code: "2840", // intentional string — tests coercion
  language_code: "en",
};

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
let handlers: Record<string, (params: any, _ctx: any) => Promise<any>>;
let mockPost: jest.Mock;
let mockGet: jest.Mock;
let client: DataForSeoClient;

beforeEach(() => {
  const fake = makeFakeClient();
  client = fake.client;
  mockPost = fake.mockPost;
  mockGet = fake.mockGet;

  const srv = makeFakeServer();
  handlers = srv.handlers;

  registerSerpTools(srv.fakeServer, client);

  jest.clearAllMocks();
  mockPost.mockResolvedValue({});
  mockGet.mockResolvedValue({});
});

// ---------------------------------------------------------------------------
// Path-fix tests
// ---------------------------------------------------------------------------

describe("serp_google_organic_live", () => {
  it("posts to /serp/google/organic/live/advanced", async () => {
    await invoke(handlers["serp_google_organic_live"], baseParams);
    expect(mockPost).toHaveBeenCalledWith(
      "/serp/google/organic/live/advanced",
      expect.any(Array)
    );
  });
});

describe("serp_google_organic_task_get (via registerTaskTool)", () => {
  it("gets /serp/google/organic/task_get/advanced/<id>", async () => {
    const handlerName = "serp_google_organic_task_get";
    await invoke(handlers[handlerName], { id: "abc123" });
    expect(mockGet).toHaveBeenCalledWith(
      "/serp/google/organic/task_get/advanced/abc123"
    );
  });

  it("task_post posts to /serp/google/organic/task_post", async () => {
    await invoke(handlers["serp_google_organic_task_post"], baseParams);
    expect(mockPost).toHaveBeenCalledWith(
      "/serp/google/organic/task_post",
      expect.any(Array)
    );
  });

  it("task_ready gets /serp/google/organic/tasks_ready", async () => {
    await invoke(handlers["serp_google_organic_task_ready"], {});
    expect(mockGet).toHaveBeenCalledWith("/serp/google/organic/tasks_ready");
  });
});

describe("serp_google_maps_live", () => {
  it("posts to /serp/google/maps/live/advanced (unchanged — was already correct)", async () => {
    await invoke(handlers["serp_google_maps_live"], {
      keyword: "pizza",
      location_code: "2840",
      language_code: "en",
    });
    expect(mockPost).toHaveBeenCalledWith(
      "/serp/google/maps/live/advanced",
      expect.any(Array)
    );
  });
});

describe("serp_google_images_live", () => {
  it("posts to /serp/google/images/live/advanced", async () => {
    await invoke(handlers["serp_google_images_live"], baseParams);
    expect(mockPost).toHaveBeenCalledWith(
      "/serp/google/images/live/advanced",
      expect.any(Array)
    );
  });
});

describe("serp_google_news_live", () => {
  it("posts to /serp/google/news/live/advanced", async () => {
    await invoke(handlers["serp_google_news_live"], baseParams);
    expect(mockPost).toHaveBeenCalledWith(
      "/serp/google/news/live/advanced",
      expect.any(Array)
    );
  });
});

describe("serp_bing_organic_live", () => {
  it("posts to /serp/bing/organic/live/advanced", async () => {
    await invoke(handlers["serp_bing_organic_live"], baseParams);
    expect(mockPost).toHaveBeenCalledWith(
      "/serp/bing/organic/live/advanced",
      expect.any(Array)
    );
  });
});

describe("serp_yahoo_organic_live", () => {
  it("posts to /serp/yahoo/organic/live/advanced", async () => {
    await invoke(handlers["serp_yahoo_organic_live"], baseParams);
    expect(mockPost).toHaveBeenCalledWith(
      "/serp/yahoo/organic/live/advanced",
      expect.any(Array)
    );
  });
});

describe("serp_youtube_organic_live", () => {
  it("posts to /serp/youtube/organic/live/advanced", async () => {
    await invoke(handlers["serp_youtube_organic_live"], baseParams);
    expect(mockPost).toHaveBeenCalledWith(
      "/serp/youtube/organic/live/advanced",
      expect.any(Array)
    );
  });
});

// ---------------------------------------------------------------------------
// Deprecation stubs — must return error field without calling client.post
// ---------------------------------------------------------------------------

describe("serp_google_jobs_live (deprecation stub)", () => {
  it("returns an error object without calling client.post", async () => {
    const result = await invoke(handlers["serp_google_jobs_live"], baseParams);
    expect(result).toHaveProperty("error");
    expect(typeof result.error).toBe("string");
    expect(mockPost).not.toHaveBeenCalled();
  });
});

describe("serp_google_shopping_live (deprecation stub)", () => {
  it("returns an error object without calling client.post", async () => {
    const result = await invoke(handlers["serp_google_shopping_live"], baseParams);
    expect(result).toHaveProperty("error");
    expect(result.error).toMatch(/merchant/i);
    expect(mockPost).not.toHaveBeenCalled();
  });
});

describe("serp_baidu_organic_live (deprecation stub)", () => {
  it("returns an error object without calling client.post", async () => {
    const result = await invoke(handlers["serp_baidu_organic_live"], baseParams);
    expect(result).toHaveProperty("error");
    expect(typeof result.error).toBe("string");
    expect(mockPost).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// New task-based tools for Google Jobs and Baidu Organic
// ---------------------------------------------------------------------------

describe("serp_google_jobs_task_post / task_ready / task_get", () => {
  it("task_post posts to /serp/google/jobs/task_post", async () => {
    await invoke(handlers["serp_google_jobs_task_post"], baseParams);
    expect(mockPost).toHaveBeenCalledWith(
      "/serp/google/jobs/task_post",
      expect.any(Array)
    );
  });

  it("task_ready gets /serp/google/jobs/tasks_ready", async () => {
    await invoke(handlers["serp_google_jobs_task_ready"], {});
    expect(mockGet).toHaveBeenCalledWith("/serp/google/jobs/tasks_ready");
  });

  it("task_get gets /serp/google/jobs/task_get/advanced/<id>", async () => {
    await invoke(handlers["serp_google_jobs_task_get"], { id: "job999" });
    expect(mockGet).toHaveBeenCalledWith(
      "/serp/google/jobs/task_get/advanced/job999"
    );
  });
});

describe("serp_baidu_organic_task_post / task_ready / task_get", () => {
  it("task_post posts to /serp/baidu/organic/task_post", async () => {
    await invoke(handlers["serp_baidu_organic_task_post"], baseParams);
    expect(mockPost).toHaveBeenCalledWith(
      "/serp/baidu/organic/task_post",
      expect.any(Array)
    );
  });

  it("task_ready gets /serp/baidu/organic/tasks_ready", async () => {
    await invoke(handlers["serp_baidu_organic_task_ready"], {});
    expect(mockGet).toHaveBeenCalledWith("/serp/baidu/organic/tasks_ready");
  });

  it("task_get gets /serp/baidu/organic/task_get/advanced/<id>", async () => {
    await invoke(handlers["serp_baidu_organic_task_get"], { id: "baidu42" });
    expect(mockGet).toHaveBeenCalledWith(
      "/serp/baidu/organic/task_get/advanced/baidu42"
    );
  });
});

// ---------------------------------------------------------------------------
// serp_google_locations — ISO code as path segment
// ---------------------------------------------------------------------------

describe("serp_google_locations", () => {
  it("gets /serp/google/locations when no country provided", async () => {
    await invoke(handlers["serp_google_locations"], {});
    expect(mockGet).toHaveBeenCalledWith("/serp/google/locations");
  });

  it("gets /serp/google/locations/us when country_iso_code='us'", async () => {
    await invoke(handlers["serp_google_locations"], { country_iso_code: "us" });
    expect(mockGet).toHaveBeenCalledWith("/serp/google/locations/us");
  });

  it("gets /serp/google/locations/ro when country_iso_code='RO' (uppercased → lowercased)", async () => {
    await invoke(handlers["serp_google_locations"], { country_iso_code: "RO" });
    expect(mockGet).toHaveBeenCalledWith("/serp/google/locations/ro");
  });

  it("uses legacy `country` field as iso_code when it looks like an ISO code", async () => {
    await invoke(handlers["serp_google_locations"], { country: "gb" });
    expect(mockGet).toHaveBeenCalledWith("/serp/google/locations/gb");
  });

  it("ignores legacy `country` field that looks like a full name", async () => {
    // 'United States' is not ≤3 alpha chars — falls back to no iso_code
    await invoke(handlers["serp_google_locations"], { country: "United States" });
    expect(mockGet).toHaveBeenCalledWith("/serp/google/locations");
  });
});

// ---------------------------------------------------------------------------
// serp_google_languages — unchanged, quick sanity check
// ---------------------------------------------------------------------------

describe("serp_google_languages", () => {
  it("gets /serp/google/languages", async () => {
    await invoke(handlers["serp_google_languages"], {});
    expect(mockGet).toHaveBeenCalledWith("/serp/google/languages");
  });
});

// ---------------------------------------------------------------------------
// Schema coercion: z.coerce.number() for location_code and depth
// ---------------------------------------------------------------------------

describe("z.coerce.number() — location_code and depth accept strings", () => {
  it("location_code coerced from string '2840' posts without throwing", async () => {
    await expect(
      invoke(handlers["serp_google_organic_live"], {
        keyword: "test",
        location_code: "2840",
        language_code: "en",
      })
    ).resolves.not.toThrow();
    expect(mockPost).toHaveBeenCalled();
  });

  it("depth coerced from string '10' does not throw", async () => {
    await expect(
      invoke(handlers["serp_google_organic_live"], {
        keyword: "test",
        location_code: 2840,
        language_code: "en",
        depth: "10",
      })
    ).resolves.not.toThrow();
    expect(mockPost).toHaveBeenCalled();
  });

  it("priority coerced from string '1' does not throw in task_post", async () => {
    await expect(
      invoke(handlers["serp_google_organic_task_post"], {
        keyword: "test",
        location_code: 2840,
        language_code: "en",
        priority: "1",
      })
    ).resolves.not.toThrow();
    expect(mockPost).toHaveBeenCalled();
  });
});
