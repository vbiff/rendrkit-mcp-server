# @rendrkit/mcp

MCP (Model Context Protocol) server for RendrKit. Lets AI assistants like Claude Desktop and Cursor generate professionally designed images via the RendrKit API.

## Installation

### Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "rendrkit": {
      "command": "node",
      "args": ["/path/to/@rendrkit/mcp/dist/index.js"],
      "env": {
        "RENDRKIT_API_KEY": "rk_your_api_key_here"
      }
    }
  }
}
```

### Cursor

Add to your Cursor MCP settings (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "rendrkit": {
      "command": "node",
      "args": ["/path/to/@rendrkit/mcp/dist/index.js"],
      "env": {
        "RENDRKIT_API_KEY": "rk_your_api_key_here"
      }
    }
  }
}
```

### npx (after publishing)

```json
{
  "mcpServers": {
    "rendrkit": {
      "command": "npx",
      "args": ["-y", "@rendrkit/mcp"],
      "env": {
        "RENDRKIT_API_KEY": "rk_your_api_key_here"
      }
    }
  }
}
```

## Available Tools

### generate_image

Generate a professionally designed image from a text description. Creates production-ready images with clean layouts, crisp text, and consistent branding. Perfect for social media posts, banners, OG images, thumbnails, and more.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prompt` | string | Yes | Description of the image to generate |
| `size` | string | No | Image dimensions (e.g. `1080x1080`, `1200x628`, `1280x720`) |
| `style` | enum | No | Visual style: `modern`, `playful`, `corporate`, `dark`, `minimal`, `bold` |
| `brand_kit_id` | string | No | ID of a saved brand kit to use for consistent branding |

### get_image

Get details of a previously generated image.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | The image ID |

### list_brand_kits

List all saved brand kits. Brand kits contain colors, fonts, and logos for consistent image generation. No parameters required.

### get_usage

Check current usage statistics including images generated this month and plan limits. No parameters required.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RENDRKIT_API_KEY` | Yes | - | Your RendrKit API key (starts with `rk_`) |
| `RENDRKIT_BASE_URL` | No | `https://api.rendrkit.dev` | API base URL (for self-hosted or development) |

## Development

```bash
# Build
npm run build

# Watch mode
npm run dev
```

## License

MIT
