import { z } from 'zod';

export const storySchema = z.object({
  title: z.string().min(2, 'Story title must be at least 2 characters'),
  description: z.string().optional(),
});

export type StoryFormData = z.infer<typeof storySchema>;
