import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { RendrKitClient, RendrKitApiError } from "../src/api-client.js";
import type {
  GeneratedImage,
  ImageDetails,
  BrandKit,
  UsageStats,
} from "../src/types.js";

const mockFetch = vi.fn();

describe("RendrKitClient", () => {
  const apiKey = "rk_test_key_123";
  const baseUrl = "https://api.rendrkit.dev";
  let client: RendrKitClient;

  beforeEach(() => {
    mockFetch.mockReset();
    vi.stubGlobal("fetch", mockFetch);
    client = new RendrKitClient(apiKey, baseUrl);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor", () => {
    it("should strip trailing slashes from baseUrl", async () => {
      const clientWithSlash = new RendrKitClient(
        apiKey,
        "https://api.rendrkit.dev/",
      );
      const mockResponse: GeneratedImage = {
        id: "img_1",
        url: "https://cdn.rendrkit.dev/img_1.png",
        width: 1080,
        height: 1080,
        prompt: "test",
        style: "modern",
        createdAt: "2025-01-01T00:00:00Z",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockResponse),
      });

      await clientWithSlash.generateImage({ prompt: "test" });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.rendrkit.dev/api/v1/generate",
        expect.any(Object),
      );
    });
  });

  describe("generateImage", () => {
    const mockResponse: GeneratedImage = {
      id: "img_123",
      url: "https://cdn.rendrkit.dev/img_123.png",
      width: 1080,
      height: 1080,
      prompt: "A modern banner for a tech startup",
      style: "modern",
      createdAt: "2025-01-01T00:00:00Z",
    };

    it("should send POST request with correct URL and headers", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockResponse),
      });

      await client.generateImage({
        prompt: "A modern banner for a tech startup",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/v1/generate`,
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          }),
        }),
      );
    });

    it("should send correct body with all parameters", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockResponse),
      });

      await client.generateImage({
        prompt: "A modern banner",
        size: "1200x628",
        style: "corporate",
        brandKitId: "bk_abc",
      });

      const callArgs = mockFetch.mock.calls[0]!;
      const body = JSON.parse(callArgs[1].body);
      expect(body).toEqual({
        prompt: "A modern banner",
        size: "1200x628",
        style: "corporate",
        brandKitId: "bk_abc",
      });
    });

    it("should return the generated image data", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await client.generateImage({
        prompt: "A modern banner for a tech startup",
      });

      expect(result).toEqual(mockResponse);
    });

    it("should throw RendrKitApiError on non-2xx response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        text: () => Promise.resolve('{"error":"Invalid API key"}'),
      });

      await expect(
        client.generateImage({ prompt: "test" }),
      ).rejects.toThrow(RendrKitApiError);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        text: () => Promise.resolve('{"error":"Invalid API key"}'),
      });

      await expect(
        client.generateImage({ prompt: "test" }),
      ).rejects.toThrow("API request failed");
    });

    it("should include status code in error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
        text: () => Promise.resolve("Rate limit exceeded"),
      });

      try {
        await client.generateImage({ prompt: "test" });
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(RendrKitApiError);
        expect((error as RendrKitApiError).status).toBe(429);
        expect((error as RendrKitApiError).body).toBe("Rate limit exceeded");
      }
    });
  });

  describe("getImage", () => {
    const mockImage: ImageDetails = {
      id: "img_456",
      url: "https://cdn.rendrkit.dev/img_456.png",
      width: 1200,
      height: 628,
      prompt: "OG image for blog post",
      style: "minimal",
      brandKitId: "bk_xyz",
      createdAt: "2025-01-15T12:00:00Z",
    };

    it("should send GET request with correct URL", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockImage),
      });

      await client.getImage("img_456");

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/v1/images/img_456`,
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("should return image details", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockImage),
      });

      const result = await client.getImage("img_456");
      expect(result).toEqual(mockImage);
    });

    it("should throw on 404", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        text: () => Promise.resolve("Image not found"),
      });

      await expect(client.getImage("img_nonexistent")).rejects.toThrow(
        RendrKitApiError,
      );
    });
  });

  describe("listBrandKits", () => {
    const mockBrandKits: BrandKit[] = [
      {
        id: "bk_1",
        name: "Corporate Brand",
        colors: ["#000000", "#FFFFFF", "#0066CC"],
        font: "Inter",
        createdAt: "2025-01-01T00:00:00Z",
        updatedAt: "2025-01-01T00:00:00Z",
      },
      {
        id: "bk_2",
        name: "Playful Brand",
        colors: ["#FF6B6B", "#4ECDC4"],
        font: "Poppins",
        logoUrl: "https://example.com/logo.png",
        createdAt: "2025-01-02T00:00:00Z",
        updatedAt: "2025-01-03T00:00:00Z",
      },
    ];

    it("should send GET request to brand-kits endpoint", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockBrandKits),
      });

      await client.listBrandKits();

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/v1/brand-kits`,
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("should return brand kits array", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockBrandKits),
      });

      const result = await client.listBrandKits();
      expect(result).toEqual(mockBrandKits);
      expect(result).toHaveLength(2);
    });

    it("should return empty array when no brand kits exist", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      });

      const result = await client.listBrandKits();
      expect(result).toEqual([]);
    });
  });

  describe("getUsage", () => {
    const mockUsage: UsageStats = {
      plan: "pro",
      imagesUsed: 42,
      imagesLimit: 500,
      periodStart: "2025-01-01",
      periodEnd: "2025-01-31",
    };

    it("should send GET request to usage endpoint", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockUsage),
      });

      await client.getUsage();

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/v1/usage`,
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("should return usage stats", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockUsage),
      });

      const result = await client.getUsage();
      expect(result).toEqual(mockUsage);
    });

    it("should include authorization header", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockUsage),
      });

      await client.getUsage();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${apiKey}`,
          }),
        }),
      );
    });
  });

  describe("error handling", () => {
    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(
        client.generateImage({ prompt: "test" }),
      ).rejects.toThrow("Network error");
    });

    it("should handle response.text() failure gracefully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        text: () => Promise.reject(new Error("Failed to read body")),
      });

      await expect(
        client.generateImage({ prompt: "test" }),
      ).rejects.toThrow(RendrKitApiError);
    });
  });
});
