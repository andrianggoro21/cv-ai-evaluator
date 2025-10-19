import { PrismaClient, Result } from '@prisma/client';
import prisma from '@config/database';

export class ResultRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    jobId: string;
    cvMatchRate?: number;
    cvFeedback?: string;
    projectScore?: number;
    projectFeedback?: string;
    overallSummary?: string;
  }): Promise<Result> {
    return await this.prisma.result.create({
      data,
    });
  }

  async findByJobId(jobId: string): Promise<Result | null> {
    return await this.prisma.result.findUnique({
      where: { jobId },
      include: {
        job: {
          include: {
            cv: true,
            report: true,
          },
        },
      },
    });
  }

  async update(
    jobId: string,
    data: {
      cvMatchRate?: number;
      cvFeedback?: string;
      projectScore?: number;
      projectFeedback?: string;
      overallSummary?: string;
    }
  ): Promise<Result> {
    return await this.prisma.result.update({
      where: { jobId },
      data,
    });
  }

  async delete(jobId: string): Promise<Result> {
    return await this.prisma.result.delete({
      where: { jobId },
    });
  }

  async findAll(): Promise<Result[]> {
    return await this.prisma.result.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        job: {
          include: {
            cv: true,
            report: true,
          },
        },
      },
    });
  }
}

export default new ResultRepository(prisma);
