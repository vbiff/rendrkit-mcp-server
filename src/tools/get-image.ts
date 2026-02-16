import { z } from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RendrKitClient } from "../api-client.js";

export function registerGetImageTool(
  server: McpServer,
  client: RendrKitClient,
): void {
  server.registerTool(
    "get_image",
    {
      description: "Get details of a previously generated image",
      inputSchema: {
        id: z.string().describe("The image ID"),
      },
    },
    async ({ id }) => {
      try {
        const image = await client.getImage(id);

        return {
          content: [
            {
              type: "text" as const,
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
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text" as const,
              text: `Failed to get image: ${message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
