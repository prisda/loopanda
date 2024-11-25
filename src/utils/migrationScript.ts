import { collection, getDocs, doc, writeBatch, query, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Feature, Comment, Project, User } from '../types';

export async function migrateToProjectContainer() {
  try {
    // Get the first project to use as default
    const projectsQuery = query(collection(db, 'projects'), limit(1));
    const projectSnap = await getDocs(projectsQuery);
    
    if (projectSnap.empty) {
      console.error('No projects found for migration');
      return;
    }

    const defaultProject = {
      id: projectSnap.docs[0].id,
      ...projectSnap.docs[0].data()
    } as Project;

    // Start batch operations
    const batch = writeBatch(db);

    // Migrate features
    const featuresSnap = await getDocs(collection(db, 'features'));
    featuresSnap.docs.forEach(featureDoc => {
      const feature = featureDoc.data();
      if (!feature.projectId) {
        const newFeatureRef = doc(collection(db, `projects/${defaultProject.id}/features`));
        batch.set(newFeatureRef, {
          ...feature,
          projectId: defaultProject.id
        });
        batch.delete(featureDoc.ref);
      }
    });

    // Migrate comments
    const commentsSnap = await getDocs(collection(db, 'comments'));
    commentsSnap.docs.forEach(commentDoc => {
      const comment = commentDoc.data();
      if (!comment.projectId) {
        const newCommentRef = doc(collection(db, `projects/${defaultProject.id}/comments`));
        batch.set(newCommentRef, {
          ...comment,
          projectId: defaultProject.id
        });
        batch.delete(commentDoc.ref);
      }
    });

    // Migrate categories
    const categoriesSnap = await getDocs(collection(db, 'categories'));
    categoriesSnap.docs.forEach(categoryDoc => {
      const category = categoryDoc.data();
      if (!category.projectId) {
        const newCategoryRef = doc(collection(db, `projects/${defaultProject.id}/categories`));
        batch.set(newCategoryRef, {
          ...category,
          projectId: defaultProject.id
        });
        batch.delete(categoryDoc.ref);
      }
    });

    // Update user projects
    const usersSnap = await getDocs(collection(db, 'users'));
    usersSnap.docs.forEach(userDoc => {
      const user = userDoc.data();
      if (!user.projects) {
        batch.update(userDoc.ref, {
          projects: {
            [defaultProject.id]: {
              role: 'member',
              joinedAt: new Date()
            }
          }
        });
      }
    });

    // Commit all changes
    await batch.commit();
    console.log('Migration completed successfully');

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}