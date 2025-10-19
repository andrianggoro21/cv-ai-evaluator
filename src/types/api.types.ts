import { Job, Result } from '@prisma/client';

// ============================================
// UPLOAD ENDPOINTS
// ============================================

// POST /upload accepts multipart/form-data with both CV and Project Report
export interface UploadRequest {
  candidateName?: string;
  candidateEmail?: string;
  // Files are handled by multer middleware
  // cv: File (multipart/form-data)
  // projectReport: File (multipart/form-data)
}

export interface UploadResponse {
  success: boolean;
  message: string;
  cvDocumentId: string;
  projectDocumentId: string;
}

// ============================================
// EVALUATION ENDPOINTS
// ============================================

// POST /evaluate triggers async AI evaluation pipeline
export interface EvaluateRequest {
  job_title: string; // Job title for evaluation context
  cvDocumentId: string;
  projectDocumentId: string;
}

// Immediately returns job ID
export interface EvaluateResponse {
  id: string; // Job ID for tracking
  status: 'queued';
}

// ============================================
// RESULT ENDPOINTS
// ============================================

// GET /result/:id - Multi-stage evaluation status
export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

// While queued or processing
export interface ResultPendingResponse {
  id: string;
  status: 'queued' | 'processing';
}

// Once completed
export interface ResultCompletedResponse {
  id: string;
  status: 'completed';
  result: EvaluationResult;
}

// If failed
export interface ResultFailedResponse {
  id: string;
  status: 'failed';
  error: string;
}

// Union type for all possible responses
export type GetResultResponse =
  | ResultPendingResponse
  | ResultCompletedResponse
  | ResultFailedResponse;

// The actual result structure from evaluation
export interface EvaluationResult {
  cv_match_rate: number; // 0-1 scale
  cv_feedback: string;
  project_score: number; // 1-5 scale
  project_feedback: string;
  overall_summary: string;
}

// Extended job type with result
export interface JobWithResult extends Job {
  result?: Result | null;
}

// List all results (optional endpoint)
export interface ListResultsResponse {
  success: boolean;
  jobs: JobWithResult[];
  total: number;
}

// ============================================
// HEALTH CHECK
// ============================================

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  services: {
    database: boolean;
    vectorDb: boolean;
    queue: boolean;
    gemini: boolean;
  };
}

// ============================================
// ERROR RESPONSE
// ============================================

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

// ============================================
// PAGINATION
// ============================================

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
