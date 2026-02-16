/** Response from the generate image endpoint */
export interface GeneratedImage {
  id: string;
  url: string;
  width: number;
  height: number;
  prompt: string;
  style: string;
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
  prompt: string;
  size?: string;
  style?: string;
  brandKitId?: string;
}

/** API error response */
export interface ApiError {
  message: string;
  status: number;
}
