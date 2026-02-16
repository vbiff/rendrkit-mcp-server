import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RendrKitClient } from "../api-client.js";

export function registerGetUsageTool(
  server: McpServer,
  client: RendrKitClient,
): void {
  server.registerTool(
    "get_usage",
    {
      description:
        "Check current usage statistics including images generated this month and plan limits",
    },
    async () => {
      try {
        const usage = await client.getUsage();

        return {
          content: [
            {
              type: "text" as const,
              text: [
                `Usage Statistics`,
                ``,
                `Plan: ${usage.plan}`,
                `Images Used: ${usage.imagesUsed} / ${usage.imagesLimit}`,
                `Period: ${usage.periodStart} to ${usage.periodEnd}`,
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
              text: `Failed to get usage stats: ${message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
