import { Router } from 'express';
import resultController from '../controllers/result.controller';

const router = Router();

router.get('/:id', resultController.getResult);
router.get('/', resultController.listResults);

export default router;
