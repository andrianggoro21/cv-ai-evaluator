import { Router } from 'express';
import evaluateController from '../controllers/evaluate.controller';

const router = Router();

router.post('/', evaluateController.createEvaluation);

export default router;
