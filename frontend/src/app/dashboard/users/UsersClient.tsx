'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { icons } from '@/lib/icons';
import { formatDate } from '@/lib/utils';
import { User, PaginationQuery, Task } from '@/types';

interface UsersClientProps {
  initialUsers: User[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  initialFilters: PaginationQuery;
}

export default function UsersClient({
  initialUsers,
  initialPagination,
  initialFilters,
}: UsersClientProps) {
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

  const getTaskCounts = (tasks: Task[]) => {
    return {
      total: tasks.length,
      completed: tasks.filter(task => task.status === 'completed').length,
      pending: tasks.filter(task => task.status === 'pending').length,
      inProgress: tasks.filter(task => task.status === 'in-progress').length,
    };
  };
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState(initialFilters);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  // Use React Query with initial data for client-side updates
  const { data, isLoading, error } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => apiClient.getUsers(filters),
    initialData: {
      data: {
        data: initialUsers,
        pagination: initialPagination
      }
    } as unknown as ReturnType<typeof apiClient.getUsers>,
  });
  const users = Array.isArray(data?.data?.data) ? data.data.data : [];
  const pagination = data?.data?.pagination;

  const toggleUserExpansion = (userId: string) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);

    // Update URL
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`/dashboard/users?${params.toString()}`);
  };

  if (isLoading) {
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
          <p className="text-error-600">Failed to load users. Please try again.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Users List */}
      <Card>
        {users.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon icon={icons.user} size="xl" className="text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No users found</h3>
            <p className="text-neutral-600">No team members have been added yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user: User) => {
              const isExpanded = expandedUsers.has(user._id);
              const taskCounts = getTaskCounts(user.tasks || []);
              const hasTasks = user.tasks && user.tasks.length > 0;

              return (
                <div key={user._id} className="border border-neutral-200 rounded-lg">
                  {/* User Row */}
                  <div
                    className="p-4 hover:bg-neutral-50 transition-colors cursor-pointer"
                    onClick={() => toggleUserExpansion(user._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary-700">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium text-neutral-900">{user.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-neutral-600">
                            <div className="flex items-center">
                              <Icon icon={icons.envelope} size="sm" className="mr-1" />
                              <span>{user.email}</span>
                            </div>
                            <div className="flex items-center">
                              <Icon icon={icons.calendar} size="sm" className="mr-1" />
                              <span>Joined {formatDate(user.createdAt)}</span>
                            </div>
                            <Badge
                              variant={user.role === 'admin' ? 'info' : 'default'}
                              size="sm"
                            >
                              {user.role}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {/* Task Summary */}
                        <div className="text-right">
                          <div className="text-sm text-neutral-600">Tasks</div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-semibold text-neutral-900">
                              {taskCounts.total}
                            </span>
                            {hasTasks && (
                              <div className="flex items-center space-x-1 text-xs">
                                <span className="text-success-600">{taskCounts.completed}</span>
                                <span className="text-neutral-400">/</span>
                                <span className="text-warning-600">{taskCounts.inProgress}</span>
                                <span className="text-neutral-400">/</span>
                                <span className="text-neutral-600">{taskCounts.pending}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Expand/Collapse Icon */}
                        <div className="text-neutral-400">
                          <Icon icon={isExpanded ? icons.chevronDown : icons.chevronRight} size="md" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Tasks */}
                  {isExpanded && (
                    <div className="border-t border-neutral-200 bg-neutral-50">
                      <div className="p-4">
                        <h4 className="text-sm font-medium text-neutral-700 mb-3 flex items-center">
                          <Icon icon={icons.checkSquare} size="sm" className="mr-2" />
                          Assigned Tasks ({taskCounts.total})
                        </h4>

                        {!hasTasks ? (
                          <div className="text-center py-6">
                            <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Icon icon={icons.checkSquare} size="lg" className="text-neutral-400" />
                            </div>
                            <p className="text-neutral-500 text-sm">No tasks assigned</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {user.tasks?.map((task: Task) => (
                              <div
                                key={task._id}
                                className="flex items-center justify-between p-3 bg-white rounded-lg border border-neutral-200"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-1">
                                    <h5 className="font-medium text-neutral-900">{task.title}</h5>
                                    <Badge
                                      variant={getStatusBadgeVariant(task.status)}
                                      size="sm"
                                    >
                                      {task.status}
                                    </Badge>
                                    <Badge
                                      variant={getPriorityBadgeVariant(task.priority)}
                                      size="sm"
                                    >
                                      {task.priority}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-neutral-600 mb-2">{task.description}</p>
                                  <div className="flex items-center space-x-4 text-xs text-neutral-500">
                                    <div className="flex items-center">
                                      <Icon icon={icons.clock} size="xs" className="mr-1" />
                                      <span>Created {formatDate(task.createdAt)}</span>
                                    </div>
                                    {task.dueDate && (
                                      <div className="flex items-center">
                                        <Icon icon={icons.calendar} size="xs" className="mr-1" />
                                        <span>Due {formatDate(task.dueDate)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
