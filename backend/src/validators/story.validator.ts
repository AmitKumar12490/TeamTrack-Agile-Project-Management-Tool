import { z } from 'zod';

export const createStorySchema = z.object({
  body: z.object({
    title: z.string().min(2, 'User story title must be at least 2 characters'),
    description: z.string().optional(),
    projectId: z.string().uuid('Invalid project ID format'),
  }),
});

export const updateStorySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid story ID format'),
  }),
  body: z.object({
    title: z.string().min(2, 'User story title must be at least 2 characters').optional(),
    description: z.string().optional(),
  }),
});

export const storyIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid story ID format'),
  }),
});

export type CreateStoryInput = z.infer<typeof createStorySchema>['body'];
export type UpdateStoryInput = z.infer<typeof updateStorySchema>['body'];
