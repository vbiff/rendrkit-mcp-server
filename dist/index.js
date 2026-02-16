#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { RendrKitClient } from "./api-client.js";
import { createServer } from "./server.js";
async function main() {
    const apiKey = process.env.RENDRKIT_API_KEY;
    if (!apiKey) {
        console.error("Error: RENDRKIT_API_KEY environment variable is required.\n" +
            "Get your API key at https://rendrkit.dev");
        process.exit(1);
    }
    const baseUrl = process.env.RENDRKIT_BASE_URL || "https://api.rendrkit.dev";
    const client = new RendrKitClient(apiKey, baseUrl);
    const server = createServer(client);
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
