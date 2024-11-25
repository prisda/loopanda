import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Feature, FeatureStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const STATUSES: FeatureStatus[] = ['planned', 'in-progress', 'completed', 'under-review'];

export function KanbanPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [columns, setColumns] = useState<Record<FeatureStatus, Feature[]>>({
    planned: [],
    'in-progress': [],
    completed: [],
    'under-review': []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
      return;
    }

    const fetchFeatures = async () => {
      try {
        const q = query(collection(db, 'features'));
        const snapshot = await getDocs(q);
        const featuresData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Feature[];

        const groupedFeatures = featuresData.reduce((acc, feature) => {
          if (!acc[feature.status]) {
            acc[feature.status] = [];
          }
          acc[feature.status].push(feature);
          return acc;
        }, {} as Record<FeatureStatus, Feature[]>);

        setColumns(groupedFeatures);
      } catch (error) {
        console.error('Error fetching features:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, [user, navigate]);

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId as FeatureStatus;
    const feature = columns[source.droppableId as FeatureStatus].find(
      f => f.id === draggableId
    );

    if (!feature) return;

    try {
      await updateDoc(doc(db, 'features', draggableId), {
        status: newStatus,
        updatedAt: new Date()
      });

      const newColumns = { ...columns };
      newColumns[source.droppableId as FeatureStatus] = newColumns[
        source.droppableId as FeatureStatus
      ].filter(f => f.id !== draggableId);
      newColumns[newStatus] = [...newColumns[newStatus], { ...feature, status: newStatus }];
      setColumns(newColumns);
    } catch (error) {
      console.error('Error updating feature status:', error);
    }
  };

  if (!user?.isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Development Kanban</h1>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATUSES.map(status => (
            <div key={status} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {status.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </h2>
                <StatusBadge status={status} />
              </div>

              <Droppable droppableId={status}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-4 min-h-[200px]"
                  >
                    {columns[status]?.map((feature, index) => (
                      <Draggable
                        key={feature.id}
                        draggableId={feature.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-500 transition-colors"
                          >
                            <h3 className="font-medium text-gray-900 mb-2">
                              {feature.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {feature.description}
                            </p>
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <span className="mr-2">👍 {feature.votes}</span>
                              <span>{feature.category}</span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
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