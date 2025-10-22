'use client';

import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Icon from '@/components/ui/Icon';
import { icons } from '@/lib/icons';
import { TaskStatus, TaskPriority } from '@/types';
import { TASK_STATUS_OPTIONS, TASK_PRIORITY_OPTIONS } from '@/lib/constants';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

const TaskSchema = Yup.object({
  title: Yup.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title cannot exceed 100 characters')
    .required('Title is required'),
  description: Yup.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description cannot exceed 500 characters')
    .required('Description is required'),
  status: Yup.string()
    .oneOf(['pending', 'in-progress', 'completed'] as TaskStatus[], 'Invalid status')
    .required('Status is required'),
  priority: Yup.string()
    .oneOf(['low', 'medium', 'high'] as TaskPriority[], 'Invalid priority')
    .required('Priority is required'),
  assignedTo: Yup.string()
    .required('Assigned user is required'),
  dueDate: Yup.date()
    .min(new Date(), 'Due date must be in the future')
    .optional(),
});

const AddTaskPage: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch users for assignment
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.getUsers({ limit: 100 }),
  });

  const users = Array.isArray(usersData?.data?.data) ? usersData.data.data : [];

  // Debug logging
  console.log('AddTaskPage - usersData:', usersData);
  console.log('AddTaskPage - users array:', users);
  console.log('AddTaskPage - isArray(users):', Array.isArray(users));

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: apiClient.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      toast.success('Task created successfully!');
      router.push('/dashboard/tasks');
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const message = error.response?.data?.message || 'Failed to create task';
      toast.error(message);
    },
  });

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      status: 'pending' as TaskStatus,
      priority: 'medium' as TaskPriority,
      assignedTo: '',
      dueDate: '',
    },
    validationSchema: TaskSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await createTaskMutation.mutateAsync({
          ...values,
          dueDate: values.dueDate || undefined,
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const statusOptions = TASK_STATUS_OPTIONS;
  const priorityOptions = TASK_PRIORITY_OPTIONS;

  const userOptions = users.map(user => ({
    value: user._id,
    label: user.name,
  }));

  if (usersLoading) {
    return (
      <DashboardLayout title="Add Task" subtitle="Create a new task for your team">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Add Task" subtitle="Create a new task for your team">
      <div className="max-w-2xl mx-auto">
        <Card>
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Task Title"
                  name="title"
                  placeholder="Enter task title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.title && formik.errors.title ? formik.errors.title : undefined}
                  leftIcon={<Icon icon={icons.fileText} size="sm" />}
                />
              </div>

              <div className="md:col-span-2">
                <Textarea
                  label="Description"
                  name="description"
                  placeholder="Enter task description"
                  rows={4}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.description && formik.errors.description ? formik.errors.description : undefined}
                />
              </div>

              <Select
                label="Status"
                name="status"
                options={statusOptions}
                value={formik.values.status}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.status && formik.errors.status ? formik.errors.status : undefined}
              />

              <Select
                label="Priority"
                name="priority"
                options={priorityOptions}
                value={formik.values.priority}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.priority && formik.errors.priority ? formik.errors.priority : undefined}
                // leftIcon={<Icon icon={icons.flag} size="sm" />}
              />

              <Select
                label="Assign To"
                name="assignedTo"
                options={userOptions}
                placeholder="Select a user"
                value={formik.values.assignedTo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.assignedTo && formik.errors.assignedTo ? formik.errors.assignedTo : undefined}
                // leftIcon={<Icon icon={icons.user} size="sm" />}
              />

              <Input
                label="Due Date"
                type="datetime-local"
                name="dueDate"
                value={formik.values.dueDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.dueDate && formik.errors.dueDate ? formik.errors.dueDate : undefined}
                leftIcon={<Icon icon={icons.calendar} size="sm" />}
                helperText="Optional - when should this task be completed?"
              />
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-neutral-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={formik.isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="text-black"
                isLoading={formik.isSubmitting || createTaskMutation.isPending}
                disabled={formik.isSubmitting || createTaskMutation.isPending}
              >
                Create Task
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AddTaskPage;
