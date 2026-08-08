import { Router } from 'express';
import { StoryController } from '../controllers/story.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createStorySchema,
  updateStorySchema,
  storyIdParamSchema,
} from '../validators/story.validator';

const router = Router();

router.use(authenticate);

router.post('/', validate(createStorySchema), StoryController.create);
router.get('/', StoryController.getByProject);
router.get('/:id', validate(storyIdParamSchema), StoryController.getById);
router.put('/:id', validate(updateStorySchema), StoryController.update);
router.delete('/:id', validate(storyIdParamSchema), StoryController.delete);

export default router;
