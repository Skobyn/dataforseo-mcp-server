/**
 * Tests for src/api/backlinks/index.ts — verifies the v1.1.0 method fixes:
 *   - backlinks_errors: GET → POST
 *   - backlinks_id_list: GET → POST (required datetime_from / datetime_to)
 *   - z.coerce.number() on limit/offset/internal_list_limit
 *
 * Mocking strategy mirrors test/serp-paths.test.ts.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerBacklinksTools } from "../src/api/backlinks/index.js";
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

  registerBacklinksTools(srv.fakeServer, client);

  jest.clearAllMocks();
  mockPost.mockResolvedValue({});
  mockGet.mockResolvedValue({});
});

// ---------------------------------------------------------------------------
// backlinks_errors — must use client.post, not client.get
// ---------------------------------------------------------------------------

describe("backlinks_errors", () => {
  it("calls client.post (not client.get) against /backlinks/errors", async () => {
    await invoke(handlers["backlinks_errors"], {});
    expect(mockPost).toHaveBeenCalledWith("/backlinks/errors", expect.any(Array));
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("sends optional filter fields in the POST body", async () => {
    const params = {
      limit: 10,
      offset: 0,
      filtered_function: "backlinks_summary",
      datetime_from: "2026-01-01T00:00:00Z",
      datetime_to: "2026-04-01T00:00:00Z",
    };
    await invoke(handlers["backlinks_errors"], params);
    expect(mockPost).toHaveBeenCalledWith("/backlinks/errors", [params]);
  });

  it("accepts empty params (all fields optional)", async () => {
    await expect(invoke(handlers["backlinks_errors"], {})).resolves.not.toThrow();
    expect(mockPost).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// backlinks_id_list — must use client.post; datetime_from/datetime_to required
// ---------------------------------------------------------------------------

describe("backlinks_id_list", () => {
  const requiredParams = {
    datetime_from: "2026-01-01T00:00:00Z",
    datetime_to: "2026-04-01T00:00:00Z",
  };

  it("calls client.post (not client.get) against /backlinks/id_list", async () => {
    await invoke(handlers["backlinks_id_list"], requiredParams);
    expect(mockPost).toHaveBeenCalledWith("/backlinks/id_list", expect.any(Array));
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("includes datetime_from and datetime_to in the POST body", async () => {
    await invoke(handlers["backlinks_id_list"], requiredParams);
    expect(mockPost).toHaveBeenCalledWith("/backlinks/id_list", [
      expect.objectContaining(requiredParams),
    ]);
  });

  it("sends optional fields alongside required datetime fields", async () => {
    const full = { ...requiredParams, limit: 50, offset: 0, sort: "asc", include_metadata: true };
    await invoke(handlers["backlinks_id_list"], full);
    expect(mockPost).toHaveBeenCalledWith("/backlinks/id_list", [full]);
  });
});

// ---------------------------------------------------------------------------
// Schema coercion — z.coerce.number() for limit / offset / internal_list_limit
// ---------------------------------------------------------------------------

describe("z.coerce.number() — limit and offset accept string values", () => {
  it("backlinks_summary limit coerced from string '50' does not throw", async () => {
    await expect(
      invoke(handlers["backlinks_summary"], { target: "example.com", limit: "50" })
    ).resolves.not.toThrow();
    expect(mockPost).toHaveBeenCalled();
  });

  it("backlinks_backlinks offset coerced from string '10' does not throw", async () => {
    await expect(
      invoke(handlers["backlinks_backlinks"], { target: "example.com", offset: "10" })
    ).resolves.not.toThrow();
    expect(mockPost).toHaveBeenCalled();
  });

  it("backlinks_bulk_backlinks internal_list_limit coerced from string '5' does not throw", async () => {
    await expect(
      invoke(handlers["backlinks_bulk_backlinks"], {
        targets: ["example.com"],
        internal_list_limit: "5",
      })
    ).resolves.not.toThrow();
    expect(mockPost).toHaveBeenCalled();
  });

  it("backlinks_errors limit coerced from string '20' does not throw", async () => {
    await expect(
      invoke(handlers["backlinks_errors"], { limit: "20" })
    ).resolves.not.toThrow();
    expect(mockPost).toHaveBeenCalled();
  });

  it("backlinks_id_list limit coerced from string '100' does not throw", async () => {
    await expect(
      invoke(handlers["backlinks_id_list"], {
        datetime_from: "2026-01-01T00:00:00Z",
        datetime_to: "2026-04-01T00:00:00Z",
        limit: "100",
      })
    ).resolves.not.toThrow();
    expect(mockPost).toHaveBeenCalled();
  });
});
