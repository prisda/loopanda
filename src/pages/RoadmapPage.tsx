import { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Feature, FeatureStatus } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useProject } from '../contexts/ProjectContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { RoadmapCard } from '../components/roadmap/RoadmapCard';
import { RoadmapFilters } from '../components/roadmap/RoadmapFilters';
import { StatusColumnHeader } from '../components/roadmap/StatusColumnHeader';
import { useCategories } from '../hooks/useCategories';

const STATUSES: FeatureStatus[] = ['under-review', 'planned', 'in-progress', 'completed'];

export function RoadmapPage() {
  const { user } = useAuth();
  const { currentProject } = useProject();
  const { categories, loading: loadingCategories } = useCategories(currentProject?.id || '');
  const [features, setFeatures] = useState<Record<FeatureStatus, Feature[]>>({
    'under-review': [],
    'planned': [],
    'in-progress': [],
    'completed': []
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    if (!currentProject?.id) {
      setLoading(false);
      return;
    }

    const fetchFeatures = async () => {
      try {
        const featuresRef = collection(db, 'projects', currentProject.id, 'features');
        const snapshot = await getDocs(featuresRef);
        const featuresData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          projectId: currentProject.id
        })) as Feature[];

        // Group features by status
        const groupedFeatures = featuresData.reduce((acc, feature) => {
          if (!acc[feature.status]) {
            acc[feature.status] = [];
          }
          acc[feature.status].push(feature);
          return acc;
        }, {} as Record<FeatureStatus, Feature[]>);

        // Ensure all status arrays exist
        STATUSES.forEach(status => {
          if (!groupedFeatures[status]) {
            groupedFeatures[status] = [];
          }
        });

        setFeatures(groupedFeatures);
      } catch (error) {
        console.error('Error fetching features:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, [currentProject?.id]);

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !user?.isAdmin || !currentProject) return;

    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId as FeatureStatus;
    const feature = features[source.droppableId as FeatureStatus].find(
      f => f.id === draggableId
    );

    if (!feature) return;

    try {
      await updateDoc(doc(db, 'projects', currentProject.id, 'features', draggableId), {
        status: newStatus,
        updatedAt: new Date()
      });

      const newFeatures = { ...features };
      newFeatures[source.droppableId as FeatureStatus] = newFeatures[
        source.droppableId as FeatureStatus
      ].filter(f => f.id !== draggableId);
      newFeatures[newStatus] = [...newFeatures[newStatus], { ...feature, status: newStatus }];
      setFeatures(newFeatures);
    } catch (error) {
      console.error('Error updating feature status:', error);
    }
  };

  // Filter features by search and category
  const filteredFeatures = Object.fromEntries(
    Object.entries(features).map(([status, statusFeatures]) => [
      status,
      statusFeatures.filter(feature => {
        const matchesSearch = searchTerm
          ? feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            feature.description.toLowerCase().includes(searchTerm.toLowerCase())
          : true;
        const matchesCategory = selectedCategory === 'All' || feature.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
    ])
  ) as Record<FeatureStatus, Feature[]>;

  if (!currentProject) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Project Selected</h2>
          <p className="text-gray-600">Please select a project to view its roadmap.</p>
        </div>
      </div>
    );
  }

  if (loading || loadingCategories) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const categoryOptions = ['All', ...categories.map(cat => cat.name)];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {currentProject.name}
          <span className="text-gray-500 font-normal ml-2">/ Roadmap</span>
        </h1>
      </div>

      <RoadmapFilters
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categories={categoryOptions}
      />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATUSES.map(status => (
            <div key={status} className="bg-white rounded-lg shadow-sm">
              <StatusColumnHeader 
                status={status} 
                count={filteredFeatures[status].length} 
              />
              
              <Droppable droppableId={status} isDropDisabled={!user?.isAdmin}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-3 min-h-[200px] ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="space-y-3">
                      {filteredFeatures[status].map((feature, index) => (
                        <Draggable
                          key={feature.id}
                          draggableId={feature.id}
                          index={index}
                          isDragDisabled={!user?.isAdmin}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <RoadmapCard 
                                feature={feature}
                                isDragging={snapshot.isDragging}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}