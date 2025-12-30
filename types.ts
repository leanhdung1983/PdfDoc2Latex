export enum FileType {
  PDF = 'application/pdf',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  UNKNOWN = 'unknown'
}

export enum ProcessingStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface UploadedFile {
  name: string;
  type: FileType;
  size: number;
  base64Data: string;
}

export interface ConversionResult {
  latexCode: string;
  timestamp: number;
}