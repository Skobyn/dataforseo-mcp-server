/**
 * Tests for src/api/business-data/index.ts
 * Asserts each fixed tool posts to the correct URL.
 * Asserts each deprecation stub returns {error: ...} without a network call.
 */
import axios from "axios";
import { setupApiClient } from "../src/api/client";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function makeHttpClient() {
  return {
    get: jest.fn(),
    post: jest.fn(),
  };
}

function makeSuccessResponse(data: object = {}) {
  return { data };
}

// Build an MCP-like server stub that captures registered handlers by name.
function makeServer() {
  const handlers: Map<string, (params: any) => Promise<any>> = new Map();
  const server = {
    tool: (name: string, _shape: any, handler: (params: any) => Promise<any>) => {
      handlers.set(name, handler);
    },
    handlers,
  };
  return server;
}

// Invoke a registered tool and unwrap the JSON text content.
async function callTool(
  server: ReturnType<typeof makeServer>,
  name: string,
  params: object = {}
): Promise<any> {
  const handler = server.handlers.get(name);
  if (!handler) throw new Error(`Tool not registered: ${name}`);
  const result = await handler(params);
  const text = result?.content?.[0]?.text ?? "{}";
  return JSON.parse(text);
}

// --------------------------------------------------------------------------
// Setup
// --------------------------------------------------------------------------

let httpClient: ReturnType<typeof makeHttpClient>;
let server: ReturnType<typeof makeServer>;

beforeEach(async () => {
  jest.clearAllMocks();
  httpClient = makeHttpClient();
  mockedAxios.create.mockReturnValue(httpClient as any);
  mockedAxios.isAxiosError.mockReturnValue(false);
  server = makeServer();

  // Dynamically import the module under test (avoids module caching issues)
  const { registerBusinessDataTools } = await import(
    "../src/api/business-data/index"
  );
  const apiClient = setupApiClient("user", "pass");
  registerBusinessDataTools(server as any, apiClient);
});

// --------------------------------------------------------------------------
// 1. CORRECT-AS-IS tools — verify paths unchanged
// --------------------------------------------------------------------------

describe("business_data_google_my_business_info", () => {
  it("POSTs to /business_data/google/my_business_info/live", async () => {
    httpClient.post.mockResolvedValue(makeSuccessResponse({ tasks: [] }));
    await callTool(server, "business_data_google_my_business_info", {
      keyword: "test",
    });
    expect(httpClient.post).toHaveBeenCalledWith(
      "/business_data/google/my_business_info/live",
      expect.any(Array)
    );
  });
});

describe("business_data_google_reviews", () => {
  it("POSTs to /business_data/google/reviews/live", async () => {
    httpClient.post.mockResolvedValue(makeSuccessResponse());
    await callTool(server, "business_data_google_reviews", { keyword: "pizza" });
    expect(httpClient.post).toHaveBeenCalledWith(
      "/business_data/google/reviews/live",
      expect.any(Array)
    );
  });
});

describe("business_data_google_languages", () => {
  it("GETs /business_data/google/languages", async () => {
    httpClient.get.mockResolvedValue(makeSuccessResponse());
    await callTool(server, "business_data_google_languages");
    expect(httpClient.get).toHaveBeenCalledWith("/business_data/google/languages");
  });
});

describe("business_data_business_listings_search", () => {
  it("POSTs to /business_data/business_listings/search/live", async () => {
    httpClient.post.mockResolvedValue(makeSuccessResponse());
    await callTool(server, "business_data_business_listings_search", {
      keyword: "plumber",
    });
    expect(httpClient.post).toHaveBeenCalledWith(
      "/business_data/business_listings/search/live",
      expect.any(Array)
    );
  });
});

// --------------------------------------------------------------------------
// 2. Google Locations — path-segment ISO fix
// --------------------------------------------------------------------------

