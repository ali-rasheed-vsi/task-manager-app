import { getUsers } from '@/lib/server-api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import UsersClient from './UsersClient';


interface UsersPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const resolvedSearchParams = await searchParams;
  const filters = {
    page: parseInt(resolvedSearchParams.page || '1'),
    limit: 10,
  };

  const data = await getUsers(filters);
  const users = data.data || [];
  const pagination = data.pagination;

  return (
    <DashboardLayout title="Users" subtitle="Manage your team members and their tasks">
      <UsersClient 
        initialUsers={users}
        initialPagination={pagination}
        initialFilters={filters}
      />
    </DashboardLayout>
  );
}
