/**
 * Tests for src/api/domain-analytics/index.ts — verifies the v1.1.0 fixes:
 *   - domain_analytics_technologies_summary: path corrected to
 *       /domain_analytics/technologies/technologies_summary/live
 *   - domain_analytics_technologies_technologies: changed to GET,
 *       /live suffix removed → /domain_analytics/technologies/technologies
 *   - z.coerce.number() on limit/offset
 *
 * Mocking strategy mirrors test/serp-paths.test.ts.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerDomainAnalyticsTools } from "../src/api/domain-analytics/index.js";
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

  registerDomainAnalyticsTools(srv.fakeServer, client);

  jest.clearAllMocks();
  mockPost.mockResolvedValue({});
  mockGet.mockResolvedValue({});
});

// ---------------------------------------------------------------------------
// domain_analytics_technologies_summary — corrected path
// ---------------------------------------------------------------------------

describe("domain_analytics_technologies_summary", () => {
  it("posts to /domain_analytics/technologies/technologies_summary/live (NOT /summary/live)", async () => {
    await invoke(handlers["domain_analytics_technologies_summary"], {});
    expect(mockPost).toHaveBeenCalledWith(
      "/domain_analytics/technologies/technologies_summary/live",
      expect.any(Array)
    );
  });

  it("does NOT call the old /technologies/summary/live path", async () => {
    await invoke(handlers["domain_analytics_technologies_summary"], {});
    const calledPath = (mockPost.mock.calls[0] as any)[0] as string;
    expect(calledPath).not.toContain("/technologies/summary/live");
  });
});

// ---------------------------------------------------------------------------
// domain_analytics_technologies_technologies — GET, no /live
// ---------------------------------------------------------------------------

describe("domain_analytics_technologies_technologies", () => {
  it("uses client.get (not client.post)", async () => {
    await invoke(handlers["domain_analytics_technologies_technologies"], {});
    expect(mockGet).toHaveBeenCalled();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("calls GET /domain_analytics/technologies/technologies (no /live suffix)", async () => {
    await invoke(handlers["domain_analytics_technologies_technologies"], {});
    expect(mockGet).toHaveBeenCalledWith(
      "/domain_analytics/technologies/technologies"
    );
  });

  it("does NOT append /live to the path", async () => {
    await invoke(handlers["domain_analytics_technologies_technologies"], {});
    const calledPath = (mockGet.mock.calls[0] as any)[0] as string;
    expect(calledPath).not.toContain("/live");
  });
});

// ---------------------------------------------------------------------------
// Other tools — sanity check paths are unchanged
// ---------------------------------------------------------------------------

describe("domain_analytics_technologies_domains_by_technology", () => {
  it("still posts to /domain_analytics/technologies/domains_by_technology/live", async () => {
    await invoke(handlers["domain_analytics_technologies_domains_by_technology"], {
      technology_name: "WordPress",
    });
    expect(mockPost).toHaveBeenCalledWith(
      "/domain_analytics/technologies/domains_by_technology/live",
      expect.any(Array)
    );
  });
});

describe("domain_analytics_whois_overview", () => {
  it("still posts to /domain_analytics/whois/overview/live", async () => {
    await invoke(handlers["domain_analytics_whois_overview"], { domain: "example.com" });
    expect(mockPost).toHaveBeenCalledWith(
      "/domain_analytics/whois/overview/live",
      expect.any(Array)
    );
  });
});

// ---------------------------------------------------------------------------
// Schema coercion — z.coerce.number()
// ---------------------------------------------------------------------------

describe("z.coerce.number() — limit and offset accept strings", () => {
  it("domains_by_technology limit coerced from string '10' does not throw", async () => {
    await expect(
      invoke(handlers["domain_analytics_technologies_domains_by_technology"], {
        technology_name: "React",
        limit: "10",
      })
    ).resolves.not.toThrow();
    expect(mockPost).toHaveBeenCalled();
  });

  it("domain_technologies offset coerced from string '5' does not throw", async () => {
    await expect(
      invoke(handlers["domain_analytics_technologies_domain_technologies"], {
        target: "example.com",
        offset: "5",
      })
    ).resolves.not.toThrow();
    expect(mockPost).toHaveBeenCalled();
  });
});
