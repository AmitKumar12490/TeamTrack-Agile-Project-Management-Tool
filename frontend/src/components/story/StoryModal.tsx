import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { storySchema, StoryFormData } from '../../schemas/story.schema';
import { UserStory } from '../../types/story.types';
import { X, Layers, Edit3 } from 'lucide-react';

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StoryFormData) => Promise<void>;
  story?: UserStory | null;
  isSubmitting: boolean;
}

export const StoryModal: React.FC<StoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  story,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StoryFormData>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  useEffect(() => {
    if (story) {
      reset({
        title: story.title,
        description: story.description || '',
      });
    } else {
      reset({
        title: '',
        description: '',
      });
    }
  }, [story, reset, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
            {story ? <Edit3 className="w-5 h-5 text-brand-500" /> : <Layers className="w-5 h-5 text-brand-500" />}
            <span>{story ? 'Edit User Story' : 'Create New User Story'}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              User Story Title *
            </label>
            <input
              type="text"
              placeholder="e.g. As a user, I want to reset my forgotten password"
              {...register('title')}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 dark:text-white"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Acceptance Criteria / Description
            </label>
            <textarea
              rows={4}
              placeholder="Detail user requirements, user persona, and acceptance test rules..."
              {...register('description')}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 dark:text-white"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.description.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : story ? 'Save Changes' : 'Create User Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
