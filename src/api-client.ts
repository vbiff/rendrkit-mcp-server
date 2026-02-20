import type {
  GeneratedImage,
  ImageDetails,
  BrandKit,
  UsageStats,
  GenerateImageParams,
  TemplatesResponse,
  UploadResult,
} from "./types.js";

export interface UploadImageParams {
  url?: string;
  base64?: string;
  mimeType?: string;
}

export class RendrKitApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: string,
  ) {
    super(message);
    this.name = "RendrKitApiError";
  }
}

export class RendrKitClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(apiKey: string, baseUrl: string = "https://api.rendrkit.dev") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
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
      throw new RendrKitApiError(
        `API request failed: ${response.status} ${response.statusText}`,
        response.status,
        text,
      );
    }

    // 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  async generateImage(params: GenerateImageParams): Promise<GeneratedImage> {
    const body: Record<string, unknown> = {};
    if (params.prompt) body.prompt = params.prompt;
    if (params.templateId) body.templateId = params.templateId;
    if (params.slots) body.slots = params.slots;
    if (params.photoQuery) body.photoQuery = params.photoQuery;
    if (params.imageUrl) body.imageUrl = params.imageUrl;
    if (params.size) body.size = params.size;
    if (params.style) body.style = params.style;
    if (params.brandKitId) body.brandKitId = params.brandKitId;
    return this.request<GeneratedImage>("POST", "/api/v1/generate", body);
  }

  async listTemplates(): Promise<TemplatesResponse> {
    return this.request<TemplatesResponse>("GET", "/api/v1/templates");
  }

  async getImage(id: string): Promise<ImageDetails> {
    return this.request<ImageDetails>("GET", `/api/v1/images/${id}`);
  }

  async listBrandKits(): Promise<BrandKit[]> {
    return this.request<BrandKit[]>("GET", "/api/v1/brand-kits");
  }

  async getUsage(): Promise<UsageStats> {
    return this.request<UsageStats>("GET", "/api/v1/usage");
  }

  async uploadImage(params: UploadImageParams): Promise<UploadResult> {
    const body: Record<string, unknown> = {};
    if (params.url) body.url = params.url;
    if (params.base64) body.base64 = params.base64;
    if (params.mimeType) body.mimeType = params.mimeType;
    return this.request<UploadResult>("POST", "/api/v1/upload", body);
  }
}
