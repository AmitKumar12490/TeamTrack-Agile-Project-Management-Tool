import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createProjectSchema,
  updateProjectSchema,
  projectIdParamSchema,
} from '../validators/project.validator';

const router = Router();

// All project routes require authentication
router.use(authenticate);

router.post('/', validate(createProjectSchema), ProjectController.create);
router.get('/', ProjectController.getAll);
router.get('/:id', validate(projectIdParamSchema), ProjectController.getById);
router.put('/:id', validate(updateProjectSchema), ProjectController.update);
router.delete('/:id', validate(projectIdParamSchema), ProjectController.delete);

export default router;
