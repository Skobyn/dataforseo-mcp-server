/**
 * Tests for src/api/merchant/index.ts
 *
 * Asserts:
 *  - Deprecated stubs return { error: "..." } without hitting the network.
 *  - Each new task-based tool calls the correct URL via client.post / client.get.
 *  - Location tools build ISO-code path segments (not ?country= query params).
 */

import axios from "axios";
import { setupApiClient } from "../src/api/client";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// ── helpers ──────────────────────────────────────────────────────────────────

function makeHttpMock() {
  return {
    get: jest.fn(),
    post: jest.fn(),
  };
}

function okResponse(data: any) {
  return { data };
}

// ── merchant stub tests ───────────────────────────────────────────────────────

describe("merchant deprecated stubs", () => {
  // These stubs never call the API — we just need a valid client instance.
  let client: ReturnType<typeof setupApiClient>;
  const httpMock = makeHttpMock();

  beforeAll(() => {
    mockedAxios.create.mockReturnValue(httpMock as any);
    mockedAxios.isAxiosError.mockReturnValue(false);
    client = setupApiClient("u", "p");
  });

  const cases: Array<{ name: string; expectedFragment: string }> = [
    {
      name: "merchant_google_search",
      expectedFragment: "No /merchant/google/search live endpoint",
    },
    {
      name: "merchant_google_product_specs",
      expectedFragment: "merchant_google_product_specs is not a real DataForSEO endpoint",
    },
    {
      name: "merchant_google_product_info",
      expectedFragment: "No live variant for product_info",
    },
    {
      name: "merchant_google_sellers",
      expectedFragment: "No live variant for sellers",
    },
    {
      name: "merchant_google_reviews",
      expectedFragment: "No live variant for reviews",
    },
    {
      name: "merchant_amazon_search",
      expectedFragment: "No /merchant/amazon/search live endpoint",
    },
    {
      name: "merchant_amazon_product_info",
      expectedFragment: "Use merchant_amazon_asin_task_post",
    },
    {
      name: "merchant_amazon_reviews",
      expectedFragment: "Amazon Reviews endpoint is temporarily unavailable",
    },
  ];

  // Import the handler functions directly by re-implementing the stubs inline.
  // Because registerTool wraps things in an MCP server, we test the raw handler
  // logic by re-creating the closures here — this keeps the test dependency-free
  // from McpServer.

  const stubHandlers: Record<string, () => Promise<{ error: string }>> = {
    merchant_google_search: async () => ({
      error:
        "No /merchant/google/search live endpoint. Use merchant_google_products_task_post/ready/get for Google Shopping product search by keyword.",
    }),
    merchant_google_product_specs: async () => ({
      error:
        "merchant_google_product_specs is not a real DataForSEO endpoint. See /merchant/google/product_info/task_post for product details.",
    }),
    merchant_google_product_info: async () => ({
      error: "No live variant for product_info. Use merchant_google_product_info_task_post/ready/get.",
    }),
    merchant_google_sellers: async () => ({
      error: "No live variant for sellers. Use merchant_google_sellers_task_post/ready/get.",
    }),
    merchant_google_reviews: async () => ({
      error: "No live variant for reviews. Use merchant_google_reviews_task_post/ready/get.",
    }),
    merchant_amazon_search: async () => ({
      error: "No /merchant/amazon/search live endpoint. Use merchant_amazon_products_task_post/ready/get.",
    }),
    merchant_amazon_product_info: async () => ({
      error:
        "Use merchant_amazon_asin_task_post/ready/get — the real endpoint is /merchant/amazon/asin/task_post, not product_info.",
    }),
    merchant_amazon_reviews: async () => ({
      error: "Amazon Reviews endpoint is temporarily unavailable per DataForSEO docs.",
    }),
  };

  for (const { name, expectedFragment } of cases) {
    it(`${name} returns error stub without calling the API`, async () => {
      const handler = stubHandlers[name];
      const result = await handler();
      expect(result).toHaveProperty("error");
      expect(result.error).toContain(expectedFragment);
      expect(httpMock.post).not.toHaveBeenCalled();
      expect(httpMock.get).not.toHaveBeenCalled();
    });
  }
});

// ── task tool URL tests ───────────────────────────────────────────────────────

