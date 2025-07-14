// Receipt processing status enum
export enum ReceiptProcessingStatus {
  UPLOADED = 'UPLOADED',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED',
  VERIFIED = 'VERIFIED'
}

// Receipt types
export interface Receipt {
  id: number;
  originalFilename: string;
  originalImageUrl: string;
  processedImageUrl?: string;
  fileSize: number;
  mimeType: string;
  processingStatus: ReceiptProcessingStatus;
  ocrConfidence?: number;
  extractedData?: ExtractedReceiptData;
  verifiedData?: VerifiedReceiptData;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  items: ReceiptItem[];
  linkedTransactionIds: number[];
}

export interface ReceiptItem {
  id: number;
  itemName?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  categorySuggestion?: string;
  lineNumber?: number;
  createdAt: string;
}

export interface ExtractedReceiptData {
  merchantName?: string;
  totalAmount?: number;
  subtotal?: number;
  taxAmount?: number;
  tipAmount?: number;
  date?: string;
  time?: string;
  address?: string;
  phoneNumber?: string;
  items: Array<Record<string, any>>;
  confidence?: number;
}

export interface VerifiedReceiptData {
  merchantName: string;
  totalAmount: number;
  subtotal?: number;
  taxAmount?: number;
  tipAmount?: number;
  date?: string;
  notes?: string;
}

// Request types
export interface ReceiptUploadRequest {
  file: File;
}

export interface ReceiptVerificationRequest {
  receiptId: number;
  merchantName: string;
  totalAmount: number;
  date?: string;
  taxAmount?: number;
  tipAmount?: number;
  subtotal?: number;
  items: ReceiptItemRequest[];
  notes?: string;
}

export interface ReceiptItemRequest {
  itemName: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  categorySuggestion?: string;
  lineNumber?: number;
}

export interface CreateTransactionFromReceiptRequest {
  receiptId: number;
  accountId: number;
  categoryId: number;
  description?: string;
  tags: string[];
}

// Response types
export interface ReceiptListResponse {
  receipts: Receipt[];
  totalCount: number;
  unverifiedCount: number;
  processingCount: number;
  failedCount: number;
}

export interface ReceiptStatsResponse {
  totalReceipts: number;
  processedReceipts: number;
  verifiedReceipts: number;
  unlinkedReceipts: number;
  totalAmount: number;
  averageProcessingTime?: number; // in milliseconds
  successRate: number; // percentage
}

// UI-specific types
export interface ReceiptUploadProgress {
  receiptId?: number;
  filename: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface ReceiptFilter {
  status?: ReceiptProcessingStatus;
  dateFrom?: string;
  dateTo?: string;
  merchantName?: string;
  minAmount?: number;
  maxAmount?: number;
  isVerified?: boolean;
  isLinked?: boolean;
}

export interface ReceiptSortOptions {
  field: 'createdAt' | 'totalAmount' | 'merchantName' | 'processingStatus';
  direction: 'asc' | 'desc';
}
