/**
 * Evaluation Types
 * Used for AI evaluation results and scoring
 * Based on Case Study Brief requirements
 */

// ============================================
// CV EVALUATION (Stage 1)
// ============================================

export interface CVEvaluationResult {
  cv_match_rate: number; // 0-1 scale (converted from 1-5)
  cv_feedback: string; // Detailed feedback from LLM
  breakdown: CVScoreBreakdown;
}

export interface CVScoreBreakdown {
  technical_skills_match: number; // 1-5 scale
  experience_level: number; // 1-5 scale
  relevant_achievements: number; // 1-5 scale
  cultural_fit: number; // 1-5 scale
}

export interface CVEvaluationCriteria {
  technical_skills_weight: number; // 40%
  experience_weight: number; // 25%
  achievements_weight: number; // 20%
  cultural_fit_weight: number; // 15%
}

// ============================================
// PROJECT EVALUATION (Stage 2)
// ============================================

export interface ProjectEvaluationResult {
  project_score: number; // 1-5 scale
  project_feedback: string; // Detailed feedback from LLM
  breakdown: ProjectScoreBreakdown;
}

export interface ProjectScoreBreakdown {
  correctness: number; // 1-5 scale
  code_quality: number; // 1-5 scale
  resilience_error_handling: number; // 1-5 scale
  documentation: number; // 1-5 scale
  creativity_bonus: number; // 1-5 scale
}

export interface ProjectEvaluationCriteria {
  correctness_weight: number; // 30%
  code_quality_weight: number; // 25%
  resilience_weight: number; // 20%
  documentation_weight: number; // 15%
  creativity_weight: number; // 10%
}

// ============================================
// FINAL ANALYSIS (Stage 3)
// ============================================

export interface FinalAnalysisResult {
  overall_summary: string; // Combined summary from LLM (3-5 sentences)
  recommendation: 'Highly Recommended' | 'Recommended' | 'Consider' | 'Not Recommended';
  strengths: string[];
  weaknesses: string[];
  final_score: number; // Weighted average of CV + Project
}

// ============================================
// COMPLETE EVALUATION RESULT
// ============================================

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
  llm_model: string; // e.g., "gemini-1.5-flash"
  rag_contexts_retrieved: number;
}

// ============================================
// RAG CONTEXT
// ============================================

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

// ============================================
// LLM PROMPT TEMPLATES
// ============================================

export interface CVEvaluationPrompt {
  cv_text: string;
  rag_contexts: RAGContext[];
  job_title: string;
}

export interface ProjectEvaluationPrompt {
  project_text: string;
  rag_contexts: RAGContext[];
  job_title: string;
  cv_score: number; // From stage 1
}

export interface FinalAnalysisPrompt {
  cv_evaluation: CVEvaluationResult;
  project_evaluation: ProjectEvaluationResult;
  job_title: string;
  rag_contexts: RAGContext[];
}

// ============================================
// SCORING CONSTANTS
// ============================================

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

// ============================================
// HELPER TYPES
// ============================================

export type EvaluationStage = 'cv' | 'project' | 'final';

export interface StageProgress {
  stage: EvaluationStage;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  started_at?: Date;
  completed_at?: Date;
  error?: string;
}
