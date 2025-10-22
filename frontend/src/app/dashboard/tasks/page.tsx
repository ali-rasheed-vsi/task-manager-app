import { getTasks } from '@/lib/server-api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TasksClient from './TasksClient';

interface TasksPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const resolvedSearchParams = await searchParams;
  const filters = {
    page: parseInt(resolvedSearchParams.page || '1'),
    limit: 10,
  };

  const data = await getTasks(filters);
  const tasks = data.data || [];
  const pagination = data.pagination;

  return (
    <DashboardLayout
      title="Tasks"
      subtitle="Manage your team's tasks and assignments"
    >
      <TasksClient 
        initialTasks={tasks}
        initialPagination={pagination}
        initialFilters={filters}
      />
    </DashboardLayout>
  );
}
