import { Job, Result } from '@prisma/client';

export interface UploadRequest {
  candidateName?: string;
  candidateEmail?: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  cvDocumentId: string;
  projectDocumentId: string;
}

export interface EvaluateRequest {
  job_title: string;
  cvDocumentId: string;
  projectDocumentId: string;
}

export interface EvaluateResponse {
  id: string;
  status: 'queued';
}

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface ResultPendingResponse {
  id: string;
  status: 'queued' | 'processing';
}

export interface ResultCompletedResponse {
  id: string;
  status: 'completed';
  result: EvaluationResult;
}

export interface ResultFailedResponse {
  id: string;
  status: 'failed';
  error: string;
}

export type GetResultResponse =
  | ResultPendingResponse
  | ResultCompletedResponse
  | ResultFailedResponse;

export interface EvaluationResult {
  cv_match_rate: number;
  cv_feedback: string;
  project_score: number;
  project_feedback: string;
  overall_summary: string;
}

export interface JobWithResult extends Job {
  result?: Result | null;
}

export interface ListResultsResponse {
  success: boolean;
  jobs: JobWithResult[];
  total: number;
}

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

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

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
