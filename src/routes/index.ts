import { Router } from 'express';
import uploadRoutes from './upload.routes';
import evaluateRoutes from './evaluate.routes';
import resultRoutes from './result.routes';

const router = Router();

router.use('/upload', uploadRoutes);
router.use('/evaluate', evaluateRoutes);
router.use('/result', resultRoutes);

export default router;
