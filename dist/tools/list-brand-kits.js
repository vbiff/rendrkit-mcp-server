export function registerListBrandKitsTool(server, client) {
    server.registerTool("list_brand_kits", {
        description: "List all saved brand kits. Brand kits contain colors, fonts, and logos for consistent image generation.",
    }, async () => {
        try {
            const brandKits = await client.listBrandKits();
            if (brandKits.length === 0) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "No brand kits found. Create one at https://rendrkit.dev to ensure consistent branding in your generated images.",
                        },
                    ],
                };
            }
            const kitDescriptions = brandKits.map((kit) => {
                const lines = [
                    `- ${kit.name} (ID: ${kit.id})`,
                    `  Colors: ${kit.colors.join(", ")}`,
                ];
                if (kit.font)
                    lines.push(`  Font: ${kit.font}`);
                if (kit.logoUrl)
                    lines.push(`  Logo: ${kit.logoUrl}`);
                return lines.join("\n");
            });
            return {
                content: [
                    {
                        type: "text",
                        text: `Brand Kits (${brandKits.length}):\n\n${kitDescriptions.join("\n\n")}`,
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
                        text: `Failed to list brand kits: ${message}`,
                    },
                ],
                isError: true,
            };
        }
    });
}
