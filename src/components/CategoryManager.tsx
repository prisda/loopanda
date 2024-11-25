import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ProjectCategory } from '../types';
import { Edit2, Trash2, GripVertical, Plus, X } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { doc, updateDoc, addDoc, deleteDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DEFAULT_CATEGORIES } from '../constants/categories';

interface CategoryManagerProps {
  projectId: string;
  categories: ProjectCategory[];
  onCategoriesChange: (categories: ProjectCategory[]) => void;
}

export function CategoryManager({ projectId, categories, onCategoriesChange }: CategoryManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProjectCategory | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order numbers
    const updatedCategories = items.map((item, index) => ({
      ...item,
      order: index
    }));

    try {
      // Update each category's order in Firestore
      await Promise.all(updatedCategories.map(category => 
        updateDoc(doc(db, 'projects', projectId, 'categories', category.id), {
          order: category.order,
          updatedAt: serverTimestamp()
        })
      ));

      onCategoriesChange(updatedCategories);
    } catch (error) {
      console.error('Error updating category order:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      if (editingCategory) {
        // Update existing category
        await updateDoc(doc(db, 'projects', projectId, 'categories', editingCategory.id), {
          name: formData.name,
          description: formData.description,
          updatedAt: serverTimestamp()
        });

        onCategoriesChange(categories.map(cat => 
          cat.id === editingCategory.id 
            ? { ...cat, ...formData }
            : cat
        ));
      } else {
        // Create new category
        const newCategory: Omit<ProjectCategory, 'id'> = {
          name: formData.name,
          description: formData.description,
          order: categories.length,
          projectId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'projects', projectId, 'categories'), newCategory);
        onCategoriesChange([...categories, { id: docRef.id, ...newCategory }]);
      }

      setIsModalOpen(false);
      setFormData({ name: '', description: '' });
      setEditingCategory(null);
    } catch (error: any) {
      setError(error.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await deleteDoc(doc(db, 'projects', projectId, 'categories', categoryId));
      
      // Update local state and reorder remaining categories
      const remainingCategories = categories
        .filter(cat => cat.id !== categoryId)
        .map((cat, index) => ({ ...cat, order: index }));
      
      // Update order in Firestore
      await Promise.all(remainingCategories.map(category => 
        updateDoc(doc(db, 'projects', projectId, 'categories', category.id), {
          order: category.order,
          updatedAt: serverTimestamp()
        })
      ));

      onCategoriesChange(remainingCategories);
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleResetToDefault = async () => {
    if (!window.confirm('Reset to default categories? This will remove all custom categories.')) return;

    try {
      // Delete all existing categories
      await Promise.all(categories.map(category =>
        deleteDoc(doc(db, 'projects', projectId, 'categories', category.id))
      ));

      // Add default categories
      const newCategories = await Promise.all(DEFAULT_CATEGORIES.map((cat, index) =>
        addDoc(collection(db, 'projects', projectId, 'categories'), {
          ...cat,
          order: index,
          projectId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      ));

      const categoriesData = newCategories.map((docRef, index) => ({
        id: docRef.id,
        ...DEFAULT_CATEGORIES[index],
        order: index,
        projectId,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      onCategoriesChange(categoriesData);
    } catch (error) {
      console.error('Error resetting categories:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToDefault}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Reset to Default
          </button>
          <button
            onClick={() => {
              setEditingCategory(null);
              setFormData({ name: '', description: '' });
              setIsModalOpen(true);
            }}
            className="flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Category
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="categories">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {categories.map((category, index) => (
                <Draggable 
                  key={category.id} 
                  draggableId={category.id} 
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          {...provided.dragHandleProps}
                          className="text-gray-400 hover:text-gray-600 cursor-grab"
                        >
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{category.name}</h4>
                          {category.description && (
                            <p className="text-sm text-gray-500">{category.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingCategory(category);
                            setFormData({
                              name: category.name,
                              description: category.description
                            });
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Category Modal */}
      <Dialog 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                {editingCategory ? 'Edit Category' : 'New Category'}
              </Dialog.Title>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {error && (
                <div className="text-sm text-red-600">{error}</div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}