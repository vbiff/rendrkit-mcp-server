import type { GeneratedImage, ImageDetails, BrandKit, UsageStats, GenerateImageParams, TemplatesResponse, UploadResult, BatchRenderParams, BatchRenderResponse, CloneTemplateParams, UserTemplate } from "./types.js";
export interface UploadImageParams {
    url?: string;
    base64?: string;
    mimeType?: string;
}
export declare class RendrKitApiError extends Error {
    readonly status: number;
    readonly body?: string | undefined;
    constructor(message: string, status: number, body?: string | undefined);
}
export declare class RendrKitClient {
    private readonly apiKey;
    private readonly baseUrl;
    constructor(apiKey: string, baseUrl?: string);
    private request;
    generateImage(params: GenerateImageParams): Promise<GeneratedImage>;
    listTemplates(): Promise<TemplatesResponse>;
    getImage(id: string): Promise<ImageDetails>;
    listBrandKits(): Promise<BrandKit[]>;
    getUsage(): Promise<UsageStats>;
    batchRender(params: BatchRenderParams): Promise<BatchRenderResponse>;
    cloneTemplate(params: CloneTemplateParams): Promise<UserTemplate>;
    listUserTemplates(): Promise<UserTemplate[]>;
    uploadImage(params: UploadImageParams): Promise<UploadResult>;
}
