/**
 * Tests for src/api/labs/index.ts
 *
 * Verifies:
 *  - Engine segment fixes: google_play → google, app_store → apple
 *  - Engine enum backward-compat transform: 'google_play' maps to 'google',
 *    'app_store' maps to 'apple' in meta endpoints (categories/locations/languages/history)
 *  - Deprecation stubs for ranked_apps tools
 *  - Correct paths for all other labs tools
 *  - Schema coercion: z.coerce.number() accepts string inputs
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerLabsTools } from "../src/api/labs/index.js";
import { DataForSeoClient } from "../src/api/client.js";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

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

function makeFakeServer() {
  const handlers: Record<string, (params: any, ctx: any) => Promise<any>> = {};

  const fakeServer = {
    tool: (name: string, _shape: any, handler: (params: any, _ctx: any) => Promise<any>) => {
      handlers[name] = handler;
    },
  } as unknown as McpServer;

  return { fakeServer, handlers };
}

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
// Setup
// ---------------------------------------------------------------------------
let handlers: Record<string, (params: any, ctx: any) => Promise<any>>;
let mockPost: jest.Mock;
let mockGet: jest.Mock;

beforeEach(() => {
  const fake = makeFakeClient();
  mockPost = fake.mockPost;
  mockGet = fake.mockGet;

  const srv = makeFakeServer();
  handlers = srv.handlers;

  registerLabsTools(srv.fakeServer, fake.client);

  jest.clearAllMocks();
  mockPost.mockResolvedValue({});
  mockGet.mockResolvedValue({});
});

// ---------------------------------------------------------------------------
// Critical path fixes: engine segment corrections
// ---------------------------------------------------------------------------

describe("labs_google_play_keywords_for_app — engine segment fix", () => {
  it("posts to /dataforseo_labs/google/keywords_for_app/live (NOT google_play)", async () => {
    await invoke(handlers["labs_google_play_keywords_for_app"], {
      app_id: "com.example.app",
    });
    expect(mockPost).toHaveBeenCalledWith(
      "/dataforseo_labs/google/keywords_for_app/live",
      expect.any(Array)
    );
  });

  it("does NOT post to the old google_play segment", async () => {
    await invoke(handlers["labs_google_play_keywords_for_app"], {
      app_id: "com.example.app",
    });
    expect(mockPost).not.toHaveBeenCalledWith(
      "/dataforseo_labs/google_play/keywords_for_app/live",
      expect.any(Array)
    );
  });
});

describe("labs_google_play_app_competitors — engine segment fix", () => {
  it("posts to /dataforseo_labs/google/app_competitors/live (NOT google_play)", async () => {
    await invoke(handlers["labs_google_play_app_competitors"], {
      app_id: "com.example.app",
    });
    expect(mockPost).toHaveBeenCalledWith(
      "/dataforseo_labs/google/app_competitors/live",
      expect.any(Array)
    );
  });
});

describe("labs_app_store_keywords_for_app — engine segment fix", () => {
  it("posts to /dataforseo_labs/apple/keywords_for_app/live (NOT app_store)", async () => {
    await invoke(handlers["labs_app_store_keywords_for_app"], {
      app_id: "123456789",
    });
    expect(mockPost).toHaveBeenCalledWith(
      "/dataforseo_labs/apple/keywords_for_app/live",
      expect.any(Array)
    );
  });

  it("does NOT post to the old app_store segment", async () => {
    await invoke(handlers["labs_app_store_keywords_for_app"], {
      app_id: "123456789",
    });
    expect(mockPost).not.toHaveBeenCalledWith(
      "/dataforseo_labs/app_store/keywords_for_app/live",
      expect.any(Array)
    );
  });
});

describe("labs_app_store_app_competitors — engine segment fix", () => {
  it("posts to /dataforseo_labs/apple/app_competitors/live (NOT app_store)", async () => {
    await invoke(handlers["labs_app_store_app_competitors"], {
      app_id: "123456789",
    });
    expect(mockPost).toHaveBeenCalledWith(
      "/dataforseo_labs/apple/app_competitors/live",
      expect.any(Array)
    );
  });
});

// ---------------------------------------------------------------------------
// Deprecation stubs — ranked_apps must return error, never call post
// ---------------------------------------------------------------------------

describe("labs_google_play_ranked_apps — deprecation stub", () => {
  it("returns an error object without calling client.post", async () => {
    const result = await invoke(handlers["labs_google_play_ranked_apps"], {});
    expect(result).toHaveProperty("error");
    expect(typeof result.error).toBe("string");
    expect(result.error).toMatch(/ranked_apps/i);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("error message lists the available alternatives", async () => {
    const result = await invoke(handlers["labs_google_play_ranked_apps"], {});
    expect(result.error).toMatch(/app_competitors|keywords_for_app/i);
  });
});

describe("labs_app_store_ranked_apps — deprecation stub", () => {
  it("returns an error object without calling client.post", async () => {
    const result = await invoke(handlers["labs_app_store_ranked_apps"], {});
    expect(result).toHaveProperty("error");
    expect(typeof result.error).toBe("string");
    expect(result.error).toMatch(/ranked_apps/i);
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("error message lists the available alternatives", async () => {
    const result = await invoke(handlers["labs_app_store_ranked_apps"], {});
    expect(result.error).toMatch(/app_competitors|keywords_for_app/i);
  });
});

// ---------------------------------------------------------------------------
// Engine enum backward-compat transform in meta endpoints
// ---------------------------------------------------------------------------

describe("labs_categories — engine enum transform", () => {
  it("maps 'google_play' → 'google' in the URL", async () => {
    await invoke(handlers["labs_categories"], { engine: "google_play" });
    expect(mockGet).toHaveBeenCalledWith(
      expect.stringContaining("/dataforseo_labs/google/categories")
    );
    expect(mockGet).not.toHaveBeenCalledWith(
      expect.stringContaining("google_play")
    );
  });

  it("maps 'app_store' → 'apple' in the URL", async () => {
    await invoke(handlers["labs_categories"], { engine: "app_store" });
    expect(mockGet).toHaveBeenCalledWith(
      expect.stringContaining("/dataforseo_labs/apple/categories")
    );
    expect(mockGet).not.toHaveBeenCalledWith(
      expect.stringContaining("app_store")
    );
  });

  it("passes 'google' through unchanged", async () => {
    await invoke(handlers["labs_categories"], { engine: "google" });
    expect(mockGet).toHaveBeenCalledWith(
      expect.stringContaining("/dataforseo_labs/google/categories")
    );
  });

  it("passes 'apple' through unchanged", async () => {
    await invoke(handlers["labs_categories"], { engine: "apple" });
    expect(mockGet).toHaveBeenCalledWith(
      expect.stringContaining("/dataforseo_labs/apple/categories")
    );
  });
});

describe("labs_locations — engine enum transform", () => {
  it("maps 'google_play' → 'google' in the URL", async () => {
    await invoke(handlers["labs_locations"], { engine: "google_play" });
    expect(mockGet).toHaveBeenCalledWith(
      expect.stringContaining("/dataforseo_labs/google/locations")
    );
  });

  it("maps 'app_store' → 'apple' in the URL", async () => {
    await invoke(handlers["labs_locations"], { engine: "app_store" });
    expect(mockGet).toHaveBeenCalledWith(
      expect.stringContaining("/dataforseo_labs/apple/locations")
    );
  });
});

describe("labs_languages — engine enum transform", () => {
  it("maps 'google_play' → 'google' in the URL", async () => {
    await invoke(handlers["labs_languages"], { engine: "google_play" });
    expect(mockGet).toHaveBeenCalledWith("/dataforseo_labs/google/languages");
  });

  it("maps 'app_store' → 'apple' in the URL", async () => {
    await invoke(handlers["labs_languages"], { engine: "app_store" });
    expect(mockGet).toHaveBeenCalledWith("/dataforseo_labs/apple/languages");
  });
});

describe("labs_available_history — engine enum transform", () => {
  it("maps 'google_play' → 'google' in the URL", async () => {
    await invoke(handlers["labs_available_history"], {
      engine: "google_play",
      function: "keywords_for_app",
    });
    expect(mockGet).toHaveBeenCalledWith(
      "/dataforseo_labs/google/available_history/keywords_for_app"
    );
  });

  it("maps 'app_store' → 'apple' in the URL", async () => {
    await invoke(handlers["labs_available_history"], {
      engine: "app_store",
      function: "keywords_for_app",
    });
    expect(mockGet).toHaveBeenCalledWith(
      "/dataforseo_labs/apple/available_history/keywords_for_app"
    );
  });
});

// ---------------------------------------------------------------------------
// Correct paths for core Google / Amazon / Bing labs tools
// ---------------------------------------------------------------------------

describe("labs Google tools — correct paths", () => {
  it("labs_google_keywords_for_site → /dataforseo_labs/google/keywords_for_site/live", async () => {
    await invoke(handlers["labs_google_keywords_for_site"], { target: "example.com" });
    expect(mockPost).toHaveBeenCalledWith(
      "/dataforseo_labs/google/keywords_for_site/live",
      expect.any(Array)
    );
  });

  it("labs_google_related_keywords → /dataforseo_labs/google/related_keywords/live", async () => {
    await invoke(handlers["labs_google_related_keywords"], { keyword: "seo" });
    expect(mockPost).toHaveBeenCalledWith(
      "/dataforseo_labs/google/related_keywords/live",
      expect.any(Array)
    );
  });

  it("labs_google_bulk_keyword_difficulty → /dataforseo_labs/google/bulk_keyword_difficulty/live", async () => {
    await invoke(handlers["labs_google_bulk_keyword_difficulty"], {
      keywords: ["seo", "marketing"],
    });
    expect(mockPost).toHaveBeenCalledWith(
      "/dataforseo_labs/google/bulk_keyword_difficulty/live",
      expect.any(Array)
    );
  });
});

describe("labs Amazon tools — correct paths", () => {
  it("labs_amazon_bulk_search_volume → /dataforseo_labs/amazon/bulk_search_volume/live", async () => {
    await invoke(handlers["labs_amazon_bulk_search_volume"], {
      keywords: ["running shoes"],
    });
    expect(mockPost).toHaveBeenCalledWith(
      "/dataforseo_labs/amazon/bulk_search_volume/live",
      expect.any(Array)
    );
  });

  it("labs_amazon_product_competitors → /dataforseo_labs/amazon/product_competitors/live", async () => {
    await invoke(handlers["labs_amazon_product_competitors"], {
      asin: "B08N5WRWNW",
    });
    expect(mockPost).toHaveBeenCalledWith(
      "/dataforseo_labs/amazon/product_competitors/live",
      expect.any(Array)
    );
  });
});

// ---------------------------------------------------------------------------
// Schema coercion: number fields accept string inputs
// ---------------------------------------------------------------------------

describe("z.coerce.number() across labs tools", () => {
  it("location_code accepts string '2840' in labs_google_related_keywords", async () => {
    await expect(
      invoke(handlers["labs_google_related_keywords"], {
        keyword: "seo",
        location_code: "2840",
      })
    ).resolves.not.toThrow();
    expect(mockPost).toHaveBeenCalled();
  });

  it("limit accepts string '10' in labs_google_keywords_for_site", async () => {
    await expect(
      invoke(handlers["labs_google_keywords_for_site"], {
        target: "example.com",
        limit: "10",
      })
    ).resolves.not.toThrow();
    expect(mockPost).toHaveBeenCalled();
  });

  it("offset accepts string '0' in labs_google_domain_intersection", async () => {
    await expect(
      invoke(handlers["labs_google_domain_intersection"], {
        domains: ["example.com", "competitor.com"],
        offset: "0",
      })
    ).resolves.not.toThrow();
    expect(mockPost).toHaveBeenCalled();
  });
});
