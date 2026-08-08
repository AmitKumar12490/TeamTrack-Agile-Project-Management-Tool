import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../../services/task.service';
import { projectService } from '../../services/project.service';
import { KanbanColumn } from '../../components/kanban/KanbanColumn';
import { KanbanCard } from '../../components/kanban/KanbanCard';
import { Task, TaskStatusType } from '../../types/task.types';
import { KanbanSquare, Filter, Loader2, AlertCircle } from 'lucide-react';

export default function Kanban() {
  const queryClient = useQueryClient();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Local state for optimistic drag-and-drop updates
  const [tasksState, setTasksState] = useState<Task[]>([]);

  // Fetch Projects for filter
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectService.getProjects(),
  });

  // Fetch Tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['kanbanTasks', selectedProjectId, priorityFilter],
    queryFn: () =>
      taskService.getTasks({
        priority: priorityFilter || undefined,
      }),
  });

  useEffect(() => {
    if (tasks) {
      setTasksState(tasks);
    }
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const statusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatusType }) =>
      taskService.updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanbanTasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardMetrics'] });
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
    onError: (err, variables) => {
      console.error('Failed to persist Kanban status change:', err);
      // Revert optimistic state back from query cache
      if (tasks) {
        setTasksState(tasks);
      }
      alert('Failed to update task status on backend. Reverting changes.');
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasksState.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    let targetStatus: TaskStatusType | null = null;

    // Check if over target is a column id directly
    if (over.id === 'TODO' || over.id === 'IN_PROGRESS' || over.id === 'DONE') {
      targetStatus = over.id as TaskStatusType;
    } else {
      // Over target is another task card; find its parent status column
      const overTask = tasksState.find((t) => t.id === over.id);
      if (overTask) {
        targetStatus = overTask.status;
      }
    }

    if (!targetStatus) return;

    const currentTask = tasksState.find((t) => t.id === taskId);
    if (!currentTask || currentTask.status === targetStatus) return;

    // 1. Optimistic UI update
    setTasksState((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: targetStatus! } : t))
    );

    // 2. Persist to backend
    statusMutation.mutate({ taskId, status: targetStatus });
  };

  // Filter tasks per status column
  const todoTasks = tasksState.filter((t) => t.status === 'TODO');
  const inProgressTasks = tasksState.filter((t) => t.status === 'IN_PROGRESS');
  const doneTasks = tasksState.filter((t) => t.status === 'DONE');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <KanbanSquare className="w-7 h-7 text-brand-600 dark:text-brand-400" />
            Kanban Board
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Drag and drop tasks across workflow columns to update status
          </p>
        </div>

        {/* Priority Filter Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs shadow-sm">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="font-semibold text-gray-600 dark:text-gray-300">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent font-bold dark:text-white focus:outline-none"
            >
              <option value="">All Priorities</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </div>
      </div>

      {/* Board Layout */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-4">
            <KanbanColumn
              id="TODO"
              title="TODO"
              tasks={todoTasks}
              columnColor="bg-slate-400"
            />
            <KanbanColumn
              id="IN_PROGRESS"
              title="IN PROGRESS"
              tasks={inProgressTasks}
              columnColor="bg-amber-500"
            />
            <KanbanColumn
              id="DONE"
              title="DONE"
              tasks={doneTasks}
              columnColor="bg-emerald-500"
            />
          </div>

          <DragOverlay>
            {activeTask ? <KanbanCard task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
