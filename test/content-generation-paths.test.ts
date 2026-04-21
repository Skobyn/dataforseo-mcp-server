/**
 * Tests for src/api/content-generation/index.ts
 *
 * Verifies:
 *  - content_generation_text posts to /content_generation/generate_text/live (NOT /text/live)
 *  - content_generation_meta_tags posts to /content_generation/generate_meta_tags/live (NOT /meta_tags/live)
 *  - content_generation_paraphrase posts to /content_generation/paraphrase/live (LIKELY_CORRECT)
 *  - Unverified tools (summarize, title, explain_code) still post to their configured paths
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerContentGenerationTools } from "../src/api/content-generation/index.js";
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

  registerContentGenerationTools(srv.fakeServer, fake.client);

  jest.clearAllMocks();
  mockPost.mockResolvedValue({});
  mockGet.mockResolvedValue({});
});

// ---------------------------------------------------------------------------
// content_generation_text — path fix (SUSPECT → generate_text)
// ---------------------------------------------------------------------------

describe("content_generation_text — path fix", () => {
  it("posts to /content_generation/generate_text/live", async () => {
    await invoke(handlers["content_generation_text"], {
      topic: "SEO best practices",
    });
    expect(mockPost).toHaveBeenCalledWith(
      "/content_generation/generate_text/live",
      expect.any(Array)
    );
  });

  it("does NOT post to the old /content_generation/text/live path", async () => {
    await invoke(handlers["content_generation_text"], {
      topic: "SEO best practices",
    });
    expect(mockPost).not.toHaveBeenCalledWith(
      "/content_generation/text/live",
      expect.any(Array)
    );
  });

  it("passes topic in the payload", async () => {
    await invoke(handlers["content_generation_text"], {
      topic: "content marketing",
    });
    expect(mockPost).toHaveBeenCalledWith(
      expect.any(String),
      [expect.objectContaining({ topic: "content marketing" })]
    );
  });
});

// ---------------------------------------------------------------------------
// content_generation_meta_tags — path fix (SUSPECT → generate_meta_tags)
// ---------------------------------------------------------------------------

describe("content_generation_meta_tags — path fix", () => {
  it("posts to /content_generation/generate_meta_tags/live", async () => {
    await invoke(handlers["content_generation_meta_tags"], {
      text: "This is a great SEO article",
    });
    expect(mockPost).toHaveBeenCalledWith(
      "/content_generation/generate_meta_tags/live",
      expect.any(Array)
    );
  });

  it("does NOT post to the old /content_generation/meta_tags/live path", async () => {
    await invoke(handlers["content_generation_meta_tags"], {
      text: "This is a great SEO article",
    });
    expect(mockPost).not.toHaveBeenCalledWith(
      "/content_generation/meta_tags/live",
      expect.any(Array)
    );
  });
});

// ---------------------------------------------------------------------------
// content_generation_paraphrase — LIKELY_CORRECT path unchanged
// ---------------------------------------------------------------------------

describe("content_generation_paraphrase", () => {
  it("posts to /content_generation/paraphrase/live", async () => {
    await invoke(handlers["content_generation_paraphrase"], {
      text: "SEO is the process of optimizing a website.",
    });
    expect(mockPost).toHaveBeenCalledWith(
      "/content_generation/paraphrase/live",
      expect.any(Array)
    );
  });
});

// ---------------------------------------------------------------------------
// Unverified tools — verify they call their configured paths
// (Paths may return 404 in production but we record what they ARE configured to)
// ---------------------------------------------------------------------------

describe("content_generation_summarize — unverified path", () => {
  it("posts to /content_generation/summarize/live", async () => {
    await invoke(handlers["content_generation_summarize"], {
      text: "Long article about SEO...",
    });
    expect(mockPost).toHaveBeenCalledWith(
      "/content_generation/summarize/live",
      expect.any(Array)
    );
  });
});

describe("content_generation_title — unverified path", () => {
  it("posts to /content_generation/title/live", async () => {
    await invoke(handlers["content_generation_title"], {
      text: "Article about keyword research",
    });
    expect(mockPost).toHaveBeenCalledWith(
      "/content_generation/title/live",
      expect.any(Array)
    );
  });
});

describe("content_generation_explain_code — unverified path", () => {
  it("posts to /content_generation/explain_code/live", async () => {
    await invoke(handlers["content_generation_explain_code"], {
      code: "function foo() { return 42; }",
    });
    expect(mockPost).toHaveBeenCalledWith(
      "/content_generation/explain_code/live",
      expect.any(Array)
    );
  });
});
