import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '../../services/project.service';
import { storyService } from '../../services/story.service';
import { taskService } from '../../services/task.service';
import { StoryModal } from '../../components/story/StoryModal';
import { TaskModal } from '../../components/task/TaskModal';
import { UserStory } from '../../types/story.types';
import { Task } from '../../types/task.types';
import {
  FolderKanban,
  Layers,
  CheckCircle2,
  Plus,
  ArrowLeft,
  Loader2,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [targetStoryId, setTargetStoryId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getProjectById(id!),
    enabled: !!id,
  });

  // Story Mutations
  const createStoryMutation = useMutation({
    mutationFn: (data: { title: string; description?: string }) =>
      storyService.createStory({ ...data, projectId: id! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setIsStoryModalOpen(false);
    },
  });

  const updateStoryMutation = useMutation({
    mutationFn: ({ storyId, data }: { storyId: string; data: { title: string; description?: string } }) =>
      storyService.updateStory(storyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setIsStoryModalOpen(false);
      setSelectedStory(null);
    },
  });

  const deleteStoryMutation = useMutation({
    mutationFn: (storyId: string) => storyService.deleteStory(storyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
  });

  // Task Mutations
  const createTaskMutation = useMutation({
    mutationFn: (data: any) => taskService.createTask({ ...data, userStoryId: targetStoryId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setIsTaskModalOpen(false);
      setTargetStoryId(null);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: any }) =>
      taskService.updateTask(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setIsTaskModalOpen(false);
      setSelectedTask(null);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Project Not Found</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">
          The project you requested could not be located or may have been deleted.
        </p>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link to="/projects" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-1">
          <FolderKanban className="w-4 h-4" /> Projects
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-semibold truncate">{project.name}</span>
      </div>

      {/* Project Header Banner */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">{project.name}</h1>
          </div>
          {project.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 max-w-2xl">{project.description}</p>
          )}
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
            <span>Owner: <strong className="text-gray-700 dark:text-gray-200">{project.owner?.name}</strong></span>
            <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedStory(null);
            setIsStoryModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl shadow transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Add User Story
        </button>
      </div>

      {/* User Stories Hierarchy List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-500" />
            User Stories ({project.userStories?.length || 0})
          </h2>
        </div>

        {!project.userStories || project.userStories.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-8">
            <Layers className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">No User Stories Yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
              Break down this project into manageable user stories.
            </p>
            <button
              onClick={() => {
                setSelectedStory(null);
                setIsStoryModalOpen(true);
              }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg shadow hover:bg-brand-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add First User Story
            </button>
          </div>
        ) : (
          project.userStories.map((story) => (
            <div
              key={story.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
            >
              {/* Story Header */}
              <div className="p-5 bg-gray-50/50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">{story.title}</h3>
                  {story.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{story.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setTargetStoryId(story.id);
                      setSelectedTask(null);
                      setIsTaskModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900 text-brand-700 dark:text-brand-300 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Task
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStory(story);
                      setIsStoryModalOpen(true);
                    }}
                    className="p-1.5 text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Edit Story"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this user story and all its tasks?')) {
                        deleteStoryMutation.mutate(story.id);
                      }
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="Delete Story"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tasks List inside User Story */}
              <div className="p-4 space-y-2">
                {!story.tasks || story.tasks.length === 0 ? (
                  <div className="text-center py-4 text-xs text-gray-400">
                    No tasks assigned to this story. Click "Add Task" to create one.
                  </div>
                ) : (
                  story.tasks.map((task) => {
                    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

                    return (
                      <div
                        key={task.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200/60 dark:border-gray-700/60 hover:border-brand-300 dark:hover:border-brand-700 transition-all gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                              task.status === 'DONE'
                                ? 'bg-emerald-500'
                                : task.status === 'IN_PROGRESS'
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          <div>
                            <Link
                              to={`/tasks/${task.id}`}
                              className="font-medium text-sm text-gray-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                            >
                              {task.title}
                            </Link>
                            <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                              <span className="uppercase tracking-wider font-semibold text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                {task.priority} Priority
                              </span>
                              {task.dueDate && (
                                <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-bold' : ''}`}>
                                  <Calendar className="w-3 h-3" />
                                  {new Date(task.dueDate).toLocaleDateString()}
                                  {isOverdue && ' (OVERDUE)'}
                                </span>
                              )}
                              {task.comments && task.comments.length > 0 && (
                                <span className="flex items-center gap-1 text-gray-400">
                                  <MessageSquare className="w-3 h-3" />
                                  {task.comments.length}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                            task.status === 'DONE'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : task.status === 'IN_PROGRESS'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                          }`}>
                            {task.status.replace('_', ' ')}
                          </span>

                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setTargetStoryId(story.id);
                              setIsTaskModalOpen(true);
                            }}
                            className="p-1 text-gray-400 hover:text-brand-600 dark:hover:text-brand-400"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this task?')) {
                                deleteTaskMutation.mutate(task.id);
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Story Modal */}
      <StoryModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
        onSubmit={async (data) => {
          if (selectedStory) {
            await updateStoryMutation.mutateAsync({ storyId: selectedStory.id, data });
          } else {
            await createStoryMutation.mutateAsync(data);
          }
        }}
        story={selectedStory}
        isSubmitting={createStoryMutation.isPending || updateStoryMutation.isPending}
      />

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={async (data) => {
          if (selectedTask) {
            await updateTaskMutation.mutateAsync({ taskId: selectedTask.id, data });
          } else {
            await createTaskMutation.mutateAsync(data);
          }
        }}
        task={selectedTask}
        isSubmitting={createTaskMutation.isPending || updateTaskMutation.isPending}
      />
    </div>
  );
}
