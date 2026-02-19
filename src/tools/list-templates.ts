import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RendrKitClient } from "../api-client.js";

export function registerListTemplatesTool(
  server: McpServer,
  client: RendrKitClient,
): void {
  server.registerTool(
    "list_templates",
    {
      description:
        "List all available image templates with their slot definitions. Use this to discover which templates exist and what slots they accept for direct rendering with generate_image.",
      inputSchema: {},
    },
    async () => {
      try {
        const result = await client.listTemplates();

        const lines = [
          `${result.count} templates available:`,
          "",
        ];

        for (const t of result.templates) {
          const requiredSlots = t.slots
            .filter((s) => s.required)
            .map((s) => s.name);
          const optionalSlots = t.slots
            .filter((s) => !s.required)
            .map((s) => s.name);

          lines.push(
            `**${t.id}** — ${t.description}`,
            `  Best for: ${t.bestFor}`,
            `  Needs photo: ${t.needsPhoto}`,
            `  Required: ${requiredSlots.join(", ") || "none"}`,
            `  Optional: ${optionalSlots.join(", ") || "none"}`,
            "",
          );
        }

        return {
          content: [
            {
              type: "text" as const,
              text: lines.join("\n"),
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
              text: `Failed to list templates: ${message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
