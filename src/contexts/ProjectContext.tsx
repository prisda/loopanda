import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, getDoc, collection, query, where, getDocs, runTransaction, arrayUnion, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Project } from '../types';
import { useAuth } from './AuthContext';
import { isLightColor } from '../utils/color';

interface ProjectContextType {
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  userProjects: Project[];
  loading: boolean;
  isNewProject: boolean;
  setIsNewProject: (value: boolean) => void;
  showProjectSelector: boolean;
  setShowProjectSelector: (value: boolean) => void;
  createProject: (projectData: Partial<Project>) => Promise<Project>;
  updateBrandColor: (color: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType>({} as ProjectContextType);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewProject, setIsNewProject] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      if (!user) {
        setCurrentProject(null);
        setUserProjects([]);
        setLoading(false);
        return;
      }

      try {
        // Get all projects where user is owner or member
        const projectIds = [...(user.ownedProjects || []), ...(user.memberProjects || [])];
        
        if (projectIds.length === 0) {
          setLoading(false);
          return;
        }

        const projectsQuery = query(
          collection(db, 'projects'),
          where('__name__', 'in', projectIds)
        );
        
        const projectsSnap = await getDocs(projectsQuery);
        const projects = projectsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Project[];

        setUserProjects(projects);

        // If there's only one project, set it as current
        if (projects.length === 1) {
          setCurrentProject(projects[0]);
          // Apply brand color and theme if set
          if (projects[0].settings?.brandColor) {
            document.documentElement.style.setProperty('--brand-color', projects[0].settings.brandColor);
            document.documentElement.style.setProperty(
              '--brand-text-color',
              isLightColor(projects[0].settings.brandColor) ? '#000000' : '#FFFFFF'
            );
          }
          if (projects[0].settings?.theme) {
            document.documentElement.setAttribute('data-theme', projects[0].settings.theme);
          }
        } else if (projects.length > 1) {
          setShowProjectSelector(true);
        }
      } catch (error) {
        console.error('Error loading projects:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [user]);

  const createProject = async (projectData: Partial<Project>): Promise<Project> => {
    if (!user) throw new Error('User must be signed in');

    // Get the next project number
    const projectCounterRef = doc(db, 'system', 'projectCounter');
    
    try {
      // Use a transaction to ensure atomic increment of project number
      const newProject = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(projectCounterRef);
        const nextNumber = (counterDoc.exists() ? counterDoc.data().count : 0) + 1;

        // Update counter
        transaction.set(projectCounterRef, { count: nextNumber }, { merge: true });

        // Create project with auto-incrementing number
        const newProjectData: Omit<Project, 'id'> = {
          ...projectData,
          projectNumber: nextNumber,
          ownerId: user.uid,
          members: [user.uid],
          categories: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          settings: {
            allowAnonymousVoting: false,
            requireApproval: true,
            requireCommentApproval: true,
            brandColor: '#3B82F6',
            theme: 'light'
          }
        } as Omit<Project, 'id'>;

        const projectRef = doc(collection(db, 'projects'));
        transaction.set(projectRef, newProjectData);

        // Update user's owned projects
        const userRef = doc(db, 'users', user.uid);
        transaction.update(userRef, {
          ownedProjects: arrayUnion(projectRef.id),
          updatedAt: serverTimestamp()
        });

        return { id: projectRef.id, ...newProjectData } as Project;
      });

      // Update local state
      setUserProjects(prev => [...prev, newProject]);
      setCurrentProject(newProject);
      setIsNewProject(true);

      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  const updateBrandColor = async (color: string) => {
    if (!currentProject?.id) return;

    try {
      const projectRef = doc(db, 'projects', currentProject.id);
      await updateDoc(projectRef, {
        'settings.brandColor': color,
        updatedAt: serverTimestamp()
      });

      // Update local state
      setCurrentProject(prev => prev ? {
        ...prev,
        settings: {
          ...prev.settings,
          brandColor: color
        }
      } : null);

      // Update CSS variables
      document.documentElement.style.setProperty('--brand-color', color);
      document.documentElement.style.setProperty(
        '--brand-text-color',
        isLightColor(color) ? '#000000' : '#FFFFFF'
      );
    } catch (error) {
      console.error('Error updating brand color:', error);
      throw error;
    }
  };

  return (
    <ProjectContext.Provider value={{ 
      currentProject, 
      setCurrentProject,
      userProjects,
      loading,
      isNewProject,
      setIsNewProject,
      showProjectSelector,
      setShowProjectSelector,
      createProject,
      updateBrandColor
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};