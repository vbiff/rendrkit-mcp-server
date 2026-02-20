import { z } from "zod/v4";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RendrKitClient } from "../api-client.js";

export function registerCloneTemplateTool(
  server: McpServer,
  client: RendrKitClient,
): void {
  server.registerTool(
    "clone_template",
    {
      description:
        "Clone a template with custom default values. Creates a reusable preset (e.g., your brand's product card template). Use the returned ut_ID for future generations.",
      inputSchema: {
        template_id: z.string().describe("Base template ID to clone"),
        name: z.string().describe("Name for your custom template"),
        default_slots: z
          .record(z.string(), z.string())
          .optional()
          .describe("Default slot values (e.g., brand name, colors)"),
      },
    },
    async ({ template_id, name, default_slots }) => {
      try {
        const result = await client.cloneTemplate({
          templateId: template_id,
          name,
          defaultSlots: default_slots,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: [
                `Template cloned!`,
                ``,
                `Custom ID: ut_${result.id}`,
                `Name: ${result.name}`,
                `Base: ${result.baseTemplateId}`,
                ``,
                `Use "ut_${result.id}" as template_id in generate_image to use your preset.`,
              ].join("\n"),
            },
          ],
        };
      } catch (error) {
        return {
          content: [{ type: "text" as const, text: `Clone failed: ${error instanceof Error ? error.message : String(error)}` }],
          isError: true,
        };
      }
    },
  );
}
