import { useLocation } from 'react-router-dom';
import { useProject } from '../contexts/ProjectContext';

export function PageHeader() {
  const { currentProject } = useProject();
  const location = useLocation();
  
  // Get the page title based on the current route
  const getPageTitle = () => {
    const project = currentProject?.name ? `${currentProject.name} / ` : '';
    
    switch (true) {
      case location.pathname.includes('/features'):
        return `${project}Feature Requests`;
      case location.pathname.includes('/roadmap'):
        return `${project}Roadmap`;
      case location.pathname.includes('/admin/projects'):
        return 'Project Management';
      case location.pathname.includes('/admin/users'):
        return 'User Management';
      case location.pathname.includes('/admin/invites'):
        return 'Invite Users';
      case location.pathname.includes('/admin'):
        return 'Admin Dashboard';
      default:
        return currentProject?.name || '';
    }
  };

  const pageTitle = getPageTitle();
  if (!pageTitle) return null;

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
      </div>
    </div>
  );
}