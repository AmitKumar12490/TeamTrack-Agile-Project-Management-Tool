import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().min(2, 'Task title must be at least 2 characters'),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).default('TODO'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  dueDate: z.string().optional().nullable(),
  userStoryId: z.string().optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;
