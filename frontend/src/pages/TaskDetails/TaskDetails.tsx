import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../../services/task.service';
import { commentService } from '../../services/comment.service';
import { useAuth } from '../../context/AuthContext';
import { TaskStatusType } from '../../types/task.types';
import {
  CheckSquare,
  FolderKanban,
  Layers,
  Calendar,
  Clock,
  MessageSquare,
  Send,
  Trash2,
  AlertCircle,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

export default function TaskDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');

  const { data: task, isLoading, error } = useQuery({
    queryKey: ['task', id],
    queryFn: () => taskService.getTaskById(id!),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: (newStatus: TaskStatusType) => taskService.updateTaskStatus(id!, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: (message: string) => commentService.addComment(id!, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      setCommentText('');
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => commentService.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Task Not Found</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">
          The task you requested could not be located.
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

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      addCommentMutation.mutate(commentText.trim());
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
        <Link to="/projects" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-1">
          <FolderKanban className="w-4 h-4" /> Projects
        </Link>
        <span>/</span>
        {task.userStory?.project && (
          <>
            <Link
              to={`/projects/${task.userStory.project.id}`}
              className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              {task.userStory.project.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-900 dark:text-white font-semibold truncate">{task.title}</span>
      </div>

      {/* Task Details Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="uppercase tracking-wider font-bold text-xs px-2 py-0.5 rounded bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300">
                {task.priority} Priority
              </span>
              {isOverdue && (
                <span className="uppercase tracking-wider font-bold text-xs px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                  OVERDUE
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{task.title}</h1>
          </div>

          {/* Status Quick Changer */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-gray-500 uppercase">Status:</span>
            <select
              value={task.status}
              onChange={(e) => statusMutation.mutate(e.target.value as TaskStatusType)}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold dark:text-white focus:ring-2 focus:ring-brand-500"
            >
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="DONE">DONE</option>
            </select>
          </div>
        </div>

        {/* Task Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl border border-gray-100 dark:border-gray-700/60">
          <div>
            <span className="text-gray-400 block mb-0.5">User Story</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200">{task.userStory?.title}</span>
          </div>
          <div>
            <span className="text-gray-400 block mb-0.5">Due Date</span>
            <span className={`font-semibold flex items-center gap-1 ${isOverdue ? 'text-red-500' : 'text-gray-800 dark:text-gray-200'}`}>
              <Calendar className="w-3.5 h-3.5" />
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date set'}
            </span>
          </div>
          <div>
            <span className="text-gray-400 block mb-0.5">Created At</span>
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {new Date(task.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Task Description */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
          <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-gray-50/50 dark:bg-gray-900/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
            {task.description || 'No detailed description provided.'}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand-500" />
          Task Comments ({task.comments?.length || 0})
        </h2>

        {/* Add Comment Form */}
        <form onSubmit={handleCommentSubmit} className="flex gap-3">
          <input
            type="text"
            placeholder="Add a comment or update note..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 dark:text-white"
          />
          <button
            type="submit"
            disabled={addCommentMutation.isPending || !commentText.trim()}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> Comment
          </button>
        </form>

        {/* Comments Stream */}
        <div className="space-y-4 pt-2">
          {!task.comments || task.comments.length === 0 ? (
            <p className="text-center py-6 text-xs text-gray-400">No comments posted yet.</p>
          ) : (
            task.comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700/60 space-y-1 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-gray-900 dark:text-white">
                    {comment.user?.name || 'Team Member'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                    {user?.id === comment.userId && (
                      <button
                        onClick={() => deleteCommentMutation.mutate(comment.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{comment.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
