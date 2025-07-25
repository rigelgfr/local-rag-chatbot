export interface UploadRequest {
  folderId: string;
  files: {
    id: string;
    name: string;
    type: string;
    encryptedData: string;
    originalSize: number;
  }[];
  path: string;
}

export interface UploadResult {
  success: boolean;
  fileName: string;
  message: string;
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  results: UploadResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
    skipped: number;
    duplicates: string[];
  };
}

export interface UploadFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}
