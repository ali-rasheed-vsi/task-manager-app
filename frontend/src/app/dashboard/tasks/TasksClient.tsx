'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { icons } from '@/lib/icons';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import VirtualList from 'rc-virtual-list';
import { Task, PaginationQuery } from '@/types';

interface TasksClientProps {
  initialTasks: Task[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  initialFilters: PaginationQuery;
}

export default function TasksClient({
  initialTasks,
  initialPagination,
  initialFilters,
}: TasksClientProps) {
  // Utility functions moved inside the component
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'info';
      case 'pending': return 'default';
      default: return 'default';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState(initialFilters);

  // Use React Query with initial data for client-side updates
  const { data, isLoading, error } = useQuery({
    queryKey: ['tasks', filters.page],
    queryFn: () => apiClient.getTasks(filters),
    initialData: {
      data: {
        data: initialTasks,
        pagination: initialPagination
      }
    } as unknown as ReturnType<typeof apiClient.getTasks>,
  });

  const tasks = Array.isArray(data?.data?.data) ? data.data.data : [];
  const pagination = data?.data?.pagination;


  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => apiClient.deleteTask(taskId),
    onSuccess: () => {
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      toast.success('Task deleted successfully!');
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data?.message || 'Failed to delete task';
      toast.error(message);
    },
  });

  const handleDeleteTask = (taskId: string, taskTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${taskTitle}"? This action cannot be undone.`)) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);

    // Update URL
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`/dashboard/tasks?${params.toString()}`);
  };


  if (isLoading || deleteTaskMutation.isPending) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-error-600">Failed to load tasks. Please try again.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tasks List */}
      <div className="flex items-center justify-end">
        <Link href="/dashboard/tasks/add" className="text-black border border-primary-300 rounded-lg px-4 py-2">
          Add Task
        </Link>
      </div>

      <Card>
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon={icons.clock} size="xl" className="text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No tasks found</h3>
            <p className="text-neutral-600 mb-4">
              Get started by creating your first task.
            </p>
            <Link href="/dashboard/tasks/add">
              <Button leftIcon={<Icon icon={icons.plus} size="sm" />}>
                Create Task
              </Button>
            </Link>
          </div>
        ) : Array.isArray(tasks) && tasks.length > 0 ? (
          <div style={{ height: 600 }}>
            <VirtualList 
              data={tasks} 
              height={600} 
              itemHeight={140} 
              itemKey="_id"
            >
              {(task) => (
                <div className="px-4 py-2" key={task._id}>
                  <div className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-neutral-900">{task.title}</h3>
                          <Badge variant={getStatusBadgeVariant(task.status)} size="sm">
                            {task.status}
                          </Badge>
                          <Badge variant={getPriorityBadgeVariant(task.priority)} size="sm">
                            {task.priority}
                          </Badge>
                        </div>

                        <p className="text-neutral-600 mb-3">{task.description}</p>

                        <div className="flex items-center space-x-6 text-sm text-neutral-500">
                          <div className="flex items-center">
                            <Icon icon={icons.user} size="sm" className="mr-1" />
                            <span>
                              Assigned to: {typeof task.assignedTo === 'object' && task.assignedTo?.name ? task.assignedTo.name : 'Unassigned'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Icon icon={icons.clock} size="sm" className="mr-1" />
                            <span>Created: {formatDate(task.createdAt)}</span>
                          </div>
                          {task.dueDate && (
                            <div className="flex items-center">
                              <Icon icon={icons.calendar} size="sm" className="mr-1" />
                              <span>Due: {formatDate(task.dueDate)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Link href={`/dashboard/tasks/${task._id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                        <Link href={`/dashboard/tasks/edit/${task._id}`}>
                          <Button variant="ghost" size="sm" leftIcon={<Icon icon={icons.edit} size="sm" />}>
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Icon icon={icons.trash} size="sm" />}
                          onClick={() => handleDeleteTask(task._id, task.title)}
                          isLoading={deleteTaskMutation.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </VirtualList>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon={icons.clock} size="xl" className="text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No tasks found</h3>
            <p className="text-neutral-600 mb-4">
              Get started by creating your first task.
            </p>
            <Link href="/dashboard/tasks/add">
              <Button leftIcon={<Icon icon={icons.plus} size="sm" />}>
                Create Task
              </Button>
            </Link>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-200">
            <div className="text-sm text-neutral-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={pagination.page === page ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
