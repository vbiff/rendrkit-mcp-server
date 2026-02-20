import { z } from "zod/v4";
export function registerBatchRenderTool(server, client) {
    server.registerTool("batch_render", {
        description: "Generate multiple images from the same template with different data. Perfect for e-commerce catalogs, certificates, social media series. Up to 20 items per batch.",
        inputSchema: {
            template_id: z
                .string()
                .describe("Template ID to use for all items"),
            items: z
                .array(z.object({
                slots: z.record(z.string(), z.string()).describe("Slot values for this item"),
                image_url: z.string().optional().describe("Photo URL for this item"),
            }))
                .describe("Array of items to render (max 20)"),
        },
    }, async ({ template_id, items }) => {
        try {
            const result = await client.batchRender({
                templateId: template_id,
                items: items.map((item) => ({
                    slots: item.slots,
                    imageUrl: item.image_url,
                })),
            });
            const lines = result.images.map((img, i) => `${i + 1}. ${img.url}`);
            const errorLines = result.errors?.map((e) => `Error at index ${e.index}: ${e.message}`) ?? [];
            return {
                content: [
                    {
                        type: "text",
                        text: [
                            `Batch complete: ${result.images.length} images generated`,
                            ``,
                            ...lines,
                            ...(errorLines.length > 0 ? [``, `Errors:`, ...errorLines] : []),
                        ].join("\n"),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [{ type: "text", text: `Batch render failed: ${error instanceof Error ? error.message : String(error)}` }],
                isError: true,
            };
        }
    });
}
