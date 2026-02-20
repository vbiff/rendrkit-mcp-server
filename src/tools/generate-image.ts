import { z } from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RendrKitClient } from "../api-client.js";
import type { GeneratedImage } from "../types.js";

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
          .enum(["1080x1080", "1200x628", "1080x1920", "1200x1200", "1280x720"])
          .optional()
          .describe(
            "Image size: '1080x1080' (Instagram, default), '1200x628' (OG/Twitter), '1080x1920' (Stories/Reels), '1200x1200' (Instagram HD), '1280x720' (YouTube)",
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
        font: z
          .string()
          .optional()
          .describe("Google Font name to use (e.g. 'Poppins', 'Playfair Display')"),
        logo_url: z
          .string()
          .optional()
          .describe("HTTPS URL of a logo to overlay on the image"),
        logo_position: z
          .enum(["top-left", "top-right", "bottom-left", "bottom-right"])
          .optional()
          .describe("Position of the logo overlay. Default: bottom-right"),
        background: z
          .enum(["auto", "photo", "gradient"])
          .optional()
          .describe("Background type: auto (AI decides), photo (force photo search), gradient (no photo)"),
        variants: z
          .number()
          .optional()
          .describe("Number of design variants to generate (1-3). Each variant has different colors/layout."),
      },
    },
    async ({ prompt, template_id, slots, photo_query, image_url, size, style, brand_kit_id, font, logo_url, logo_position, background, variants }) => {
      try {
        const result = await client.generateImage({
          prompt,
          templateId: template_id,
          slots,
          photoQuery: photo_query,
          imageUrl: image_url,
          size,
          style,
          brandKitId: brand_kit_id,
          font,
          logoUrl: logo_url,
          logoPosition: logo_position,
          background,
          variants,
        });

        // Variants > 1 returns { images: [...] } instead of a single image
        if (variants && variants > 1) {
          const multi = result as unknown as { images: GeneratedImage[] };
          const lines = multi.images.map(
            (img: GeneratedImage, i: number) =>
              `Variant ${i + 1}: ${img.url} (template: ${img.templateId})`,
          );
          return {
            content: [
              {
                type: "text" as const,
                text: `Generated ${multi.images.length} variants!\n\n${lines.join("\n")}`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text" as const,
              text: [
                `Image generated successfully!`,
                ``,
                `URL: ${result.url}`,
                `ID: ${result.id}`,
                `Size: ${result.width}x${result.height}`,
                result.templateId ? `Template: ${result.templateId}` : null,
                `Style: ${result.style}`,
                `Prompt: ${result.prompt}`,
                `Created: ${result.createdAt}`,
              ].filter(Boolean).join("\n"),
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
