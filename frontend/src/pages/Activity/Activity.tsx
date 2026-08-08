import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { activityService } from '../../services/activity.service';
import { ActivityTimeline } from '../../components/activity/ActivityTimeline';
import { Activity as ActivityIcon, Loader2 } from 'lucide-react';

export default function Activity() {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => activityService.getActivities(100),
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
          <ActivityIcon className="w-7 h-7 text-brand-600 dark:text-brand-400" />
          Activity History
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Chronological audit trail of all project, story, task, and comment events
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <ActivityTimeline activities={activities} />
        </div>
      )}
    </div>
  );
}