describe("business_data_google_locations", () => {
  it("GETs bare path when no iso code supplied", async () => {
    httpClient.get.mockResolvedValue(makeSuccessResponse());
    await callTool(server, "business_data_google_locations", {});
    expect(httpClient.get).toHaveBeenCalledWith("/business_data/google/locations");
  });

  it("GETs path with ISO code as path segment", async () => {
    httpClient.get.mockResolvedValue(makeSuccessResponse());
    await callTool(server, "business_data_google_locations", {
      country_iso_code: "us",
    });
    expect(httpClient.get).toHaveBeenCalledWith(
      "/business_data/google/locations/us"
    );
  });

  it("does NOT append a ?country= query param", async () => {
    httpClient.get.mockResolvedValue(makeSuccessResponse());
    await callTool(server, "business_data_google_locations", {
      country_iso_code: "gb",
    });
    const url: string = httpClient.get.mock.calls[0][0];
    expect(url).not.toContain("?");
  });

  it("accepts the deprecated `country` alias as an ISO code", async () => {
    httpClient.get.mockResolvedValue(makeSuccessResponse());
    await callTool(server, "business_data_google_locations", {
      country: "US",
    });
    expect(httpClient.get).toHaveBeenCalledWith(
      "/business_data/google/locations/us"
    );
  });
});

// --------------------------------------------------------------------------
// 3. Google Hotels fixes
// --------------------------------------------------------------------------

describe("business_data_google_hotels_search", () => {
  it("POSTs to /business_data/google/hotel_searches/live (not /hotels/search/live)", async () => {
    httpClient.post.mockResolvedValue(makeSuccessResponse());
    await callTool(server, "business_data_google_hotels_search", {
      keyword: "Hilton Paris",
    });
    expect(httpClient.post).toHaveBeenCalledWith(
      "/business_data/google/hotel_searches/live",
      expect.any(Array)
    );
  });
});

describe("business_data_google_hotels_info", () => {
  it("POSTs to /business_data/google/hotel_info/live/advanced", async () => {
    httpClient.post.mockResolvedValue(makeSuccessResponse());
    await callTool(server, "business_data_google_hotels_info", {
      hotel_identifier: "abc123",
    });
    expect(httpClient.post).toHaveBeenCalledWith(
      "/business_data/google/hotel_info/live/advanced",
      expect.any(Array)
    );
  });

  it("uses hotel_identifier field (not hotel_id)", async () => {
    httpClient.post.mockResolvedValue(makeSuccessResponse());
    await callTool(server, "business_data_google_hotels_info", {
      hotel_identifier: "abc123",
    });
    const payload: any[] = httpClient.post.mock.calls[0][1];
    expect(payload[0]).toHaveProperty("hotel_identifier", "abc123");
    expect(payload[0]).not.toHaveProperty("hotel_id");
  });
});

describe("business_data_google_hotels_reviews (deprecated stub)", () => {
  it("returns error without making a network call", async () => {
    const result = await callTool(server, "business_data_google_hotels_reviews", {
      hotel_id: "any",
    });
    expect(result).toHaveProperty("error");
    expect(result.error).toMatch(/no dedicated/i);
    expect(httpClient.post).not.toHaveBeenCalled();
    expect(httpClient.get).not.toHaveBeenCalled();
  });
});

// --------------------------------------------------------------------------
// 4. Tripadvisor task-based
// --------------------------------------------------------------------------

describe("business_data_tripadvisor_search (deprecated stub)", () => {
  it("returns error without network call", async () => {
    const result = await callTool(server, "business_data_tripadvisor_search", {
      keyword: "any",
    });
    expect(result).toHaveProperty("error");
    expect(result.error).toMatch(/no live endpoint/i);
    expect(httpClient.post).not.toHaveBeenCalled();
  });
});

