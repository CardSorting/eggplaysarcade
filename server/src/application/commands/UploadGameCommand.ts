/**
 * Command to upload a new game
 * Following CQRS pattern for separating command and query responsibilities
 */
export interface UploadGameCommand {
  gameId: string;
  userId: number;
  files: {
    path: string;
    originalName: string;
    size: number;
    mimeType: string;
  }[];
  entryPoint: string;
  metadata: {
    hasExternalAPIs: boolean;
    hasServerSideCode: boolean;
    thirdPartyLibraries: string[];
    description?: string;
  };
}