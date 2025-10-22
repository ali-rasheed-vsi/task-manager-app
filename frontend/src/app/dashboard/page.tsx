import { getTasks, getUsers } from '@/lib/server-api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Icon from '@/components/ui/Icon';
import { icons } from '@/lib/icons';
import Link from 'next/link';

export default async function DashboardPage() {
  // Fetch data on the server
  const [tasksData, usersData] = await Promise.all([
    getTasks({ limit: 5 }),
    getUsers({ limit: 3 })
  ]);

  const tasks = tasksData.data || [];
  const users = usersData.data || [];

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle="Welcome back! Here's what's happening with your tasks."
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="animate-fade-in-up p-0">
            <Link href="/dashboard/tasks" className="p-4 flex">
              <div className="flex items-center">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Icon icon={icons.checkSquare} className="text-primary-600" size="lg" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600">Tasks</p>
                  <p className="text-2xl font-bold text-neutral-900">{tasks.length}</p>
                </div>
              </div>
            </Link>
          </Card>

          <Card className="animate-fade-in-up p-0" style={{ animationDelay: '0.3s' }}>
            <Link href="/dashboard/users" className="p-4 flex">
              <div className="flex items-center">
                <div className="p-3 bg-secondary-100 rounded-lg">
                  <Icon icon={icons.users} className="text-secondary-600" size="lg" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600">Users</p>
                  <p className="text-2xl font-bold text-neutral-900">{users.length}</p>
                </div>
              </div>
            </Link>
          </Card>

          <Card className="animate-fade-in-up p-0" style={{ animationDelay: '0.6s' }}>
            <div className="p-4 flex">
              <div className="flex items-center">
                <div className="p-3 bg-success-100 rounded-lg">
                  <Icon icon={icons.checkCircle} className="text-success-600" size="lg" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600">Completed</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {tasks.filter(task => task.status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="animate-fade-in-up p-0" style={{ animationDelay: '0.9s' }}>
            <div className="p-4 flex">
              <div className="flex items-center">
                <div className="p-3 bg-warning-100 rounded-lg">
                  <Icon icon={icons.clock} className="text-warning-600" size="lg" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600">In Progress</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {tasks.filter(task => task.status === 'in-progress').length}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Tasks */}
        {tasks.length > 0 && (
          <Card>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Recent Tasks</h3>
            <div className="space-y-3">
              {tasks.slice(0, 3).map((task) => (
                <div key={task._id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-neutral-900">{task.title}</h4>
                    <p className="text-sm text-neutral-600">{task.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.status === 'completed' ? 'bg-success-100 text-success-800' :
                      task.status === 'in-progress' ? 'bg-primary-100 text-primary-800' :
                      'bg-neutral-100 text-neutral-800'
                    }`}>
                      {task.status}
                    </span>
                    <Link href={`/dashboard/tasks/${task._id}`}>
                      <span className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        View →
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link href="/dashboard/tasks" className="text-primary-600 hover:text-primary-700 font-medium">
                View All Tasks
              </Link>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
