import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerGenerateImageTool } from "./tools/generate-image.js";
import { registerGetImageTool } from "./tools/get-image.js";
import { registerListBrandKitsTool } from "./tools/list-brand-kits.js";
import { registerGetUsageTool } from "./tools/get-usage.js";
import { registerListTemplatesTool } from "./tools/list-templates.js";
import { registerUploadImageTool } from "./tools/upload-image.js";
import { registerBatchRenderTool } from "./tools/batch-render.js";
import { registerCloneTemplateTool } from "./tools/clone-template.js";
export function createServer(client) {
    const server = new McpServer({
        name: "rendrkit",
        version: "0.3.0",
    });
    registerGenerateImageTool(server, client);
    registerGetImageTool(server, client);
    registerListBrandKitsTool(server, client);
    registerGetUsageTool(server, client);
    registerListTemplatesTool(server, client);
    registerUploadImageTool(server, client);
    registerBatchRenderTool(server, client);
    registerCloneTemplateTool(server, client);
    return server;
}
