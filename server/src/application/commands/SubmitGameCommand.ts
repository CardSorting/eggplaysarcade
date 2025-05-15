/**
 * Command to submit a game for review
 * Part of the application layer in Clean Architecture (CQRS pattern)
 */
export interface SubmitGameCommand {
  developerId: string;
  gameId?: string; // Optional - if not provided, a new game will be created
  title: string;
  description: string;
  shortDescription: string;
  features: string[];
  categories: string[];
  tags: string[];
  minimumSystemRequirements: {
    cpu: string;
    gpu: string;
    ram: string;
    os: string;
    storage: string;
  };
  recommendedSystemRequirements: {
    cpu: string;
    gpu: string;
    ram: string;
    os: string;
    storage: string;
  };
  pricingTier: string;
  monetizationSettings: {
    hasInAppPurchases: boolean;
    hasPremiumVersion: boolean;
    hasSubscription: boolean;
    hasAdvertisements: boolean;
  };
  legalInfo: {
    supportEmail: string;
    privacyPolicyUrl: string;
    termsOfServiceUrl: string;
  };
  technicalDetails: {
    hasExternalAPIs: boolean;
    hasServerSideCode: boolean;
    thirdPartyLibraries: string[];
  };
  assets: {
    iconImage: FileUpload;
    headerImage: FileUpload;
    screenshots: FileUpload[];
    videoTrailers?: FileUpload[];
    gameBundle: FileUpload;
  };
  releaseNotes?: string;
  asDraft?: boolean;
}

/**
 * Represents an uploaded file
 */
export interface FileUpload {
  path: string;
  originalName: string;
  size: number;
  mimeType: string;
}