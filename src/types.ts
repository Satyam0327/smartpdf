export interface AIAnalysis {
  docType: string;
  contentType: {
    text: number;
    images: number;
    charts: number;
  };
  currentQuality: string;
  recommendedSettings: CompressionSettings;
  estimatedReduction: number;
  qualityImpact: string;
}

export interface CompressionSettings {
  imageQuality: number;
  dpi: number;
  colorMode: 'RGB' | 'Grayscale' | 'B&W';
  removeMetadata: boolean;
  optimizeFonts?: boolean;
}

export interface FileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  analysis?: AIAnalysis | null;
  progress: number;
  result?: {
    compressedSize: number;
    downloadUrl: string;
    filename: string;
  };
}

export type CompressionMode = 'TargetSize' | 'UseCase' | 'Custom';
