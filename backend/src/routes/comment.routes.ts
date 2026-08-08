import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createCommentSchema, commentIdParamSchema } from '../validators/comment.validator';

const router = Router();

router.use(authenticate);

router.post('/', validate(createCommentSchema), CommentController.add);
router.get('/', CommentController.getByTask);
router.delete('/:id', validate(commentIdParamSchema), CommentController.delete);

export default router;
