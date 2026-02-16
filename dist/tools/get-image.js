import { z } from "zod/v4";
export function registerGetImageTool(server, client) {
    server.registerTool("get_image", {
        description: "Get details of a previously generated image",
        inputSchema: {
            id: z.string().describe("The image ID"),
        },
    }, async ({ id }) => {
        try {
            const image = await client.getImage(id);
            return {
                content: [
                    {
                        type: "text",
                        text: [
                            `Image Details`,
                            ``,
                            `URL: ${image.url}`,
                            `ID: ${image.id}`,
                            `Size: ${image.width}x${image.height}`,
                            `Style: ${image.style}`,
                            `Prompt: ${image.prompt}`,
                            image.brandKitId
                                ? `Brand Kit: ${image.brandKitId}`
                                : null,
                            `Created: ${image.createdAt}`,
                        ]
                            .filter(Boolean)
                            .join("\n"),
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
                        text: `Failed to get image: ${message}`,
                    },
                ],
                isError: true,
            };
        }
    });
}
