import { TaskStatus, TaskPriority } from '@/types';

export const TASK_STATUS_OPTIONS = [
  { value: 'pending' as TaskStatus, label: 'Pending' },
  { value: 'in-progress' as TaskStatus, label: 'In Progress' },
  { value: 'completed' as TaskStatus, label: 'Completed' },
];

export const TASK_PRIORITY_OPTIONS = [
  { value: 'low' as TaskPriority, label: 'Low' },
  { value: 'medium' as TaskPriority, label: 'Medium' },
  { value: 'high' as TaskPriority, label: 'High' },
];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  completed: 'Completed',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};
