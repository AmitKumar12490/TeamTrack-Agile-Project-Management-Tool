import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import { Task, TaskStatusType } from '../../types/task.types';

interface KanbanColumnProps {
  id: TaskStatusType;
  title: string;
  tasks: Task[];
  columnColor: string;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, title, tasks, columnColor }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[280px] bg-gray-100/70 dark:bg-gray-900/60 border rounded-2xl p-4 flex flex-col transition-colors ${
        isOver ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/20' : 'border-gray-200 dark:border-gray-800'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${columnColor}`} />
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        <span className="w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-bold text-xs flex items-center justify-center text-gray-600 dark:text-gray-300">
          {tasks.length}
        </span>
      </div>

      {/* Task Cards Container */}
      <div className="flex-1 space-y-3 min-h-[350px]">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="h-full min-h-[150px] flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-400">
            Drop task here
          </div>
        )}
      </div>
    </div>
  );
};
