export interface CVEvaluationResult {
  cv_match_rate: number;
  cv_feedback: string;
  breakdown: CVScoreBreakdown;
}

export interface CVScoreBreakdown {
  technical_skills_match: number;
  experience_level: number;
  relevant_achievements: number;
  cultural_fit: number;
}

export interface CVEvaluationCriteria {
  technical_skills_weight: number;
  experience_weight: number;
  achievements_weight: number;
  cultural_fit_weight: number;
}

export interface ProjectEvaluationResult {
  project_score: number;
  project_feedback: string;
  breakdown: ProjectScoreBreakdown;
}

export interface ProjectScoreBreakdown {
  correctness: number;
  code_quality: number;
  resilience_error_handling: number;
  documentation: number;
  creativity_bonus: number;
}

export interface ProjectEvaluationCriteria {
  correctness_weight: number;
  code_quality_weight: number;
  resilience_weight: number;
  documentation_weight: number;
  creativity_weight: number;
}

export interface FinalAnalysisResult {
  overall_summary: string;
  recommendation: 'Highly Recommended' | 'Recommended' | 'Consider' | 'Not Recommended';
  strengths: string[];
  weaknesses: string[];
  final_score: number;
}

export interface CompleteEvaluationResult {
  cv_evaluation: CVEvaluationResult;
  project_evaluation: ProjectEvaluationResult;
  final_analysis: FinalAnalysisResult;
  metadata: EvaluationMetadata;
}

export interface EvaluationMetadata {
  candidate_name?: string;
  candidate_email?: string;
  job_title: string;
  cv_document_id: string;
  project_document_id: string;
  evaluation_date: Date;
  processing_time_seconds: number;
  llm_model: string;
  rag_contexts_retrieved: number;
}

export interface RAGContext {
  content: string;
  source: 'job-description' | 'case-study-brief' | 'scoring-rubric';
  filename: string;
  similarity_score: number;
  chunk_index?: number;
}

export interface RAGRetrievalResult {
  contexts: RAGContext[];
  query: string;
  top_k: number;
  retrieval_time_ms: number;
}

export interface CVEvaluationPrompt {
  cv_text: string;
  rag_contexts: RAGContext[];
  job_title: string;
}

export interface ProjectEvaluationPrompt {
  project_text: string;
  rag_contexts: RAGContext[];
  job_title: string;
  cv_score: number;
}

export interface FinalAnalysisPrompt {
  cv_evaluation: CVEvaluationResult;
  project_evaluation: ProjectEvaluationResult;
  job_title: string;
  rag_contexts: RAGContext[];
}

export const CV_WEIGHTS: CVEvaluationCriteria = {
  technical_skills_weight: 0.4,
  experience_weight: 0.25,
  achievements_weight: 0.2,
  cultural_fit_weight: 0.15,
};

export const PROJECT_WEIGHTS: ProjectEvaluationCriteria = {
  correctness_weight: 0.3,
  code_quality_weight: 0.25,
  resilience_weight: 0.2,
  documentation_weight: 0.15,
  creativity_weight: 0.1,
};

export const SCORING_SCALE = {
  MIN: 1,
  MAX: 5,
} as const;

export type EvaluationStage = 'cv' | 'project' | 'final';

export interface StageProgress {
  stage: EvaluationStage;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  started_at?: Date;
  completed_at?: Date;
  error?: string;
}
