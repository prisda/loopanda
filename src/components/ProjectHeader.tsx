import { useProject } from '../contexts/ProjectContext';
import { useLocation } from 'react-router-dom';

export function ProjectHeader() {
  const { currentProject } = useProject();
  const location = useLocation();
  
  if (!currentProject) return null;

  // Get the page title based on the current route
  const getPageTitle = () => {
    switch (true) {
      case location.pathname.includes('/features'):
        return 'Feature Requests';
      case location.pathname.includes('/roadmap'):
        return 'Roadmap';
      case location.pathname.includes('/admin'):
        return 'Admin Dashboard';
      default:
        return '';
    }
  };

  const pageTitle = getPageTitle();

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {currentProject.name}
          {pageTitle && (
            <span className="text-gray-500 font-normal">
              {' '}/ {pageTitle}
            </span>
          )}
        </h1>
      </div>
    </div>
  );
}