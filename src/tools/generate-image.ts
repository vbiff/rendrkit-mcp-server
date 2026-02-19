import { z } from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RendrKitClient } from "../api-client.js";

export function registerGenerateImageTool(
  server: McpServer,
  client: RendrKitClient,
): void {
  server.registerTool(
    "generate_image",
    {
      description:
        "Generate a marketing image. Two modes: (1) Prompt mode — provide a text prompt and AI picks the template. (2) Direct mode (recommended) — provide templateId + slots for precise control. Use list_templates to see available templates.",
      inputSchema: {
        prompt: z
          .string()
          .optional()
          .describe("Text prompt describing the image (used in prompt mode)"),
        template_id: z
          .string()
          .optional()
          .describe(
            "Template ID for direct render mode. Use list_templates to see options.",
          ),
        slots: z
          .record(z.string(), z.string())
          .optional()
          .describe(
            "Template slot values. Keys are slot names, values are strings.",
          ),
        photo_query: z
          .string()
          .optional()
          .describe(
            "1-3 word search query for background photo (e.g. 'italian restaurant'). Only used with photo templates when no image_url is provided.",
          ),
        image_url: z
          .string()
          .optional()
          .describe("URL of your own image to use as background"),
        size: z
          .string()
          .optional()
          .describe(
            "Image dimensions (e.g. '1080x1080', '1200x628', '1280x720')",
          ),
        style: z
          .enum(["modern", "playful", "corporate", "dark", "minimal", "bold"])
          .optional()
          .describe(
            "Visual style: modern, playful, corporate, dark, minimal, bold",
          ),
        brand_kit_id: z
          .string()
          .optional()
          .describe(
            "ID of a saved brand kit to use for consistent branding",
          ),
      },
    },
    async ({ prompt, template_id, slots, photo_query, image_url, size, style, brand_kit_id }) => {
      try {
        const image = await client.generateImage({
          prompt,
          templateId: template_id,
          slots,
          photoQuery: photo_query,
          imageUrl: image_url,
          size,
          style,
          brandKitId: brand_kit_id,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: [
                `Image generated successfully!`,
                ``,
                `URL: ${image.url}`,
                `ID: ${image.id}`,
                `Size: ${image.width}x${image.height}`,
                `Style: ${image.style}`,
                `Prompt: ${image.prompt}`,
                `Created: ${image.createdAt}`,
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
              text: `Failed to generate image: ${message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
