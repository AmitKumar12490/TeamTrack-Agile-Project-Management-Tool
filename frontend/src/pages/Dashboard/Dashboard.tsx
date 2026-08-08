import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboard.service';
import { useAuth } from '../../context/AuthContext';
import {
  FolderKanban,
  Layers,
  CheckSquare,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Activity,
  ArrowRight,
  Loader2,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: () => dashboardService.getMetrics(),
  });

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  const { metrics, recentProjects, recentActivities } = data;
  const completionRate = metrics.totalTasks > 0 ? Math.round((metrics.completedTasks / metrics.totalTasks) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-brand-200">Executive Overview</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">Welcome back, {user?.name || 'Developer'}!</h1>
          <p className="text-sm text-brand-100 mt-1 max-w-xl">
            Here is your current team status and task performance breakdown for active project streams.
          </p>
        </div>

        <Link
          to="/projects"
          className="px-4 py-2.5 bg-white text-brand-700 hover:bg-brand-50 rounded-xl font-bold text-sm shadow transition-all shrink-0 flex items-center gap-2"
        >
          View Projects <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase">Projects</span>
            <FolderKanban className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">{metrics.totalProjects}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase">User Stories</span>
            <Layers className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">{metrics.totalUserStories}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase">Total Tasks</span>
            <CheckSquare className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">{metrics.totalTasks}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{metrics.completedTasks}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase">Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{metrics.pendingTasks}</div>
        </div>

        <div className={`p-4 rounded-xl border shadow-sm transition-colors ${
          metrics.overdueTasks > 0
            ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
        }`}>
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className={`text-xs font-semibold uppercase ${metrics.overdueTasks > 0 ? 'text-red-600 dark:text-red-400 font-bold' : ''}`}>
              Overdue
            </span>
            <AlertTriangle className={`w-4 h-4 ${metrics.overdueTasks > 0 ? 'text-red-500' : 'text-gray-400'}`} />
          </div>
          <div className={`text-2xl font-black ${metrics.overdueTasks > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
            {metrics.overdueTasks}
          </div>
        </div>
      </div>

      {/* Progress & Quick Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
          Overall Sprint Progress ({completionRate}%)
        </h3>
        <div className="w-full bg-gray-100 dark:bg-gray-700 h-3 rounded-full overflow-hidden">
          <div
            className="bg-brand-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Grid Section: Recent Projects & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-brand-500" />
                Active Projects
              </h2>
              <Link to="/projects" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {recentProjects.length === 0 ? (
                <p className="text-xs text-gray-400">No active projects found.</p>
              ) : (
                recentProjects.map((p) => (
                  <Link
                    key={p.id}
                    to={`/projects/${p.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700/60 hover:border-brand-400 transition-all group"
                  >
                    <div>
                      <div className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {p._count?.userStories || 0} user stories • Owner: {p.owner?.name}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-brand-500 transition-colors" />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-brand-500" />
                Recent Activity
              </h2>
              <Link to="/activity" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                Full Log
              </Link>
            </div>

            <div className="space-y-3">
              {recentActivities.length === 0 ? (
                <p className="text-xs text-gray-400">No recent activity recorded.</p>
              ) : (
                recentActivities.map((act) => (
                  <div key={act.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 text-xs space-y-1">
                    <div className="flex justify-between text-gray-400">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{act.user?.name || 'System'}</span>
                      <span className="text-[10px]">{new Date(act.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{act.details}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
