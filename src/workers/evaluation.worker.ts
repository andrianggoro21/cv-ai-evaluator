import 'dotenv/config';
import { Worker, Job } from 'bullmq';
import { redisConnection } from '@config/queue';
import pdfService from '../services/pdf.service';
import cvEvaluationService from '../services/cvEvaluation.service';
import projectEvaluationService from '../services/projectEvaluation.service';
import finalAnalysisService from '../services/finalAnalysis.service';
import documentRepository from '../repositories/document.repository';
import jobRepository from '../repositories/job.repository';
import resultRepository from '../repositories/result.repository';
import { EvaluationJobData, EvaluationJobResult } from '../types/queue.types';
import {
  CompleteEvaluationResult,
  CVEvaluationResult,
  ProjectEvaluationResult,
  FinalAnalysisResult,
} from '../types/evaluation.types';

async function processEvaluation(job: Job<EvaluationJobData>): Promise<EvaluationJobResult> {
  const { jobId, job_title, cvDocumentId, projectDocumentId } = job.data;

  const startTime = Date.now();

  try {
    await jobRepository.updateStatus(jobId, 'processing');
    await job.updateProgress(10);

    const cvDocument = await documentRepository.findById(cvDocumentId);
    const projectDocument = await documentRepository.findById(projectDocumentId);

    if (!cvDocument || !projectDocument) {
      throw new Error('Document not found');
    }

    await job.updateProgress({
      stage: 'cv_evaluation',
      percentage: 20,
      message: 'Extracting CV text...',
    });

    const cvText = await pdfService.extractText(cvDocument.filepath);

    await job.updateProgress({
      stage: 'cv_evaluation',
      percentage: 30,
      message: 'Evaluating CV with AI...',
    });

    const cvEvaluation: CVEvaluationResult = await cvEvaluationService.evaluateCV(
      cvText,
      job_title
    );

    await job.updateProgress({
      stage: 'project_evaluation',
      percentage: 50,
      message: 'Extracting project report text...',
    });

    const projectText = await pdfService.extractText(projectDocument.filepath);

    await job.updateProgress({
      stage: 'project_evaluation',
      percentage: 60,
      message: 'Evaluating project report with AI...',
    });

    const projectEvaluation: ProjectEvaluationResult =
      await projectEvaluationService.evaluateProject(
        projectText,
        job_title,
        cvEvaluation.cv_match_rate
      );

    await job.updateProgress({
      stage: 'final_analysis',
      percentage: 80,
      message: 'Generating final hiring recommendation...',
    });

    const finalAnalysis: FinalAnalysisResult = await finalAnalysisService.generateFinalAnalysis(
      cvEvaluation,
      projectEvaluation,
      job_title
    );

    const processingTime = Math.round((Date.now() - startTime) / 1000);

    const completeResult: CompleteEvaluationResult = {
      cv_evaluation: cvEvaluation,
      project_evaluation: projectEvaluation,
      final_analysis: finalAnalysis,
      metadata: {
        job_title,
        cv_document_id: cvDocumentId,
        project_document_id: projectDocumentId,
        evaluation_date: new Date(),
        processing_time_seconds: processingTime,
        llm_model: 'gemini-2.0-flash-exp',
        rag_contexts_retrieved: 0,
      },
    };

    await resultRepository.create({
      jobId,
      cvMatchRate: cvEvaluation.cv_match_rate,
      projectScore: projectEvaluation.project_score,
      overallScore: finalAnalysis.final_score,
      hiringRecommendation: finalAnalysis.recommendation,
      cvFeedback: cvEvaluation.cv_feedback,
      projectFeedback: projectEvaluation.project_feedback,
      finalAnalysis: finalAnalysis.overall_summary,
      breakdown: JSON.stringify(cvEvaluation.breakdown),
      projectBreakdown: JSON.stringify(projectEvaluation.breakdown),
      strengths: JSON.stringify(finalAnalysis.strengths),
      weaknesses: JSON.stringify(finalAnalysis.weaknesses),
    });

    await jobRepository.updateStatus(jobId, 'completed');
    await job.updateProgress(100);

    return {
      success: true,
      result: completeResult,
    };
  } catch (error: any) {
    const isQuotaError = error.message?.includes('quota') || error.message?.includes('rate limit');

    if (isQuotaError) {
      console.error(`[Worker] Job ${jobId} failed due to API quota limit`);
    } else {
      console.error(`[Worker] Job ${jobId} failed:`, error);
    }

    await jobRepository.updateStatus(jobId, 'failed');

    const errorMessage = isQuotaError
      ? 'API quota limit exceeded. Please try again later.'
      : error.message;

    return {
      success: false,
      error: errorMessage,
    };
  }
}

const worker = new Worker<EvaluationJobData, EvaluationJobResult>('evaluation', processEvaluation, {
  connection: redisConnection,
  concurrency: parseInt(process.env.WORKER_CONCURRENCY || '2'),
  limiter: {
    max: parseInt(process.env.RATE_LIMIT_MAX || '10'),
    duration: parseInt(process.env.RATE_LIMIT_DURATION || '60000'),
  },
});

worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message);
});

worker.on('error', (err) => {
  console.error('[Worker] Worker error:', err);
});

process.on('SIGTERM', async () => {
  console.log('[Worker] Shutting down gracefully...');
  await worker.close();
  await redisConnection.quit();
});

console.log('[Worker] Evaluation worker started');

export default worker;
