import { Request, Response, NextFunction } from 'express';
import documentRepository from '../repositories/document.repository';
import { StatusCodes } from '../utils/httpStatus';
import { BadRequestError } from '../utils/errors';

export class UploadController {
  async uploadDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!files || !files.cv || !files.projectReport) {
        throw new BadRequestError('Both CV and Project Report files are required');
      }

      const cvFile = files.cv[0];
      const projectFile = files.projectReport[0];

      const cvDocument = await documentRepository.create({
        filename: cvFile.originalname,
        filepath: cvFile.path,
        type: 'cv',
      });

      const projectDocument = await documentRepository.create({
        filename: projectFile.originalname,
        filepath: projectFile.path,
        type: 'report',
      });

      res.status(StatusCodes.OK).json({
        success: true,
        message: 'Documents uploaded successfully',
        cvDocumentId: cvDocument.id,
        projectDocumentId: projectDocument.id,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UploadController();