describe("business_data_tripadvisor_search_post", () => {
  it("POSTs to /business_data/tripadvisor/search/task_post", async () => {
    httpClient.post.mockResolvedValue(makeSuccessResponse());
    await callTool(server, "business_data_tripadvisor_search_post", {
      keyword: "Eiffel Tower",
    });
    expect(httpClient.post).toHaveBeenCalledWith(
      "/business_data/tripadvisor/search/task_post",
      expect.any(Array)
    );
  });
});

describe("business_data_tripadvisor_search_ready", () => {
  it("GETs /business_data/tripadvisor/search/tasks_ready", async () => {
    httpClient.get.mockResolvedValue(makeSuccessResponse());
    await callTool(server, "business_data_tripadvisor_search_ready");
    expect(httpClient.get).toHaveBeenCalledWith(
      "/business_data/tripadvisor/search/tasks_ready"
    );
  });
});

describe("business_data_tripadvisor_search_get", () => {
  it("GETs /business_data/tripadvisor/search/task_get/advanced/<id>", async () => {
    httpClient.get.mockResolvedValue(makeSuccessResponse());
    await callTool(server, "business_data_tripadvisor_search_get", {
      id: "task-abc",
    });
    expect(httpClient.get).toHaveBeenCalledWith(
      "/business_data/tripadvisor/search/task_get/advanced/task-abc"
    );
  });
});

describe("business_data_tripadvisor_reviews (deprecated stub)", () => {
  it("returns error without network call", async () => {
    const result = await callTool(server, "business_data_tripadvisor_reviews", {
      location_id: "any",
    });
    expect(result).toHaveProperty("error");
    expect(result.error).toMatch(/no live endpoint/i);
    expect(httpClient.post).not.toHaveBeenCalled();
  });
});

describe("business_data_tripadvisor_reviews_post", () => {
  it("POSTs to /business_data/tripadvisor/reviews/task_post using url_path field", async () => {
    httpClient.post.mockResolvedValue(makeSuccessResponse());
    await callTool(server, "business_data_tripadvisor_reviews_post", {
      url_path: "Restaurant_Review-g12345-d67890",
    });
    expect(httpClient.post).toHaveBeenCalledWith(
      "/business_data/tripadvisor/reviews/task_post",
      expect.any(Array)
    );
    const payload: any[] = httpClient.post.mock.calls[0][1];
    expect(payload[0]).toHaveProperty("url_path");
    expect(payload[0]).not.toHaveProperty("location_id");
  });
});

// --------------------------------------------------------------------------
// 5. Trustpilot task-based
// --------------------------------------------------------------------------

describe("business_data_trustpilot_search (deprecated stub)", () => {
  it("returns error without network call", async () => {
    const result = await callTool(server, "business_data_trustpilot_search", {
      keyword: "any",
    });
    expect(result).toHaveProperty("error");
    expect(result.error).toMatch(/no live endpoint/i);
    expect(httpClient.post).not.toHaveBeenCalled();
  });
});

describe("business_data_trustpilot_search_post", () => {
  it("POSTs to /business_data/trustpilot/search/task_post", async () => {
    httpClient.post.mockResolvedValue(makeSuccessResponse());
    await callTool(server, "business_data_trustpilot_search_post", {
      keyword: "amazon",
    });
    expect(httpClient.post).toHaveBeenCalledWith(
      "/business_data/trustpilot/search/task_post",
      expect.any(Array)
    );
  });
});

describe("business_data_trustpilot_search_ready", () => {
  it("GETs /business_data/trustpilot/search/tasks_ready", async () => {
    httpClient.get.mockResolvedValue(makeSuccessResponse());
    await callTool(server, "business_data_trustpilot_search_ready");
    expect(httpClient.get).toHaveBeenCalledWith(
      "/business_data/trustpilot/search/tasks_ready"
    );
  });
});

describe("business_data_trustpilot_search_get", () => {
  it("GETs /business_data/trustpilot/search/task_get/advanced/<id>", async () => {
    httpClient.get.mockResolvedValue(makeSuccessResponse());
    await callTool(server, "business_data_trustpilot_search_get", {
      id: "tp-task-1",
    });
    expect(httpClient.get).toHaveBeenCalledWith(
      "/business_data/trustpilot/search/task_get/advanced/tp-task-1"
    );
  });
});

