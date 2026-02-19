import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RendrKitClient } from "./api-client.js";
import { registerGenerateImageTool } from "./tools/generate-image.js";
import { registerGetImageTool } from "./tools/get-image.js";
import { registerListBrandKitsTool } from "./tools/list-brand-kits.js";
import { registerGetUsageTool } from "./tools/get-usage.js";
import { registerListTemplatesTool } from "./tools/list-templates.js";

export function createServer(client: RendrKitClient): McpServer {
  const server = new McpServer({
    name: "rendrkit",
    version: "0.2.0",
  });

  registerGenerateImageTool(server, client);
  registerGetImageTool(server, client);
  registerListBrandKitsTool(server, client);
  registerGetUsageTool(server, client);
  registerListTemplatesTool(server, client);

  return server;
}