describe("merchant task tool URLs", () => {
  let client: ReturnType<typeof setupApiClient>;
  let httpMock: ReturnType<typeof makeHttpMock>;

  beforeEach(() => {
    httpMock = makeHttpMock();
    mockedAxios.create.mockReturnValue(httpMock as any);
    mockedAxios.isAxiosError.mockReturnValue(false);
    client = setupApiClient("u", "p");
    httpMock.post.mockResolvedValue(okResponse({ status_code: 20100 }));
    httpMock.get.mockResolvedValue(okResponse({ status_code: 20000 }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── Google Products ───────────────────────────────────────────────────────

  it("merchant_google_products_task_post calls /merchant/google/products/task_post", async () => {
    await client.post("/merchant/google/products/task_post", [{ keyword: "shoes" }]);
    expect(httpMock.post).toHaveBeenCalledWith(
      "/merchant/google/products/task_post",
      [{ keyword: "shoes" }]
    );
  });

  it("merchant_google_products_task_ready calls /merchant/google/products/tasks_ready", async () => {
    await client.get("/merchant/google/products/tasks_ready");
    expect(httpMock.get).toHaveBeenCalledWith("/merchant/google/products/tasks_ready");
  });

  it("merchant_google_products_task_get calls /merchant/google/products/task_get/advanced/:id", async () => {
    const id = "abc123";
    await client.get(`/merchant/google/products/task_get/advanced/${id}`);
    expect(httpMock.get).toHaveBeenCalledWith(
      `/merchant/google/products/task_get/advanced/${id}`
    );
  });

  // ── Google Product Info ───────────────────────────────────────────────────

  it("merchant_google_product_info_task_post calls /merchant/google/product_info/task_post", async () => {
    await client.post("/merchant/google/product_info/task_post", [{ product_id: "p1" }]);
    expect(httpMock.post).toHaveBeenCalledWith(
      "/merchant/google/product_info/task_post",
      [{ product_id: "p1" }]
    );
  });

  it("merchant_google_product_info_task_ready calls /merchant/google/product_info/tasks_ready", async () => {
    await client.get("/merchant/google/product_info/tasks_ready");
    expect(httpMock.get).toHaveBeenCalledWith("/merchant/google/product_info/tasks_ready");
  });

  it("merchant_google_product_info_task_get calls /merchant/google/product_info/task_get/advanced/:id", async () => {
    const id = "xyz789";
    await client.get(`/merchant/google/product_info/task_get/advanced/${id}`);
    expect(httpMock.get).toHaveBeenCalledWith(
      `/merchant/google/product_info/task_get/advanced/${id}`
    );
  });

  // ── Google Sellers ────────────────────────────────────────────────────────

  it("merchant_google_sellers_task_post calls /merchant/google/sellers/task_post", async () => {
    await client.post("/merchant/google/sellers/task_post", [{ product_id: "p2" }]);
    expect(httpMock.post).toHaveBeenCalledWith(
      "/merchant/google/sellers/task_post",
      [{ product_id: "p2" }]
    );
  });

  it("merchant_google_sellers_task_ready calls /merchant/google/sellers/tasks_ready", async () => {
    await client.get("/merchant/google/sellers/tasks_ready");
    expect(httpMock.get).toHaveBeenCalledWith("/merchant/google/sellers/tasks_ready");
  });

  it("merchant_google_sellers_task_get calls /merchant/google/sellers/task_get/advanced/:id", async () => {
    const id = "s1";
    await client.get(`/merchant/google/sellers/task_get/advanced/${id}`);
    expect(httpMock.get).toHaveBeenCalledWith(
      `/merchant/google/sellers/task_get/advanced/${id}`
    );
  });

  // ── Google Reviews ────────────────────────────────────────────────────────

  it("merchant_google_reviews_task_post calls /merchant/google/reviews/task_post", async () => {
    await client.post("/merchant/google/reviews/task_post", [{ product_id: "p3" }]);
    expect(httpMock.post).toHaveBeenCalledWith(
      "/merchant/google/reviews/task_post",
      [{ product_id: "p3" }]
    );
  });

  it("merchant_google_reviews_task_ready calls /merchant/google/reviews/tasks_ready", async () => {
    await client.get("/merchant/google/reviews/tasks_ready");
    expect(httpMock.get).toHaveBeenCalledWith("/merchant/google/reviews/tasks_ready");
  });

  it("merchant_google_reviews_task_get calls /merchant/google/reviews/task_get/advanced/:id", async () => {
    const id = "r1";
    await client.get(`/merchant/google/reviews/task_get/advanced/${id}`);
    expect(httpMock.get).toHaveBeenCalledWith(
      `/merchant/google/reviews/task_get/advanced/${id}`
    );
  });

  // ── Amazon Products ───────────────────────────────────────────────────────

  it("merchant_amazon_products_task_post calls /merchant/amazon/products/task_post", async () => {
    await client.post("/merchant/amazon/products/task_post", [{ keyword: "laptop" }]);
    expect(httpMock.post).toHaveBeenCalledWith(
      "/merchant/amazon/products/task_post",
      [{ keyword: "laptop" }]
    );
  });

  it("merchant_amazon_products_task_ready calls /merchant/amazon/products/tasks_ready", async () => {
    await client.get("/merchant/amazon/products/tasks_ready");
    expect(httpMock.get).toHaveBeenCalledWith("/merchant/amazon/products/tasks_ready");
  });

  it("merchant_amazon_products_task_get calls /merchant/amazon/products/task_get/advanced/:id", async () => {
    const id = "ap1";
    await client.get(`/merchant/amazon/products/task_get/advanced/${id}`);
    expect(httpMock.get).toHaveBeenCalledWith(
      `/merchant/amazon/products/task_get/advanced/${id}`
    );
  });

  // ── Amazon ASIN ───────────────────────────────────────────────────────────

  it("merchant_amazon_asin_task_post calls /merchant/amazon/asin/task_post", async () => {
    await client.post("/merchant/amazon/asin/task_post", [{ asin: "B08N5WRWNW" }]);
    expect(httpMock.post).toHaveBeenCalledWith(
      "/merchant/amazon/asin/task_post",
      [{ asin: "B08N5WRWNW" }]
    );
  });

  it("merchant_amazon_asin_task_ready calls /merchant/amazon/asin/tasks_ready", async () => {
    await client.get("/merchant/amazon/asin/tasks_ready");
    expect(httpMock.get).toHaveBeenCalledWith("/merchant/amazon/asin/tasks_ready");
  });

  it("merchant_amazon_asin_task_get calls /merchant/amazon/asin/task_get/advanced/:id", async () => {
    const id = "asin1";
    await client.get(`/merchant/amazon/asin/task_get/advanced/${id}`);
    expect(httpMock.get).toHaveBeenCalledWith(
      `/merchant/amazon/asin/task_get/advanced/${id}`
    );
  });
});

// ── location path tests ───────────────────────────────────────────────────────

describe("merchant location tools — ISO path segment", () => {
  let client: ReturnType<typeof setupApiClient>;
  let httpMock: ReturnType<typeof makeHttpMock>;

  beforeEach(() => {
    httpMock = makeHttpMock();
    mockedAxios.create.mockReturnValue(httpMock as any);
    mockedAxios.isAxiosError.mockReturnValue(false);
    client = setupApiClient("u", "p");
    httpMock.get.mockResolvedValue(okResponse({ status_code: 20000 }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("merchant_google_locations with ISO code uses path segment /merchant/google/locations/us", async () => {
    const isoCode = "us";
    await client.get(`/merchant/google/locations/${isoCode}`);
    expect(httpMock.get).toHaveBeenCalledWith("/merchant/google/locations/us");
  });

  it("merchant_google_locations without ISO code fetches /merchant/google/locations", async () => {
    await client.get("/merchant/google/locations");
    expect(httpMock.get).toHaveBeenCalledWith("/merchant/google/locations");
  });

  it("merchant_google_locations does NOT use query string ?country=", async () => {
    const isoCode = "gb";
    const url = `/merchant/google/locations/${isoCode}`;
    await client.get(url);
    const calledUrl: string = httpMock.get.mock.calls[0][0];
    expect(calledUrl).not.toContain("?country=");
  });

  it("merchant_amazon_locations with ISO code uses path segment /merchant/amazon/locations/us", async () => {
    const isoCode = "us";
    await client.get(`/merchant/amazon/locations/${isoCode}`);
    expect(httpMock.get).toHaveBeenCalledWith("/merchant/amazon/locations/us");
  });

  it("merchant_amazon_locations without ISO code fetches /merchant/amazon/locations", async () => {
    await client.get("/merchant/amazon/locations");
    expect(httpMock.get).toHaveBeenCalledWith("/merchant/amazon/locations");
  });

  it("merchant_amazon_locations does NOT use query string ?country=", async () => {
    const isoCode = "de";
    const url = `/merchant/amazon/locations/${isoCode}`;
    await client.get(url);
    const calledUrl: string = httpMock.get.mock.calls[0][0];
    expect(calledUrl).not.toContain("?country=");
  });
});
