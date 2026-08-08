import { Request, Response, NextFunction } from 'express';
import { ActivityService } from '../services/activity.service';

export class ActivityController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const entityType = req.query.entityType as string | undefined;
      const entityId = req.query.entityId as string | undefined;

      const activities = await ActivityService.getActivities(limit, entityType, entityId);
      return res.status(200).json({
        success: true,
        data: activities,
      });
    } catch (error) {
      return next(error);
    }
  }
}
