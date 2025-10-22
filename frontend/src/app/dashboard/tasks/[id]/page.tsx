'use client';

import { use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Icon from '@/components/ui/Icon';
import { icons } from '@/lib/icons';
import { formatDate, getDueDateStatus } from '@/lib/utils';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

interface TaskDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const TaskDetailPage: React.FC<TaskDetailPageProps> = ({ params }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Unwrap params Promise
  const resolvedParams = use(params);
  const taskId = resolvedParams.id;

  // Fetch task data
  const { data: taskData, isLoading, error } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => apiClient.getTaskById(taskId),
    enabled: !!taskId,
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: () => apiClient.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      toast.success('Task deleted successfully!');
      router.push('/dashboard/tasks');
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data?.message || 'Failed to delete task';
      toast.error(message);
    },
  });

  const task = taskData?.data;

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      deleteTaskMutation.mutate();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Icon icon={icons.checkCircle} size="md" className="text-success-600" />;
      case 'in-progress':
        return <Icon icon={icons.exclamationTriangle} size="md" className="text-warning-600" />;
      case 'pending':
        return <Icon icon={icons.circle} size="md" className="text-neutral-400" />;
      default:
        return <Icon icon={icons.circle} size="md" className="text-neutral-400" />;
    }
  };

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

  if (isLoading) {
    return (
      <DashboardLayout title="Task Details" subtitle="View task information">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !task) {
    return (
      <DashboardLayout title="Task Details" subtitle="View task information">
        <Card>
          <div className="text-center py-8">
            <p className="text-error-600 mb-4">Task not found or failed to load.</p>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/tasks')}
              leftIcon={<Icon icon={icons.arrowLeft} size="sm" />}
            >
              Back to Tasks
            </Button>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  const dueDateStatus = task.dueDate ? getDueDateStatus(task.dueDate) : null;

  return (
    <DashboardLayout 
      title="Task Details" 
      subtitle="View and manage task information"
      action={
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
            leftIcon={<Icon icon={icons.arrowLeft} size="sm" />}
          >
            Back
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/tasks/edit/${task._id}`)}
            leftIcon={<Icon icon={icons.edit} size="sm" />}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            leftIcon={<Icon icon={icons.trash} size="sm" />}
            isLoading={deleteTaskMutation.isPending}
          >
            Delete
          </Button>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Task Header */}
        <Card>
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                {getStatusIcon(task.status)}
                <h1 className="text-3xl font-bold text-neutral-900">{task.title}</h1>
                <Badge variant={getStatusBadgeVariant(task.status)} size="lg">
                  {task.status}
                </Badge>
                <Badge variant={getPriorityBadgeVariant(task.priority)} size="lg">
                  {task.priority}
                </Badge>
              </div>
              
              <p className="text-lg text-neutral-600 leading-relaxed">{task.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-neutral-200">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Icon icon={icons.user} size="md" className="text-neutral-400" />
                <div>
                  <p className="text-sm text-neutral-600">Assigned to</p>
                  <p className="font-medium text-neutral-900">{task.assignedTo?.name || 'Unassigned'}</p>
                  <p className="text-sm text-neutral-500">{task.assignedTo?.email || ''}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Icon icon={icons.user} size="md" className="text-neutral-400" />
                <div>
                  <p className="text-sm text-neutral-600">Created by</p>
                  <p className="font-medium text-neutral-900">{task.createdBy?.name || 'Unknown'}</p>
                  <p className="text-sm text-neutral-500">{task.createdBy?.email || ''}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Icon icon={icons.clock} size="md" className="text-neutral-400" />
                <div>
                  <p className="text-sm text-neutral-600">Created</p>
                  <p className="font-medium text-neutral-900">{formatDate(task.createdAt)}</p>
                  <p className="text-sm text-neutral-500">{formatDate(task.createdAt, 'HH:mm')}</p>
                </div>
              </div>

              {task.dueDate && (
                <div className="flex items-center space-x-3">
                  <Icon icon={icons.calendar} size="md" className="text-neutral-400" />
                  <div>
                    <p className="text-sm text-neutral-600">Due date</p>
                    <p className="font-medium text-neutral-900">{formatDate(task.dueDate)}</p>
                    <p className="text-sm text-neutral-500">{formatDate(task.dueDate, 'HH:mm')}</p>
                    {dueDateStatus && (
                      <Badge 
                        variant={dueDateStatus.status === 'overdue' ? 'error' : 'info'}
                        size="sm"
                        className="mt-1"
                      >
                        {dueDateStatus.label}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Task Activity */}
        <Card>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Task Activity</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-neutral-50 rounded-lg">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <Icon icon={icons.user} size="sm" className="text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-neutral-900">
                  <span className="font-medium">{task.createdBy.name}</span> created this task
                </p>
                <p className="text-xs text-neutral-500">{formatDate(task.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-neutral-50 rounded-lg">
              <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center">
                <Icon icon={icons.user} size="sm" className="text-success-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-neutral-900">
                  Task assigned to <span className="font-medium">{task.assignedTo.name}</span>
                </p>
                <p className="text-xs text-neutral-500">{formatDate(task.createdAt)}</p>
              </div>
            </div>

            {task.updatedAt !== task.createdAt && (
              <div className="flex items-start space-x-3 p-3 bg-neutral-50 rounded-lg">
                <div className="w-8 h-8 bg-warning-100 rounded-full flex items-center justify-center">
                  <Icon icon={icons.edit} size="sm" className="text-warning-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-900">
                    Task was last updated
                  </p>
                  <p className="text-xs text-neutral-500">{formatDate(task.updatedAt)}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TaskDetailPage;
