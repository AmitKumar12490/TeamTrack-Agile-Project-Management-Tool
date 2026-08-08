import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  taskIdParamSchema,
} from '../validators/task.validator';

const router = Router();

router.use(authenticate);

router.post('/', validate(createTaskSchema), TaskController.create);
router.get('/', TaskController.getAll);
router.get('/:id', validate(taskIdParamSchema), TaskController.getById);
router.put('/:id', validate(updateTaskSchema), TaskController.update);
router.patch('/:id/status', validate(updateTaskStatusSchema), TaskController.updateStatus);
router.delete('/:id', validate(taskIdParamSchema), TaskController.delete);

export default router;
