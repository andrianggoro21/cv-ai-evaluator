import { CompleteEvaluationResult, StageProgress } from './evaluation.types';

export const QUEUE_NAMES = {
  EVALUATION: 'evaluation-queue',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

export interface EvaluationJobData {
  jobId: string;
  job_title: string;
  cvDocumentId: string;
  projectDocumentId: string;
  candidateName?: string;
  candidateEmail?: string;
}

export interface EvaluationJobResult {
  success: boolean;
  result?: CompleteEvaluationResult;
  error?: string;
}

export interface JobProgressData {
  stage: StageProgress;
  percentage: number;
  message: string;
}

export interface EvaluationJobOptions {
  attempts: number;
  backoff: {
    type: 'exponential';
    delay: number;
  };
  removeOnComplete: boolean;
  removeOnFail: boolean;
}

export const DEFAULT_JOB_OPTIONS: EvaluationJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000,
  },
  removeOnComplete: false,
  removeOnFail: false,
};

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
