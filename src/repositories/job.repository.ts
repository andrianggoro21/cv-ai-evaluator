import { PrismaClient, Job } from '@prisma/client';
import prisma from '@config/database';
import { JobStatus } from '../types/api.types';

export class JobRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    cvId: string;
    reportId: string;
    jobTitle: string;
    status: JobStatus;
  }): Promise<Job> {
    return await this.prisma.job.create({
      data,
    });
  }

  async findById(id: string): Promise<Job | null> {
    return await this.prisma.job.findUnique({
      where: { id },
      include: {
        cv: true,
        report: true,
        result: true,
      },
    });
  }

  async findByStatus(status: JobStatus): Promise<Job[]> {
    return await this.prisma.job.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      include: {
        cv: true,
        report: true,
        result: true,
      },
    });
  }

  async findAll(): Promise<Job[]> {
    return await this.prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        cv: true,
        report: true,
        result: true,
      },
    });
  }

  async updateStatus(id: string, status: JobStatus): Promise<Job> {
    return await this.prisma.job.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string): Promise<Job> {
    return await this.prisma.job.delete({
      where: { id },
    });
  }
}

export default new JobRepository(prisma);
