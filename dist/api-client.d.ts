import type { GeneratedImage, ImageDetails, BrandKit, UsageStats, GenerateImageParams } from "./types.js";
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
    getImage(id: string): Promise<ImageDetails>;
    listBrandKits(): Promise<BrandKit[]>;
    getUsage(): Promise<UsageStats>;
}
