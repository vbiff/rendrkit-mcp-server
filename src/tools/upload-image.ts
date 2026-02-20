import { z } from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RendrKitClient } from "../api-client.js";

export function registerUploadImageTool(
  server: McpServer,
  client: RendrKitClient,
): void {
  server.registerTool(
    "upload_image",
    {
      description:
        "Upload an image to get a hosted URL that can be used as photo_url in templates. Provide either a public URL to re-upload or base64-encoded image data.",
      inputSchema: {
        url: z
          .string()
          .optional()
          .describe("Public URL of an image to download and re-upload"),
        base64: z
          .string()
          .optional()
          .describe("Base64-encoded image data"),
        mime_type: z
          .string()
          .optional()
          .describe(
            "MIME type of the image (image/jpeg, image/png, image/webp). Required when using base64.",
          ),
      },
    },
    async ({ url, base64, mime_type }) => {
      try {
        const result = await client.uploadImage({ url, base64, mimeType: mime_type });

        return {
          content: [
            {
              type: "text" as const,
              text: [
                `Image uploaded successfully!`,
                ``,
                `URL: ${result.url}`,
                `Filename: ${result.filename}`,
                `Size: ${result.size} bytes`,
                `Type: ${result.mimeType}`,
                ``,
                `Use this URL as image_url or photo_url in generate_image.`,
              ].join("\n"),
            },
          ],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text" as const,
              text: `Failed to upload image: ${message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
