/**
 * Queue Types
 * Used for BullMQ job queue types and job data
 */

import { CompleteEvaluationResult, StageProgress } from './evaluation.types';

// ============================================
// JOB TYPES
// ============================================

export const QUEUE_NAMES = {
  EVALUATION: 'evaluation-queue',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

// ============================================
// JOB DATA
// ============================================

// Data passed to the evaluation job
export interface EvaluationJobData {
  jobId: string; // Database job ID
  job_title: string;
  cvDocumentId: string;
  projectDocumentId: string;
  candidateName?: string;
  candidateEmail?: string;
}

// ============================================
// JOB RESULT
// ============================================

// Result returned after job completion
export interface EvaluationJobResult {
  success: boolean;
  result?: CompleteEvaluationResult;
  error?: string;
}

// ============================================
// JOB PROGRESS
// ============================================

// Progress updates during job execution
export interface JobProgressData {
  stage: StageProgress;
  percentage: number; // 0-100
  message: string;
}

// ============================================
// JOB OPTIONS
// ============================================

export interface EvaluationJobOptions {
  attempts: number; // Retry attempts
  backoff: {
    type: 'exponential';
    delay: number; // Initial delay in ms
  };
  removeOnComplete: boolean;
  removeOnFail: boolean;
}

// Default job options
export const DEFAULT_JOB_OPTIONS: EvaluationJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000, // 5 seconds
  },
  removeOnComplete: false,
  removeOnFail: false,
};

// ============================================
// QUEUE EVENTS
// ============================================

export type QueueEventType =
  | 'completed'
  | 'failed'
  | 'progress'
  | 'active'
  | 'waiting'
  | 'delayed';

export interface QueueEventPayload {
  jobId: string;
  event: QueueEventType;
  data?: unknown;
  error?: Error;
  timestamp: Date;
}
