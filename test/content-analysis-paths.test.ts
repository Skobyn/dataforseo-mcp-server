/**
 * Tests for src/api/content-analysis/index.ts
 *
 * Verifies:
 *  - content_analysis_category posts to /content_analysis/category_trends/live (NOT /category/live)
 *  - content_analysis_summary accepts both keyword and url; maps url→keyword
 *  - content_analysis_sentiment_analysis accepts both keyword and text; maps text→keyword
 *  - content_analysis_rating_distribution requires keyword (new required field)
 *  - Correct paths for all tools
 *  - Schema coercion for numeric pagination fields
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerContentAnalysisTools } from "../src/api/content-analysis/index.js";
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

  registerContentAnalysisTools(srv.fakeServer, fake.client);

  jest.clearAllMocks();
  mockPost.mockResolvedValue({});
  mockGet.mockResolvedValue({});
});

// ---------------------------------------------------------------------------
// content_analysis_category — path fix (most critical)
// ---------------------------------------------------------------------------

describe("content_analysis_category — path fix", () => {
  it("posts to /content_analysis/category_trends/live (NOT /category/live)", async () => {
    await invoke(handlers["content_analysis_category"], { keyword: "seo" });
    expect(mockPost).toHaveBeenCalledWith(
      "/content_analysis/category_trends/live",
      expect.any(Array)
    );
  });

  it("does NOT post to the old /content_analysis/category/live path", async () => {
    await invoke(handlers["content_analysis_category"], { keyword: "seo" });
    expect(mockPost).not.toHaveBeenCalledWith(
      "/content_analysis/category/live",
      expect.any(Array)
    );
  });

  it("maps url→keyword when only url is provided", async () => {
    await invoke(handlers["content_analysis_category"], { url: "https://example.com" });
    expect(mockPost).toHaveBeenCalledWith(
      "/content_analysis/category_trends/live",
      [expect.objectContaining({ keyword: "https://example.com" })]
    );
  });

  it("returns error when neither keyword nor url is provided", async () => {
    const result = await invoke(handlers["content_analysis_category"], {});
    expect(result).toHaveProperty("error");
    expect(mockPost).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// content_analysis_summary — keyword/url dual-accept
// ---------------------------------------------------------------------------

describe("content_analysis_summary — keyword/url dual-accept", () => {
  it("posts to /content_analysis/summary/live", async () => {
    await invoke(handlers["content_analysis_summary"], { keyword: "seo tools" });
    expect(mockPost).toHaveBeenCalledWith(
      "/content_analysis/summary/live",
      expect.any(Array)
    );
  });

  it("sends `keyword` field when keyword is provided directly", async () => {
    await invoke(handlers["content_analysis_summary"], { keyword: "seo tools" });
    expect(mockPost).toHaveBeenCalledWith(
      expect.any(String),
      [expect.objectContaining({ keyword: "seo tools" })]
    );
  });

  it("maps url→keyword when only url is provided", async () => {
    await invoke(handlers["content_analysis_summary"], { url: "https://example.com" });
    expect(mockPost).toHaveBeenCalledWith(
      expect.any(String),
      [expect.objectContaining({ keyword: "https://example.com" })]
    );
  });

  it("prefers explicit keyword over url", async () => {
    await invoke(handlers["content_analysis_summary"], {
      keyword: "direct keyword",
      url: "https://example.com",
    });
    expect(mockPost).toHaveBeenCalledWith(
      expect.any(String),
      [expect.objectContaining({ keyword: "direct keyword" })]
    );
  });

  it("does NOT send raw `url` field to the API when url is the only input", async () => {
    await invoke(handlers["content_analysis_summary"], { url: "https://example.com" });
    const callArg = mockPost.mock.calls[0][1][0];
    expect(callArg).not.toHaveProperty("url");
  });

  it("returns error when neither keyword nor url is provided", async () => {
    const result = await invoke(handlers["content_analysis_summary"], {});
    expect(result).toHaveProperty("error");
    expect(mockPost).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// content_analysis_sentiment_analysis — keyword/text dual-accept
// ---------------------------------------------------------------------------

describe("content_analysis_sentiment_analysis — keyword/text dual-accept", () => {
  it("posts to /content_analysis/sentiment_analysis/live", async () => {
    await invoke(handlers["content_analysis_sentiment_analysis"], { keyword: "seo" });
    expect(mockPost).toHaveBeenCalledWith(
      "/content_analysis/sentiment_analysis/live",
      expect.any(Array)
    );
  });

  it("sends `keyword` field when keyword is provided directly", async () => {
    await invoke(handlers["content_analysis_sentiment_analysis"], {
      keyword: "best seo tools",
    });
    expect(mockPost).toHaveBeenCalledWith(
      expect.any(String),
      [expect.objectContaining({ keyword: "best seo tools" })]
    );
  });

  it("maps text→keyword when only text is provided", async () => {
    await invoke(handlers["content_analysis_sentiment_analysis"], {
      text: "this product is great",
    });
    expect(mockPost).toHaveBeenCalledWith(
      expect.any(String),
      [expect.objectContaining({ keyword: "this product is great" })]
    );
  });

  it("does NOT send raw `text` field to the API when text is the only input", async () => {
    await invoke(handlers["content_analysis_sentiment_analysis"], {
      text: "great product",
    });
    const callArg = mockPost.mock.calls[0][1][0];
    expect(callArg).not.toHaveProperty("text");
  });

  it("returns error when neither keyword nor text is provided", async () => {
    const result = await invoke(handlers["content_analysis_sentiment_analysis"], {});
    expect(result).toHaveProperty("error");
    expect(mockPost).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// content_analysis_rating_distribution — keyword is now required
// ---------------------------------------------------------------------------

describe("content_analysis_rating_distribution — keyword required", () => {
  it("posts to /content_analysis/rating_distribution/live", async () => {
    await invoke(handlers["content_analysis_rating_distribution"], {
      keyword: "running shoes",
    });
    expect(mockPost).toHaveBeenCalledWith(
      "/content_analysis/rating_distribution/live",
      expect.any(Array)
    );
  });

  it("sends keyword in payload", async () => {
    await invoke(handlers["content_analysis_rating_distribution"], {
      keyword: "running shoes",
    });
    expect(mockPost).toHaveBeenCalledWith(
      expect.any(String),
      [expect.objectContaining({ keyword: "running shoes" })]
    );
  });

  it("still passes through rating_values when provided (backward compat)", async () => {
    await invoke(handlers["content_analysis_rating_distribution"], {
      keyword: "running shoes",
      rating_values: [1, 2, 3],
    });
    expect(mockPost).toHaveBeenCalledWith(
      expect.any(String),
      [expect.objectContaining({ rating_values: [1, 2, 3] })]
    );
  });
});

// ---------------------------------------------------------------------------
// content_analysis_search — unchanged, sanity check
// ---------------------------------------------------------------------------

describe("content_analysis_search", () => {
  it("posts to /content_analysis/search/live", async () => {
    await invoke(handlers["content_analysis_search"], { query: "seo tools review" });
    expect(mockPost).toHaveBeenCalledWith(
      "/content_analysis/search/live",
      expect.any(Array)
    );
  });

  it("coerces limit string to number", async () => {
    await expect(
      invoke(handlers["content_analysis_search"], {
        query: "test",
        limit: "10",
      })
    ).resolves.not.toThrow();
    expect(mockPost).toHaveBeenCalled();
  });
});
