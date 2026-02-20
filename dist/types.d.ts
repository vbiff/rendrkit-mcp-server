/** Response from the generate image endpoint */
export interface GeneratedImage {
    id: string;
    url: string;
    width: number;
    height: number;
    prompt: string;
    style: string;
    mode?: "direct" | "prompt";
    templateId?: string;
    createdAt: string;
}
/** Response from the get image endpoint */
export interface ImageDetails {
    id: string;
    url: string;
    width: number;
    height: number;
    prompt: string;
    style: string;
    brandKitId?: string;
    createdAt: string;
}
/** Brand kit object */
export interface BrandKit {
    id: string;
    name: string;
    colors: string[];
    font?: string;
    logoUrl?: string;
    createdAt: string;
    updatedAt: string;
}
/** Response from the usage endpoint */
export interface UsageStats {
    plan: string;
    imagesUsed: number;
    imagesLimit: number;
    periodStart: string;
    periodEnd: string;
}
/** Parameters for the generate image API call */
export interface GenerateImageParams {
    prompt?: string;
    size?: string;
    style?: string;
    brandKitId?: string;
    templateId?: string;
    slots?: Record<string, string>;
    photoQuery?: string;
    imageUrl?: string;
    font?: string;
    logoUrl?: string;
    logoPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    background?: "auto" | "photo" | "gradient";
    variants?: number;
}
/** Parameters for batch render */
export interface BatchRenderParams {
    templateId: string;
    items: Array<{
        slots: Record<string, string>;
        imageUrl?: string;
    }>;
}
/** Response from batch render */
export interface BatchRenderResponse {
    images: GeneratedImage[];
    errors?: Array<{
        index: number;
        code: string;
        message: string;
    }>;
}
/** Parameters for cloning a template */
export interface CloneTemplateParams {
    templateId: string;
    name: string;
    defaultSlots?: Record<string, string>;
}
/** A user-created template clone */
export interface UserTemplate {
    id: string;
    baseTemplateId: string;
    name: string;
    defaultSlots: Record<string, string>;
    createdAt: string;
}
/** A single slot definition within a template */
export interface TemplateSlot {
    name: string;
    required: boolean;
    description: string;
}
/** A template definition */
export interface Template {
    id: string;
    name: string;
    description: string;
    bestFor: string;
    needsPhoto: boolean;
    tags: string[];
    slots: TemplateSlot[];
    exampleSlots: Record<string, string>;
}
/** Response from the upload endpoint */
export interface UploadResult {
    url: string;
    filename: string;
    size: number;
    mimeType: string;
}
/** Response from the templates endpoint */
export interface TemplatesResponse {
    count: number;
    templates: Template[];
}
/** API error response */
export interface ApiError {
    message: string;
    status: number;
}
