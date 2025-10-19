import { PrismaClient, Document } from '@prisma/client';
import prisma from '@config/database';

export class DocumentRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: {
    filename: string;
    filepath: string;
    type: 'cv' | 'report';
  }): Promise<Document> {
    return await this.prisma.document.create({
      data,
    });
  }

  async findById(id: string): Promise<Document | null> {
    return await this.prisma.document.findUnique({
      where: { id },
    });
  }

  async findByType(type: 'cv' | 'report'): Promise<Document[]> {
    return await this.prisma.document.findMany({
      where: { type },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async findAll(): Promise<Document[]> {
    return await this.prisma.document.findMany({
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async delete(id: string): Promise<Document> {
    return await this.prisma.document.delete({
      where: { id },
    });
  }
}

export default new DocumentRepository(prisma);