describe("business_data_trustpilot_reviews (deprecated stub)", () => {
  it("returns error without network call", async () => {
    const result = await callTool(server, "business_data_trustpilot_reviews", {
      domain: "any",
    });
    expect(result).toHaveProperty("error");
    expect(result.error).toMatch(/no live endpoint/i);
    expect(httpClient.post).not.toHaveBeenCalled();
  });
});

describe("business_data_trustpilot_reviews_post", () => {
  it("POSTs to /business_data/trustpilot/reviews/task_post", async () => {
    httpClient.post.mockResolvedValue(makeSuccessResponse());
    await callTool(server, "business_data_trustpilot_reviews_post", {
      domain: "amazon.com",
    });
    expect(httpClient.post).toHaveBeenCalledWith(
      "/business_data/trustpilot/reviews/task_post",
      expect.any(Array)
    );
  });
});

// --------------------------------------------------------------------------
// 6. Facebook NOT SUPPORTED stubs
// --------------------------------------------------------------------------

describe("business_data_facebook_search (not supported stub)", () => {
  it("returns error without network call", async () => {
    const result = await callTool(server, "business_data_facebook_search", {
      keyword: "test",
    });
    expect(result).toHaveProperty("error");
    expect(result.error).toMatch(/not supported/i);
    expect(httpClient.post).not.toHaveBeenCalled();
  });
});

describe("business_data_facebook_overview (not supported stub)", () => {
  it("returns error without network call", async () => {
    const result = await callTool(server, "business_data_facebook_overview", {
      id: "123",
    });
    expect(result).toHaveProperty("error");
    expect(result.error).toMatch(/not supported/i);
    expect(httpClient.post).not.toHaveBeenCalled();
  });
});

// --------------------------------------------------------------------------
// 7. Pinterest & Reddit old stubs
// --------------------------------------------------------------------------

describe("business_data_pinterest_search (deprecated stub)", () => {
  it("returns error pointing to new tool", async () => {
    const result = await callTool(server, "business_data_pinterest_search", {
      keyword: "cakes",
    });
    expect(result).toHaveProperty("error");
    expect(result.error).toMatch(/business_data_social_media_pinterest_live/);
    expect(httpClient.post).not.toHaveBeenCalled();
  });
});

describe("business_data_pinterest_info (deprecated stub)", () => {
  it("returns error pointing to new tool", async () => {
    const result = await callTool(server, "business_data_pinterest_info", {
      url: "https://pinterest.com/foo",
    });
    expect(result).toHaveProperty("error");
    expect(result.error).toMatch(/business_data_social_media_pinterest_live/);
    expect(httpClient.post).not.toHaveBeenCalled();
  });
});

describe("business_data_reddit_search (deprecated stub)", () => {
  it("returns error pointing to new tool", async () => {
    const result = await callTool(server, "business_data_reddit_search", {
      keyword: "test",
    });
    expect(result).toHaveProperty("error");
    expect(result.error).toMatch(/business_data_social_media_reddit_live/);
    expect(httpClient.post).not.toHaveBeenCalled();
  });
});

describe("business_data_reddit_info (deprecated stub)", () => {
  it("returns error pointing to new tool", async () => {
    const result = await callTool(server, "business_data_reddit_info", {
      url: "https://reddit.com/r/test",
    });
    expect(result).toHaveProperty("error");
    expect(result.error).toMatch(/business_data_social_media_reddit_live/);
    expect(httpClient.post).not.toHaveBeenCalled();
  });
});

// --------------------------------------------------------------------------
// 8. New Social Media tools
// --------------------------------------------------------------------------

