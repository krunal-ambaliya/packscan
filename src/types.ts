export type Severity = 'CRITICAL' | 'MAJOR' | 'MINOR';

export type UserRole = 'CENTRAL_OFFICER' | 'STATE_OFFICER' | 'ADMIN' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  state: string;
  token?: string;
}

export interface ExtractedField {
  id: string;
  fieldName: string;
  label: string;
  value: string;
  bbox: [number, number, number, number]; // [x, y, width, height]
  confidence: number;
  fontMm?: number;
  statutoryRequiredFontMm?: number;
  hasViolation?: boolean;
}

export interface Violation {
  id: string;
  ruleClause: string;
  field: string;
  severity: Severity;
  message: string;
  expected: string;
  actual: string;
}

export interface InspectionRecord {
  id: string;
  productId: string;
  productName: string;
  brand: string;
  category: string;
  barcode: string;
  imageUrl: string;
  imageDimensions: { width: number; height: number };
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  complianceStatus: 'COMPLIANT' | 'NON_COMPLIANT';
  scannedAt: string;
  officerEmail: string;
  state: string;
  extractedFields: ExtractedField[];
  violations: Violation[];
  metrics: {
    totalViolations: number;
    criticalCount: number;
    majorCount: number;
    minorCount: number;
    processingTimeMs: number;
  };
}

export interface LMPCRuleItem {
  id: string;
  clause: string;
  field: string;
  title: string;
  severity: Severity;
  description: string;
  expected: string;
  allowedUnits?: string[];
}
