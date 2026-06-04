/**
 * Tests for src/api/onpage/index.ts — verifies the v1.1.0 fixes:
 *   - onpage_pages: id moved from URL to body, path is /on_page/pages
 *   - onpage_resources: id moved from URL to body, path is /on_page/resources
 *   - onpage_duplicate_content: id moved from URL to body, path is /on_page/duplicate_content
 *
 * Also verifies unchanged tools (onpage_summary id-in-URL, onpage_tasks_ready GET).
 *
 * Mocking strategy mirrors test/serp-paths.test.ts.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerOnPageTools } from "../src/api/onpage/index.js";
import { DataForSeoClient } from "../src/api/client.js";

// ---------------------------------------------------------------------------
// Helpers
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

const TEST_ID = "task-abc123";

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

  registerOnPageTools(srv.fakeServer, client);

  jest.clearAllMocks();
  mockPost.mockResolvedValue({});
  mockGet.mockResolvedValue({});
});

// ---------------------------------------------------------------------------
// onpage_pages — id in body, no /${id} in path
// ---------------------------------------------------------------------------

describe("onpage_pages", () => {
  it("posts to /on_page/pages (no /${id} appended)", async () => {
    await invoke(handlers["onpage_pages"], { id: TEST_ID });
    expect(mockPost).toHaveBeenCalledWith("/on_page/pages", expect.any(Array));
  });

  it("does NOT include the id in the URL path", async () => {
    await invoke(handlers["onpage_pages"], { id: TEST_ID });
    const calledPath = (mockPost.mock.calls[0] as any)[0] as string;
    expect(calledPath).not.toContain(TEST_ID);
  });

  it("includes id in the POST body", async () => {
    await invoke(handlers["onpage_pages"], { id: TEST_ID, limit: 10 });
    expect(mockPost).toHaveBeenCalledWith(
      "/on_page/pages",
      [expect.objectContaining({ id: TEST_ID })]
    );
  });
});

// ---------------------------------------------------------------------------
// onpage_resources — id in body, no /${id} in path
// ---------------------------------------------------------------------------

describe("onpage_resources", () => {
  it("posts to /on_page/resources (no /${id} appended)", async () => {
    await invoke(handlers["onpage_resources"], { id: TEST_ID, url: "https://example.com/page" });
    expect(mockPost).toHaveBeenCalledWith("/on_page/resources", expect.any(Array));
  });

  it("does NOT include the id in the URL path", async () => {
    await invoke(handlers["onpage_resources"], { id: TEST_ID, url: "https://example.com/page" });
    const calledPath = (mockPost.mock.calls[0] as any)[0] as string;
    expect(calledPath).not.toContain(TEST_ID);
  });

  it("includes id in the POST body", async () => {
    await invoke(handlers["onpage_resources"], { id: TEST_ID, url: "https://example.com/page" });
    expect(mockPost).toHaveBeenCalledWith(
      "/on_page/resources",
      [expect.objectContaining({ id: TEST_ID })]
    );
  });
});

// ---------------------------------------------------------------------------
// onpage_duplicate_content — id in body, no /${id} in path
// ---------------------------------------------------------------------------

describe("onpage_duplicate_content", () => {
  it("posts to /on_page/duplicate_content (no /${id} appended)", async () => {
    await invoke(handlers["onpage_duplicate_content"], { id: TEST_ID });
    expect(mockPost).toHaveBeenCalledWith("/on_page/duplicate_content", expect.any(Array));
  });

  it("does NOT include the id in the URL path", async () => {
    await invoke(handlers["onpage_duplicate_content"], { id: TEST_ID });
    const calledPath = (mockPost.mock.calls[0] as any)[0] as string;
    expect(calledPath).not.toContain(TEST_ID);
  });

  it("includes id in the POST body", async () => {
    await invoke(handlers["onpage_duplicate_content"], { id: TEST_ID, limit: 5 });
    expect(mockPost).toHaveBeenCalledWith(
      "/on_page/duplicate_content",
      [expect.objectContaining({ id: TEST_ID })]
    );
  });
});

// ---------------------------------------------------------------------------
// Unchanged tools — quick sanity checks
// ---------------------------------------------------------------------------

describe("onpage_summary (id-in-URL unchanged)", () => {
  it("GETs /on_page/summary/${id} (id remains in URL)", async () => {
    await invoke(handlers["onpage_summary"], { id: TEST_ID });
    expect(mockGet).toHaveBeenCalledWith(`/on_page/summary/${TEST_ID}`);
  });
});

describe("onpage_tasks_ready (GET, unchanged)", () => {
  it("GETs /on_page/tasks_ready", async () => {
    await invoke(handlers["onpage_tasks_ready"], {});
    expect(mockGet).toHaveBeenCalledWith("/on_page/tasks_ready");
    expect(mockPost).not.toHaveBeenCalled();
  });
});

describe("onpage_task_force_stop (unchanged)", () => {
  it("POSTs to /on_page/task_force_stop with id in body", async () => {
    await invoke(handlers["onpage_task_force_stop"], { id: TEST_ID });
    expect(mockPost).toHaveBeenCalledWith(
      "/on_page/task_force_stop",
      [{ id: TEST_ID }]
    );
  });
});

// ---------------------------------------------------------------------------
// Schema coercion — z.coerce.number()
// ---------------------------------------------------------------------------

describe("z.coerce.number() — limit and offset accept strings", () => {
  it("onpage_pages limit coerced from string '20' does not throw", async () => {
    await expect(
      invoke(handlers["onpage_pages"], { id: TEST_ID, limit: "20" })
    ).resolves.not.toThrow();
    expect(mockPost).toHaveBeenCalled();
  });

  it("onpage_resources offset coerced from string '5' does not throw", async () => {
    await expect(
      invoke(handlers["onpage_resources"], {
        id: TEST_ID,
        url: "https://example.com/page",
        offset: "5",
      })
    ).resolves.not.toThrow();
    expect(mockPost).toHaveBeenCalled();
  });

  it("onpage_duplicate_content limit coerced from string '10' does not throw", async () => {
    await expect(
      invoke(handlers["onpage_duplicate_content"], { id: TEST_ID, limit: "10" })
    ).resolves.not.toThrow();
    expect(mockPost).toHaveBeenCalled();
  });

  it("onpage_task_post max_crawl_pages coerced from string '50' does not throw", async () => {
    await expect(
      invoke(handlers["onpage_task_post"], {
        target: "https://example.com",
        max_crawl_pages: "50",
      })
    ).resolves.not.toThrow();
    expect(mockPost).toHaveBeenCalled();
  });
});
