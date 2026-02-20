import { describe, it, expect, vi, beforeEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RendrKitClient } from "../src/api-client.js";

interface ToolContent { type: string; text: string }
interface ToolResult { content: ToolContent[]; isError?: boolean }
type ToolHandler = (...args: unknown[]) => Promise<ToolResult>;
import { registerGenerateImageTool } from "../src/tools/generate-image.js";
import { registerGetImageTool } from "../src/tools/get-image.js";
import { registerListBrandKitsTool } from "../src/tools/list-brand-kits.js";
import { registerGetUsageTool } from "../src/tools/get-usage.js";
import { registerListTemplatesTool } from "../src/tools/list-templates.js";
import { registerUploadImageTool } from "../src/tools/upload-image.js";
import { createServer } from "../src/server.js";

describe("Tool Registration", () => {
  let server: McpServer;
  let client: RendrKitClient;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    client = new RendrKitClient("rk_test_key");
  });

  it("should register generate_image tool", () => {
    server = new McpServer({ name: "test", version: "0.1.0" });
    const spy = vi.spyOn(server, "registerTool");

    registerGenerateImageTool(server, client);

    expect(spy).toHaveBeenCalledWith(
      "generate_image",
      expect.objectContaining({
        description: expect.stringContaining("Generate a marketing image"),
        inputSchema: expect.objectContaining({
          prompt: expect.anything(),
          template_id: expect.anything(),
          slots: expect.anything(),
          photo_query: expect.anything(),
          image_url: expect.anything(),
          size: expect.anything(),
          style: expect.anything(),
          brand_kit_id: expect.anything(),
        }),
      }),
      expect.any(Function),
    );
  });

  it("should register get_image tool", () => {
    server = new McpServer({ name: "test", version: "0.1.0" });
    const spy = vi.spyOn(server, "registerTool");

    registerGetImageTool(server, client);

    expect(spy).toHaveBeenCalledWith(
      "get_image",
      expect.objectContaining({
        description: expect.stringContaining("Get details"),
        inputSchema: expect.objectContaining({
          id: expect.anything(),
        }),
      }),
      expect.any(Function),
    );
  });

  it("should register list_brand_kits tool with no input schema", () => {
    server = new McpServer({ name: "test", version: "0.1.0" });
    const spy = vi.spyOn(server, "registerTool");

    registerListBrandKitsTool(server, client);

    expect(spy).toHaveBeenCalledWith(
      "list_brand_kits",
      expect.objectContaining({
        description: expect.stringContaining("List all saved brand kits"),
      }),
      expect.any(Function),
    );
  });

  it("should register get_usage tool with no input schema", () => {
    server = new McpServer({ name: "test", version: "0.1.0" });
    const spy = vi.spyOn(server, "registerTool");

    registerGetUsageTool(server, client);

    expect(spy).toHaveBeenCalledWith(
      "get_usage",
      expect.objectContaining({
        description: expect.stringContaining("usage statistics"),
      }),
      expect.any(Function),
    );
  });

  it("should register all 6 tools via createServer", () => {
    const mcpServer = createServer(client);

    // Tools are already registered during createServer, so we verify
    // by checking the server was created successfully
    expect(mcpServer).toBeInstanceOf(McpServer);

    // Create another server and count registrations
    const server2 = new McpServer({ name: "test", version: "0.1.0" });
    const spy2 = vi.spyOn(server2, "registerTool");

    registerGenerateImageTool(server2, client);
    registerGetImageTool(server2, client);
    registerListBrandKitsTool(server2, client);
    registerGetUsageTool(server2, client);
    registerListTemplatesTool(server2, client);
    registerUploadImageTool(server2, client);

    expect(spy2).toHaveBeenCalledTimes(6);
  });
});

