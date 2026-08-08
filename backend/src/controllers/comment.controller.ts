import { Request, Response, NextFunction } from 'express';
import { CommentService } from '../services/comment.service';

export class CommentController {
  static async add(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const comment = await CommentService.addComment(userId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: comment,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getByTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.query;
      if (!taskId || typeof taskId !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Query parameter taskId is required',
        });
      }
      const comments = await CommentService.getCommentsByTask(taskId);
      return res.status(200).json({
        success: true,
        data: comments,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const result = await CommentService.deleteComment(id, userId);
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      return next(error);
    }
  }
}