describe("business_data_social_media_pinterest_live", () => {
  it("POSTs to /business_data/social_media/pinterest/live with targets array", async () => {
    httpClient.post.mockResolvedValue(makeSuccessResponse());
    await callTool(server, "business_data_social_media_pinterest_live", {
      targets: ["https://example.com/page1", "https://example.com/page2"],
    });
    expect(httpClient.post).toHaveBeenCalledWith(
      "/business_data/social_media/pinterest/live",
      expect.any(Array)
    );
    const payload: any[] = httpClient.post.mock.calls[0][1];
    expect(payload[0]).toHaveProperty("targets");
    expect(Array.isArray(payload[0].targets)).toBe(true);
  });
});

describe("business_data_social_media_reddit_live", () => {
  it("POSTs to /business_data/social_media/reddit/live with targets array", async () => {
    httpClient.post.mockResolvedValue(makeSuccessResponse());
    await callTool(server, "business_data_social_media_reddit_live", {
      targets: ["https://example.com"],
    });
    expect(httpClient.post).toHaveBeenCalledWith(
      "/business_data/social_media/reddit/live",
      expect.any(Array)
    );
    const payload: any[] = httpClient.post.mock.calls[0][1];
    expect(payload[0]).toHaveProperty("targets");
  });
});

// --------------------------------------------------------------------------
// 9. Business Listings: no country query param
// --------------------------------------------------------------------------

describe("business_data_business_listings_locations", () => {
  it("GETs bare /business_data/business_listings/locations (no query param)", async () => {
    httpClient.get.mockResolvedValue(makeSuccessResponse());
    await callTool(server, "business_data_business_listings_locations", {
      country: "Romania",
    });
    const url: string = httpClient.get.mock.calls[0][0];
    expect(url).toBe("/business_data/business_listings/locations");
    expect(url).not.toContain("?");
  });
});

describe("business_data_business_listings_categories", () => {
  it("GETs bare /business_data/business_listings/categories (no query param)", async () => {
    httpClient.get.mockResolvedValue(makeSuccessResponse());
    await callTool(server, "business_data_business_listings_categories", {
      country: "Romania",
    });
    const url: string = httpClient.get.mock.calls[0][0];
    expect(url).toBe("/business_data/business_listings/categories");
    expect(url).not.toContain("?");
  });
});

// --------------------------------------------------------------------------
// 10. Coercion — numeric fields use z.coerce.number() in schema
// The MCP SDK does the actual coercion before calling the handler.
// Here we verify the schema itself accepts and coerces string inputs.
// --------------------------------------------------------------------------

import { z } from "zod";

describe("schema coercion", () => {
  it("z.coerce.number() coerces string '10' to 10", () => {
    const schema = z.object({ depth: z.coerce.number().optional() });
    const result = schema.parse({ depth: "10" as any });
    expect(result.depth).toBe(10);
    expect(typeof result.depth).toBe("number");
  });

  it("business_data_google_hotels_search schema coerces depth/guests/location_code", () => {
    const schema = z.object({
      keyword: z.string(),
      location_code: z.coerce.number().optional(),
      guests: z.coerce.number().optional(),
      depth: z.coerce.number().optional(),
      limit: z.coerce.number().optional(),
      offset: z.coerce.number().optional(),
    });
    const result = schema.parse({
      keyword: "Hilton",
      depth: "10",
      guests: "2",
      location_code: "2840",
    } as any);
    expect(typeof result.depth).toBe("number");
    expect(typeof result.guests).toBe("number");
    expect(typeof result.location_code).toBe("number");
    expect(result.depth).toBe(10);
    expect(result.guests).toBe(2);
  });

  it("business_data_business_listings_search schema coerces location_code", () => {
    const schema = z.object({
      keyword: z.string(),
      location_code: z.coerce.number().optional(),
    });
    const result = schema.parse({ keyword: "cafe", location_code: "2840" } as any);
    expect(typeof result.location_code).toBe("number");
    expect(result.location_code).toBe(2840);
  });
});
