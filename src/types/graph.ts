export interface GraphTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface DriveItem {
  id: string;
  name: string;
  size?: number;
  createdDateTime: string;
  lastModifiedDateTime: string;
  file?: {
    mimeType: string;
  };
  folder?: {
    childCount: number;
  };
}

export interface GraphDriveResponse {
  value: DriveItem[];
  "@odata.nextLink"?: string;
}

export interface GraphError {
  error: {
    code: string;
    message: string;
  };
}
