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
        const body = {};
        if (params.prompt)
            body.prompt = params.prompt;
        if (params.templateId)
            body.templateId = params.templateId;
        if (params.slots)
            body.slots = params.slots;
        if (params.photoQuery)
            body.photoQuery = params.photoQuery;
        if (params.imageUrl)
            body.imageUrl = params.imageUrl;
        if (params.size)
            body.size = params.size;
        if (params.style)
            body.style = params.style;
        if (params.brandKitId)
            body.brandKitId = params.brandKitId;
        if (params.font)
            body.font = params.font;
        if (params.logoUrl)
            body.logoUrl = params.logoUrl;
        if (params.logoPosition)
            body.logoPosition = params.logoPosition;
        if (params.background)
            body.background = params.background;
        if (params.variants)
            body.variants = params.variants;
        return this.request("POST", "/api/v1/generate", body);
    }
    async listTemplates() {
        return this.request("GET", "/api/v1/templates");
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
    async batchRender(params) {
        return this.request("POST", "/api/v1/generate/batch-render", params);
    }
    async cloneTemplate(params) {
        return this.request("POST", "/api/v1/templates/clone", {
            templateId: params.templateId,
            name: params.name,
            defaultSlots: params.defaultSlots,
        });
    }
    async listUserTemplates() {
        return this.request("GET", "/api/v1/templates/mine");
    }
    async uploadImage(params) {
        const body = {};
        if (params.url)
            body.url = params.url;
        if (params.base64)
            body.base64 = params.base64;
        if (params.mimeType)
            body.mimeType = params.mimeType;
        return this.request("POST", "/api/v1/upload", body);
    }
}
