import { Request, Response, NextFunction } from 'express';
import jobRepository from '../repositories/job.repository';
import resultRepository from '../repositories/result.repository';
import { StatusCodes } from '../utils/httpStatus';
import { NotFoundError } from '../utils/errors';
import { GetResultResponse } from '../types/api.types';

export class ResultController {
  async getResult(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const job = await jobRepository.findById(id);

      if (!job) {
        throw new NotFoundError('Job not found');
      }

      if (job.status === 'queued' || job.status === 'processing') {
        const response: GetResultResponse = {
          id: job.id,
          status: job.status,
        };
        res.status(StatusCodes.OK).json(response);
        return;
      }

      if (job.status === 'failed') {
        const response: GetResultResponse = {
          id: job.id,
          status: 'failed',
          error: 'Evaluation job failed',
        };
        res.status(StatusCodes.OK).json(response);
        return;
      }

      const result = await resultRepository.findByJobId(job.id);

      if (!result) {
        throw new NotFoundError('Result not found');
      }

      const response: GetResultResponse = {
        id: job.id,
        status: 'completed',
        result: {
          cv_match_rate: result.cvMatchRate || 0,
          cv_feedback: result.cvFeedback || '',
          project_score: result.projectScore || 0,
          project_feedback: result.projectFeedback || '',
          overall_summary: result.finalAnalysis || '',
        },
      };

      res.status(StatusCodes.OK).json(response);
    } catch (error) {
      next(error);
    }
  }

  async listResults(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const jobs = await jobRepository.findAll();

      res.status(StatusCodes.OK).json({
        success: true,
        jobs: jobs.map((job) => ({
          id: job.id,
          status: job.status,
          jobTitle: job.jobTitle,
          createdAt: job.createdAt,
        })),
        total: jobs.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new ResultController();
