import { Router } from 'express';
import uploadController from '../controllers/upload.controller';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.post(
  '/',
  upload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'projectReport', maxCount: 1 },
  ]),
  uploadController.uploadDocuments
);

export default router;
