import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../../types/task.types';
import { Calendar, Clock, MessageSquare, GripVertical } from 'lucide-react';
import { Link } from 'react-router-dom';

interface KanbanCardProps {
  task: Task;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ task }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  const priorityColor =
    task.priority === 'HIGH'
      ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
      : task.priority === 'MEDIUM'
      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
      : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all group select-none cursor-default"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${priorityColor}`}>
          {task.priority}
        </span>

        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-gray-300 hover:text-gray-600 dark:hover:text-gray-200 cursor-grab active:cursor-grabbing rounded"
          title="Drag task"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </div>

      <Link
        to={`/tasks/${task.id}`}
        className="font-bold text-sm text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 line-clamp-2 transition-colors block"
      >
        {task.title}
      </Link>

      {task.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Card Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-[11px] text-gray-400">
        <div className="flex items-center gap-1.5">
          {task.dueDate && (
            <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-bold' : ''}`}>
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>

        {task.comments && task.comments.length > 0 && (
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {task.comments.length}
          </span>
        )}
      </div>
    </div>
  );
};
