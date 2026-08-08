import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { projectService } from '../../services/project.service';
import { ProjectCard } from '../../components/project/ProjectCard';
import { ProjectModal } from '../../components/project/ProjectModal';
import { Project, CreateProjectPayload } from '../../types/project.types';
import { ProjectFormData } from '../../schemas/project.schema';
import { FolderKanban, Plus, Search, Loader2 } from 'lucide-react';

export default function Projects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchFilter = searchParams.get('search') || '';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const queryClient = useQueryClient();

  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['projects', searchFilter],
    queryFn: () => projectService.getProjects(searchFilter || undefined),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateProjectPayload) => projectService.createProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateProjectPayload }) =>
      projectService.updateProject(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsModalOpen(false);
      setSelectedProject(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const handleOpenCreateModal = () => {
    setSelectedProject(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm('Are you sure you want to delete this project? All associated user stories and tasks will be permanently deleted.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleModalSubmit = async (data: ProjectFormData) => {
    if (selectedProject) {
      await updateMutation.mutateAsync({ id: selectedProject.id, payload: data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <FolderKanban className="w-7 h-7 text-brand-600 dark:text-brand-400" />
            Projects
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Organize and manage your team's software deliverables
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm rounded-xl shadow transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Filter projects by title or keyword..."
          value={searchFilter}
          onChange={(e) => setSearchParams(e.target.value ? { search: e.target.value } : {})}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
        />
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-8">
          <FolderKanban className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">No projects found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            {searchFilter ? 'No projects match your search query.' : 'Get started by creating your first project container.'}
          </p>
          {!searchFilter && (
            <button
              onClick={handleOpenCreateModal}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg shadow hover:bg-brand-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create First Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )}

      {/* Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        project={selectedProject}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
