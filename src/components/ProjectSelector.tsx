import { Dialog } from '@headlessui/react';
import { Project } from '../types';
import { useProject } from '../contexts/ProjectContext';
import { Settings } from 'lucide-react';

export function ProjectSelector() {
  const { 
    userProjects, 
    setCurrentProject, 
    showProjectSelector, 
    setShowProjectSelector 
  } = useProject();

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
    setShowProjectSelector(false);
  };

  return (
    <Dialog 
      open={showProjectSelector} 
      onClose={() => setShowProjectSelector(false)}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
          <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
            Select a Project
          </Dialog.Title>

          <div className="space-y-2">
            {userProjects.map(project => (
              <button
                key={project.id}
                onClick={() => handleProjectSelect(project)}
                className="w-full p-4 text-left rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {project.logo ? (
                    <img 
                      src={project.logo} 
                      alt={project.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {project.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}