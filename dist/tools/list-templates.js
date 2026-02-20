import { z } from "zod/v4";
export function registerListTemplatesTool(server, client) {
    server.registerTool("list_templates", {
        description: "List all available image templates with their slot definitions. Use this to discover which templates exist and what slots they accept for direct rendering with generate_image.",
        inputSchema: {
            tag: z
                .string()
                .optional()
                .describe('Filter by tag (e.g. "photo", "gradient", "event", "food", "tech")'),
        },
    }, async ({ tag }) => {
        try {
            const result = await client.listTemplates();
            const templates = tag
                ? result.templates.filter((t) => t.tags?.includes(tag))
                : result.templates;
            const lines = [
                `${templates.length} templates${tag ? ` matching tag "${tag}"` : ""} available:`,
                "",
            ];
            for (const t of templates) {
                const requiredSlots = t.slots
                    .filter((s) => s.required)
                    .map((s) => s.name);
                const optionalSlots = t.slots
                    .filter((s) => !s.required)
                    .map((s) => s.name);
                lines.push(`**${t.id}** — ${t.description}`, `  Best for: ${t.bestFor}`, `  Needs photo: ${t.needsPhoto}`, `  Tags: ${t.tags?.join(", ") || "none"}`, `  Required: ${requiredSlots.join(", ") || "none"}`, `  Optional: ${optionalSlots.join(", ") || "none"}`, "");
            }
            return {
                content: [
                    {
                        type: "text",
                        text: lines.join("\n"),
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
                        text: `Failed to list templates: ${message}`,
                    },
                ],
                isError: true,
            };
        }
    });
}