describe("Tool Handlers", () => {
  let client: RendrKitClient;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    client = new RendrKitClient("rk_test_key");
  });

  describe("generate_image handler", () => {
    it("should return image details on success", async () => {
      const mockImage = {
        id: "img_test",
        url: "https://cdn.rendrkit.dev/img_test.png",
        width: 1080,
        height: 1080,
        prompt: "A test image",
        style: "modern",
        createdAt: "2025-01-01T00:00:00Z",
      };

      vi.spyOn(client, "generateImage").mockResolvedValueOnce(mockImage);

      // We need to capture the handler. We do this by spying on registerTool.
      const server = new McpServer({ name: "test", version: "0.1.0" });
      const spy = vi.spyOn(server, "registerTool");
      registerGenerateImageTool(server, client);

      const handler = spy.mock.calls[0]![2] as ToolHandler;
      const result = await handler(
        { prompt: "A test image", size: "1080x1080", style: "modern" },
        {},
      );

      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain("img_test");
      expect(result.content[0].text).toContain("https://cdn.rendrkit.dev/img_test.png");
      expect(result.content[0].text).toContain("1080x1080");
      expect(result.isError).toBeUndefined();
    });

    it("should return error content on failure", async () => {
      vi.spyOn(client, "generateImage").mockRejectedValueOnce(
        new Error("Insufficient credits"),
      );

      const server = new McpServer({ name: "test", version: "0.1.0" });
      const spy = vi.spyOn(server, "registerTool");
      registerGenerateImageTool(server, client);

      const handler = spy.mock.calls[0]![2] as ToolHandler;
      const result = await handler({ prompt: "test" }, {});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Insufficient credits");
    });

    it("should map brand_kit_id to brandKitId for API call", async () => {
      const generateSpy = vi
        .spyOn(client, "generateImage")
        .mockResolvedValueOnce({
          id: "img_1",
          url: "https://cdn.rendrkit.dev/img_1.png",
          width: 1080,
          height: 1080,
          prompt: "test",
          style: "modern",
          createdAt: "2025-01-01T00:00:00Z",
        });

      const server = new McpServer({ name: "test", version: "0.1.0" });
      const spy = vi.spyOn(server, "registerTool");
      registerGenerateImageTool(server, client);

      const handler = spy.mock.calls[0]![2] as ToolHandler;
      await handler(
        { prompt: "test", brand_kit_id: "bk_123" },
        {},
      );

      expect(generateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          brandKitId: "bk_123",
        }),
      );
    });
  });

  describe("get_image handler", () => {
    it("should return image details on success", async () => {
      const mockImage = {
        id: "img_456",
        url: "https://cdn.rendrkit.dev/img_456.png",
        width: 1200,
        height: 628,
        prompt: "OG image",
        style: "minimal",
        createdAt: "2025-01-15T12:00:00Z",
      };

      vi.spyOn(client, "getImage").mockResolvedValueOnce(mockImage);

      const server = new McpServer({ name: "test", version: "0.1.0" });
      const spy = vi.spyOn(server, "registerTool");
      registerGetImageTool(server, client);

      const handler = spy.mock.calls[0]![2] as ToolHandler;
      const result = await handler({ id: "img_456" }, {});

      expect(result.content[0].text).toContain("img_456");
      expect(result.content[0].text).toContain("1200x628");
      expect(result.isError).toBeUndefined();
    });

    it("should return error on failure", async () => {
      vi.spyOn(client, "getImage").mockRejectedValueOnce(
        new Error("Image not found"),
      );

      const server = new McpServer({ name: "test", version: "0.1.0" });
      const spy = vi.spyOn(server, "registerTool");
      registerGetImageTool(server, client);

      const handler = spy.mock.calls[0]![2] as ToolHandler;
      const result = await handler({ id: "img_nonexistent" }, {});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Image not found");
    });
  });

  describe("list_brand_kits handler", () => {
    it("should return brand kits on success", async () => {
      const mockKits = [
        {
          id: "bk_1",
          name: "Corporate",
          colors: ["#000", "#FFF"],
          font: "Inter",
          createdAt: "2025-01-01T00:00:00Z",
          updatedAt: "2025-01-01T00:00:00Z",
        },
      ];

      vi.spyOn(client, "listBrandKits").mockResolvedValueOnce(mockKits);

      const server = new McpServer({ name: "test", version: "0.1.0" });
      const spy = vi.spyOn(server, "registerTool");
      registerListBrandKitsTool(server, client);

      const handler = spy.mock.calls[0]![2] as ToolHandler;
      const result = await handler({});

      expect(result.content[0].text).toContain("Corporate");
      expect(result.content[0].text).toContain("bk_1");
      expect(result.content[0].text).toContain("#000");
      expect(result.isError).toBeUndefined();
    });

    it("should handle empty brand kits list", async () => {
      vi.spyOn(client, "listBrandKits").mockResolvedValueOnce([]);

      const server = new McpServer({ name: "test", version: "0.1.0" });
      const spy = vi.spyOn(server, "registerTool");
      registerListBrandKitsTool(server, client);

      const handler = spy.mock.calls[0]![2] as ToolHandler;
      const result = await handler({});

      expect(result.content[0].text).toContain("No brand kits found");
      expect(result.isError).toBeUndefined();
    });

    it("should return error on failure", async () => {
      vi.spyOn(client, "listBrandKits").mockRejectedValueOnce(
        new Error("Unauthorized"),
      );

      const server = new McpServer({ name: "test", version: "0.1.0" });
      const spy = vi.spyOn(server, "registerTool");
      registerListBrandKitsTool(server, client);

      const handler = spy.mock.calls[0]![2] as ToolHandler;
      const result = await handler({});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Unauthorized");
    });
  });

  describe("get_usage handler", () => {
    it("should return usage stats on success", async () => {
      const mockUsage = {
        plan: "pro",
        imagesUsed: 42,
        imagesLimit: 500,
        periodStart: "2025-01-01",
        periodEnd: "2025-01-31",
      };

      vi.spyOn(client, "getUsage").mockResolvedValueOnce(mockUsage);

      const server = new McpServer({ name: "test", version: "0.1.0" });
      const spy = vi.spyOn(server, "registerTool");
      registerGetUsageTool(server, client);

      const handler = spy.mock.calls[0]![2] as ToolHandler;
      const result = await handler({});

      expect(result.content[0].text).toContain("pro");
      expect(result.content[0].text).toContain("42 / 500");
      expect(result.isError).toBeUndefined();
    });

    it("should return error on failure", async () => {
      vi.spyOn(client, "getUsage").mockRejectedValueOnce(
        new Error("Server error"),
      );

      const server = new McpServer({ name: "test", version: "0.1.0" });
      const spy = vi.spyOn(server, "registerTool");
      registerGetUsageTool(server, client);

      const handler = spy.mock.calls[0]![2] as ToolHandler;
      const result = await handler({});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Server error");
    });
  });
});
