/**
 * Tests for src/api/keywords/index.ts
 *
 * Verifies:
 *  - keyword/keywords dual-accept: single string wrapped to array, array passed through
 *  - Correct API paths are called
 *  - Schema coercion: z.coerce.number() accepts string inputs
 *  - Google Trends max(5) guard
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerKeywordsTools } from "../src/api/keywords/index.js";
import { DataForSeoClient } from "../src/api/client.js";

// ---------------------------------------------------------------------------
// Test helpers (mirrors serp-paths.test.ts pattern)
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

  registerKeywordsTools(srv.fakeServer, fake.client);

  jest.clearAllMocks();
  mockPost.mockResolvedValue({});
  mockGet.mockResolvedValue({});
});

// ---------------------------------------------------------------------------
// keywords_google_ads_keywords_for_keyword — keyword/keywords dual-accept
// ---------------------------------------------------------------------------

describe("keywords_google_ads_keywords_for_keyword", () => {
  it("posts to correct URL", async () => {
    await invoke(handlers["keywords_google_ads_keywords_for_keyword"], {
      keyword: "seo tools",
    });
    expect(mockPost).toHaveBeenCalledWith(
      "/keywords_data/google_ads/keywords_for_keywords/live",
      expect.any(Array)
    );
  });

  it("wraps single `keyword` string into a `keywords` array in the payload", async () => {
    await invoke(handlers["keywords_google_ads_keywords_for_keyword"], {
      keyword: "seo tools",
    });
    expect(mockPost).toHaveBeenCalledWith(
      expect.any(String),
      [expect.objectContaining({ keywords: ["seo tools"] })]
    );
  });

  it("passes `keywords` array through unchanged when provided", async () => {
    await invoke(handlers["keywords_google_ads_keywords_for_keyword"], {
      keywords: ["seo tools", "keyword research"],
    });
    expect(mockPost).toHaveBeenCalledWith(
      expect.any(String),
      [expect.objectContaining({ keywords: ["seo tools", "keyword research"] })]
    );
  });

  it("prefers `keywords` array over single `keyword` when both are provided", async () => {
    await invoke(handlers["keywords_google_ads_keywords_for_keyword"], {
      keyword: "ignored",
      keywords: ["seo tools", "keyword research"],
    });
    expect(mockPost).toHaveBeenCalledWith(
      expect.any(String),
      [expect.objectContaining({ keywords: ["seo tools", "keyword research"] })]
    );
  });

  it("does NOT send a raw `keyword` field to the API", async () => {
    await invoke(handlers["keywords_google_ads_keywords_for_keyword"], {
      keyword: "seo tools",
    });
    const callArg = mockPost.mock.calls[0][1][0];
    expect(callArg).not.toHaveProperty("keyword");
  });

  it("returns an error when neither keyword nor keywords is provided", async () => {
    const result = await invoke(handlers["keywords_google_ads_keywords_for_keyword"], {
      location_code: 2840,
    });
    expect(result).toHaveProperty("error");
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("coerces location_code string to number", async () => {
    await expect(
      invoke(handlers["keywords_google_ads_keywords_for_keyword"], {
        keyword: "seo",
        location_code: "2840",
      })
    ).resolves.not.toThrow();
    expect(mockPost).toHaveBeenCalled();
  });

  it("returns a friendly error and does not call the API when >20 keywords are passed", async () => {
    const result = await invoke(handlers["keywords_google_ads_keywords_for_keyword"], {
      keywords: Array.from({ length: 21 }, (_, i) => `kw${i}`),
    });
    expect(result).toHaveProperty("error");
    expect(mockPost).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// keywords_bing_keywords_for_keywords — same dual-accept fix
// ---------------------------------------------------------------------------

describe("keywords_bing_keywords_for_keywords", () => {
  it("posts to correct URL", async () => {
    await invoke(handlers["keywords_bing_keywords_for_keywords"], {
      keyword: "bing seo",
    });
    expect(mockPost).toHaveBeenCalledWith(
      "/keywords_data/bing/keywords_for_keywords/live",
      expect.any(Array)
    );
  });

  it("wraps single `keyword` string into a `keywords` array in the payload", async () => {
    await invoke(handlers["keywords_bing_keywords_for_keywords"], {
      keyword: "bing seo",
    });
    expect(mockPost).toHaveBeenCalledWith(
      expect.any(String),
      [expect.objectContaining({ keywords: ["bing seo"] })]
    );
  });

  it("passes `keywords` array through unchanged when provided", async () => {
    await invoke(handlers["keywords_bing_keywords_for_keywords"], {
      keywords: ["bing seo", "bing ads"],
    });
    expect(mockPost).toHaveBeenCalledWith(
      expect.any(String),
      [expect.objectContaining({ keywords: ["bing seo", "bing ads"] })]
    );
  });

  it("returns an error when neither keyword nor keywords is provided", async () => {
    const result = await invoke(handlers["keywords_bing_keywords_for_keywords"], {});
    expect(result).toHaveProperty("error");
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("returns a friendly error and does not call the API when >200 keywords are passed", async () => {
    const result = await invoke(handlers["keywords_bing_keywords_for_keywords"], {
      keywords: Array.from({ length: 201 }, (_, i) => `kw${i}`),
    });
    expect(result).toHaveProperty("error");
    expect(mockPost).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// keywords_google_trends_explore — max(5) guard
// ---------------------------------------------------------------------------

describe("keywords_google_trends_explore", () => {
  it("posts to correct URL", async () => {
    await invoke(handlers["keywords_google_trends_explore"], {
      keywords: ["seo", "marketing"],
    });
    expect(mockPost).toHaveBeenCalledWith(
      "/keywords_data/google_trends/explore/live",
      expect.any(Array)
    );
  });

  it("accepts up to 5 keywords without error", async () => {
    await expect(
      invoke(handlers["keywords_google_trends_explore"], {
        keywords: ["a", "b", "c", "d", "e"],
      })
    ).resolves.not.toThrow();
    expect(mockPost).toHaveBeenCalled();
  });

  it("returns a friendly error and does not call the API when >5 keywords are passed", async () => {
    // Inputs can reach the handler without Zod parsing (e.g. via the HTTP
    // bridge), so the handler enforces the max(5) limit itself.
    const result = await invoke(handlers["keywords_google_trends_explore"], {
      keywords: ["a", "b", "c", "d", "e", "f"],
    });
    expect(result).toHaveProperty("error");
    expect(mockPost).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Other keyword tools — correct paths
// ---------------------------------------------------------------------------

describe("keywords_google_ads_keywords_for_site", () => {
  it("posts to /keywords_data/google_ads/keywords_for_site/live", async () => {
    await invoke(handlers["keywords_google_ads_keywords_for_site"], {
      target: "example.com",
    });
    expect(mockPost).toHaveBeenCalledWith(
      "/keywords_data/google_ads/keywords_for_site/live",
      expect.any(Array)
    );
  });
});

describe("keywords_google_ads_search_volume", () => {
  it("posts to /keywords_data/google_ads/search_volume/live", async () => {
    await invoke(handlers["keywords_google_ads_search_volume"], {
      keywords: ["seo"],
    });
    expect(mockPost).toHaveBeenCalledWith(
      "/keywords_data/google_ads/search_volume/live",
      expect.any(Array)
    );
  });
});

describe("keywords_google_ads_locations", () => {
  it("gets /keywords_data/google_ads/locations when no country", async () => {
    await invoke(handlers["keywords_google_ads_locations"], {});
    expect(mockGet).toHaveBeenCalledWith("/keywords_data/google_ads/locations");
  });

  it("appends country query param when provided", async () => {
    await invoke(handlers["keywords_google_ads_locations"], { country: "US" });
    expect(mockGet).toHaveBeenCalledWith(
      "/keywords_data/google_ads/locations?country=US"
    );
  });
});

describe("keywords_google_ads_languages", () => {
  it("gets /keywords_data/google_ads/languages", async () => {
    await invoke(handlers["keywords_google_ads_languages"], {});
    expect(mockGet).toHaveBeenCalledWith("/keywords_data/google_ads/languages");
  });
});

describe("keywords_google_ads_categories", () => {
  it("gets /keywords_data/google_ads/categories", async () => {
    await invoke(handlers["keywords_google_ads_categories"], {});
    expect(mockGet).toHaveBeenCalledWith("/keywords_data/google_ads/categories");
  });
});
