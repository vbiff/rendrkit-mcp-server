export class RendrKitApiError extends Error {
    status;
    body;
    constructor(message, status, body) {
        super(message);
        this.status = status;
        this.body = body;
        this.name = "RendrKitApiError";
    }
}
export class RendrKitClient {
    apiKey;
    baseUrl;
    constructor(apiKey, baseUrl = "https://api.rendrkit.dev") {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl.replace(/\/+$/, "");
    }
    async request(method, path, body) {
        const url = `${this.baseUrl}${path}`;
        const headers = {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
        };
        const response = await fetch(url, {
            method,
            headers,
            body: body != null ? JSON.stringify(body) : undefined,
        });
        if (!response.ok) {
            const text = await response.text().catch(() => "");
            throw new RendrKitApiError(`API request failed: ${response.status} ${response.statusText}`, response.status, text);
        }
        // 204 No Content
        if (response.status === 204) {
            return undefined;
        }
        return (await response.json());
    }
    async generateImage(params) {
        return this.request("POST", "/api/v1/generate", {
            prompt: params.prompt,
            size: params.size,
            style: params.style,
            brandKitId: params.brandKitId,
        });
    }
    async getImage(id) {
        return this.request("GET", `/api/v1/images/${id}`);
    }
    async listBrandKits() {
        return this.request("GET", "/api/v1/brand-kits");
    }
    async getUsage() {
        return this.request("GET", "/api/v1/usage");
    }
}
