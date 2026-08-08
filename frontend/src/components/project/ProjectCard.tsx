import React from 'react';
import { Project } from '../../types/project.types';
import { FolderKanban, Layers, CheckCircle2, Clock, Trash2, Edit3 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete }) => {
  // Compute total stories and tasks
  const storiesCount = project._count?.userStories ?? project.userStories?.length ?? 0;
  
  let totalTasks = 0;
  let completedTasks = 0;
  
  if (project.userStories) {
    project.userStories.forEach((story) => {
      if (story.tasks) {
        totalTasks += story.tasks.length;
        completedTasks += story.tasks.filter((t) => t.status === 'DONE').length;
      }
    });
  }

  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <Link
                to={`/projects/${project.id}`}
                className="font-bold text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 text-lg transition-colors line-clamp-1"
              >
                {project.name}
              </Link>
              <span className="text-xs text-gray-400">
                Created by {project.owner?.name || 'User'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(project)}
              className="p-1.5 text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Edit Project"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(project.id)}
              className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Delete Project"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
          {project.description || 'No description provided.'}
        </p>
      </div>

      <div>
        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span className="font-medium">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-brand-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Footer Metrics */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-brand-500" />
            <span>{storiesCount} Stories</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{completedTasks}/{totalTasks} Tasks</span>
          </div>
        </div>
      </div>
    </div>
  );
};
