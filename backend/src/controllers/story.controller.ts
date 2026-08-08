import { Request, Response, NextFunction } from 'express';
import { StoryService } from '../services/story.service';

export class StoryController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const story = await StoryService.createStory(userId, req.body);
      return res.status(201).json({
        success: true,
        message: 'User story created successfully',
        data: story,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getByProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.query;
      if (!projectId || typeof projectId !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Query parameter projectId is required',
        });
      }
      const stories = await StoryService.getStoriesByProject(projectId);
      return res.status(200).json({
        success: true,
        data: stories,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const story = await StoryService.getStoryById(id);
      return res.status(200).json({
        success: true,
        data: story,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const story = await StoryService.updateStory(id, userId, req.body);
      return res.status(200).json({
        success: true,
        message: 'User story updated successfully',
        data: story,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const result = await StoryService.deleteStory(id, userId);
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      return next(error);
    }
  }
}
