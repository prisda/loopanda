import { Menu } from '@headlessui/react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Settings,
  Users,
  MessageSquare,
  UserPlus,
  ChevronDown,
  Layers,
  CheckSquare
} from 'lucide-react';
import { useProject } from '../contexts/ProjectContext';

export function AdminMenu() {
  const { currentProject } = useProject();

  if (!currentProject) return null;

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center text-gray-600 hover:text-gray-900">
        Admin
        <ChevronDown className="w-4 h-4 ml-1" />
      </Menu.Button>

      <Menu.Items className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 z-10 divide-y divide-gray-100">
        {/* Analytics & Moderation */}
        <div className="px-1 py-1">
          <Menu.Item>
            {({ active }) => (
              <Link
                to={`/admin/projects/${currentProject.id}/dashboard`}
                className={`${
                  active ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                } group flex items-center px-4 py-2 text-sm rounded-md`}
              >
                <BarChart className="w-4 h-4 mr-3" />
                Project Analytics
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/admin/features"
                className={`${
                  active ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                } group flex items-center px-4 py-2 text-sm rounded-md`}
              >
                <CheckSquare className="w-4 h-4 mr-3" />
                Feature Approval
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/admin/comments"
                className={`${
                  active ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                } group flex items-center px-4 py-2 text-sm rounded-md`}
              >
                <MessageSquare className="w-4 h-4 mr-3" />
                Comment Approval
              </Link>
            )}
          </Menu.Item>
        </div>

        {/* User Management */}
        <div className="px-1 py-1">
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/admin/users"
                className={`${
                  active ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                } group flex items-center px-4 py-2 text-sm rounded-md`}
              >
                <Users className="w-4 h-4 mr-3" />
                User Management
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/admin/invites"
                className={`${
                  active ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                } group flex items-center px-4 py-2 text-sm rounded-md`}
              >
                <UserPlus className="w-4 h-4 mr-3" />
                Invite Users
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                to="/admin/projects"
                className={`${
                  active ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                } group flex items-center px-4 py-2 text-sm rounded-md`}
              >
                <Layers className="w-4 h-4 mr-3" />
                Project Management
              </Link>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  );
}