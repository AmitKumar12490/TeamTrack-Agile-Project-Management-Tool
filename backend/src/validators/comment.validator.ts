import { z } from 'zod';

export const createCommentSchema = z.object({
  body: z.object({
    message: z.string().min(1, 'Comment message cannot be empty'),
    taskId: z.string().uuid('Invalid task ID format'),
  }),
});

export const commentIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid comment ID format'),
  }),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>['body'];
