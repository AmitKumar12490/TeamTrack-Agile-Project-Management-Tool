import React from 'react';
import { ActivityItem } from '../../types/activity.types';
import {
  FolderKanban,
  Layers,
  CheckSquare,
  MessageSquare,
  Clock,
  User as UserIcon,
} from 'lucide-react';

interface ActivityTimelineProps {
  activities: ActivityItem[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activities }) => {
  const getEventIcon = (entityType: string) => {
    switch (entityType) {
      case 'PROJECT':
        return <FolderKanban className="w-4 h-4 text-blue-500" />;
      case 'USER_STORY':
        return <Layers className="w-4 h-4 text-purple-500" />;
      case 'TASK':
        return <CheckSquare className="w-4 h-4 text-emerald-500" />;
      case 'COMMENT':
        return <MessageSquare className="w-4 h-4 text-amber-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-gray-400">
        No activity records logged yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-800">
      {activities.map((activity) => (
        <div key={activity.id} className="relative flex items-start gap-3 group">
          {/* Node Icon */}
          <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 flex items-center justify-center shadow-sm">
            {getEventIcon(activity.entityType)}
          </div>

          <div className="flex-1 bg-white dark:bg-gray-800/80 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                {activity.user?.name || 'System'}
              </span>
              <span className="text-[10px] text-gray-400">
                {new Date(activity.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{activity.details}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
