export interface VoterRecord {
  id: string;
  serialNumber: string;
  epicNumber: string;
  voterName: string;
  relationshipType: 'Father' | 'Husband' | 'Mother' | 'Other' | string;
  relationshipName: string;
  fatherName: string;
  husbandName: string;
  motherName: string;
  otherRelationName: string;
  houseNumber: string;
  age: number;
  gender: 'પુરુષ' | 'સ્ત્રી' | 'ત્રીજી જાતિ' | string;
  pageNumber: number;
  vibhagNumber: string; // વિભાગ નંબર
  vibhagName: string;   // વિભાગનું નામ
  wardNumber: string;   // વોર્ડ નંબર
  bhagNumber: string;   // ભાગ નંબર
  pdfName: string;      // PDF ફાઇલનું નામ
  isDeleted: boolean;
  flags: string[];
  confidence: 'high' | 'medium' | 'low';
  isVerified: boolean;
}

export type PageExtractionStatus = 'pending' | 'processing' | 'completed' | 'needs_review' | 'failed';

export interface PageStatusInfo {
  pageNumber: number;
  status: PageExtractionStatus;
  recordsCount: number;
  error?: string;
  summary?: string;
  method?: 'text_parsing' | 'vision_ocr';
  thumbnailUrl?: string;
  processedAt?: string;
}

export interface VerificationIssue {
  id: string;
  type: 'duplicate_epic' | 'suspicious_age' | 'missing_epic' | 'incomplete_name' | 'missing_gender' | 'sequence_gap';
  title: string;
  description: string;
  severity: 'warning' | 'error' | 'info';
  recordId?: string;
  pageNumber?: number;
  field?: keyof VoterRecord;
}

export interface VerificationSummary {
  totalRecords: number;
  verifiedRecords: number;
  unverifiedRecords: number;
  duplicateEpicsCount: number;
  missingEpicsCount: number;
  suspiciousAgesCount: number;
  incompleteNamesCount: number;
  unprocessedPagesCount: number;
  failedPagesCount: number;
  isFullyComplete: boolean;
  issues: VerificationIssue[];
}

export interface PDFFileInfo {
  id: string;
  name: string;
  size: number;
  pageCount: number;
  file?: File;
  arrayBuffer?: ArrayBuffer;
  pdfDoc?: any;
  bhagNumber?: string;
  assemblyConstituency?: string;
  wardNumber?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  extractedCount?: number;
  pageStatuses?: PageStatusInfo[];
  error?: string;
}

