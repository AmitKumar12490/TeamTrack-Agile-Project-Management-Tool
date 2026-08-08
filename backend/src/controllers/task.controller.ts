import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';

export class TaskController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const task = await TaskService.createTask(userId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { userStoryId, status, priority, search } = req.query;
      const tasks = await TaskService.getTasks({
        userStoryId: userStoryId as string | undefined,
        status: status as string | undefined,
        priority: priority as string | undefined,
        search: search as string | undefined,
      });
      return res.status(200).json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const task = await TaskService.getTaskById(id);
      return res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const task = await TaskService.updateTask(id, userId, req.body);
      return res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: task,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user!.userId;
      const task = await TaskService.updateTask(id, userId, { status });
      return res.status(200).json({
        success: true,
        message: 'Task status updated successfully',
        data: task,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const result = await TaskService.deleteTask(id, userId);
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      return next(error);
    }
  }
}
