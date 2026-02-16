import { z } from "zod/v4";
export function registerGenerateImageTool(server, client) {
    server.registerTool("generate_image", {
        description: "Generate a professionally designed image from a text description. Creates production-ready images with clean layouts, crisp text, and consistent branding. Perfect for social media posts, banners, OG images, thumbnails, and more.",
        inputSchema: {
            prompt: z
                .string()
                .describe("Description of the image to generate"),
            size: z
                .string()
                .optional()
                .describe("Image dimensions (e.g. '1080x1080', '1200x628', '1280x720')"),
            style: z
                .enum(["modern", "playful", "corporate", "dark", "minimal", "bold"])
                .optional()
                .describe("Visual style: modern, playful, corporate, dark, minimal, bold"),
            brand_kit_id: z
                .string()
                .optional()
                .describe("ID of a saved brand kit to use for consistent branding"),
        },
    }, async ({ prompt, size, style, brand_kit_id }) => {
        try {
            const image = await client.generateImage({
                prompt,
                size,
                style,
                brandKitId: brand_kit_id,
            });
            return {
                content: [
                    {
                        type: "text",
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
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to generate image: ${message}`,
                    },
                ],
                isError: true,
            };
        }
    });
}
