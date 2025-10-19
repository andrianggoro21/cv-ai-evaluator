import { Request, Response, NextFunction } from 'express';
import jobRepository from '../repositories/job.repository';
import documentRepository from '../repositories/document.repository';
import evaluationQueue from '@config/queue';
import { StatusCodes } from '../utils/httpStatus';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { EvaluateRequest } from '../types/api.types';

export class EvaluateController {
  async createEvaluation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { job_title, cvDocumentId, projectDocumentId } = req.body as EvaluateRequest;

      if (!job_title || !cvDocumentId || !projectDocumentId) {
        throw new BadRequestError('job_title, cvDocumentId, and projectDocumentId are required');
      }

      const cvDoc = await documentRepository.findById(cvDocumentId);
      if (!cvDoc || cvDoc.type !== 'cv') {
        throw new NotFoundError('CV document not found');
      }

      const projectDoc = await documentRepository.findById(projectDocumentId);
      if (!projectDoc || projectDoc.type !== 'report') {
        throw new NotFoundError('Project report document not found');
      }

      const job = await jobRepository.create({
        cvId: cvDocumentId,
        reportId: projectDocumentId,
        jobTitle: job_title,
        status: 'queued',
      });

      await evaluationQueue.add('evaluation-job', {
        jobId: job.id,
        job_title,
        cvDocumentId,
        projectDocumentId,
      });

      res.status(StatusCodes.OK).json({
        id: job.id,
        status: 'queued',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new EvaluateController();
