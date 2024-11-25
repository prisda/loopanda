import { Feature, Comment } from '../types';
import { subDays, addDays } from 'date-fns';

const MOCK_CATEGORIES = ['UI/UX', 'Feature', 'Bug', 'Enhancement', 'Documentation'];
const MOCK_STATUSES = ['under-review', 'planned', 'in-progress', 'completed'];
const MOCK_USERS = [
  { id: 'user1', displayName: 'John Doe', photoURL: 'https://i.pravatar.cc/150?u=1' },
  { id: 'user2', displayName: 'Jane Smith', photoURL: 'https://i.pravatar.cc/150?u=2' },
  { id: 'user3', displayName: 'Bob Wilson', photoURL: 'https://i.pravatar.cc/150?u=3' },
];

const FEATURE_TITLES = [
  'Add dark mode support',
  'Implement real-time notifications',
  'Improve mobile responsiveness',
  'Add export to PDF functionality',
  'Enable social media sharing',
  'Implement two-factor authentication',
  'Add bulk actions for tasks',
  'Create custom dashboard widgets',
  'Add keyboard shortcuts',
  'Implement file drag-and-drop'
];

const FEATURE_DESCRIPTIONS = [
  'Users have requested a dark mode option to reduce eye strain during nighttime usage. This should include a theme switcher and proper color palette for dark mode.',
  'Implement real-time notifications for important updates and mentions. This will improve user engagement and collaboration.',
  'The mobile experience needs improvement. Users report difficulty navigating and interacting with certain features on smaller screens.',
  'Add the ability to export reports and data to PDF format for offline viewing and sharing.',
  'Enable users to share content directly to social media platforms with customizable preview cards.',
  'Enhance security by implementing two-factor authentication using SMS or authenticator apps.',
  'Allow users to perform actions on multiple items at once to improve workflow efficiency.',
  'Let users create and customize their own dashboard widgets for better productivity.',
  'Add keyboard shortcuts for common actions to improve power user experience.',
  'Implement drag-and-drop functionality for file uploads to improve user experience.'
];

const COMMENT_CONTENTS = [
  "This would be a great addition to the platform. I especially like how it would improve workflow efficiency.",
  "I have been waiting for this feature! It would save me so much time in my daily tasks.",
  "Have you considered how this might affect performance? We should ensure it scales well.",
  "Could we also add the ability to customize this feature? That would make it even more useful.",
  "This is exactly what we need. Our team has been struggling without this functionality.",
  "Great idea! I would suggest also adding keyboard shortcuts for power users.",
  "This would align well with our accessibility goals. Please ensure it works with screen readers.",
  "The mock-ups look promising. Can we get a beta version to test?",
  "This would be a game-changer for our workflow. Fully support this request!",
  "Important feature, but let us make sure we maintain simplicity in the UI."
];

export function generateMockFeatures(count: number, projectId: string): Feature[] {
  return Array.from({ length: count }, (_, i) => {
    const createdAt = subDays(new Date(), Math.floor(Math.random() * 30));
    const user = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
    const titleIndex = Math.floor(Math.random() * FEATURE_TITLES.length);
    
    return {
      id: `feature-${i + 1}`,
      title: FEATURE_TITLES[titleIndex],
      description: FEATURE_DESCRIPTIONS[titleIndex],
      category: MOCK_CATEGORIES[Math.floor(Math.random() * MOCK_CATEGORIES.length)],
      status: MOCK_STATUSES[Math.floor(Math.random() * MOCK_STATUSES.length)] as any,
      votes: Math.floor(Math.random() * 50),
      votedBy: [],
      projectId,
      createdBy: user.id,
      user,
      createdAt: { toDate: () => createdAt },
      updatedAt: { toDate: () => addDays(createdAt, Math.floor(Math.random() * 5)) },
      commentCount: Math.floor(Math.random() * 10)
    };
  });
}

export function generateMockComments(count: number, feature: Feature): Comment[] {
  return Array.from({ length: count }, (_, i) => {
    const user = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
    const createdAt = subDays(new Date(), Math.floor(Math.random() * 30));
    
    return {
      id: `comment-${i + 1}`,
      content: COMMENT_CONTENTS[Math.floor(Math.random() * COMMENT_CONTENTS.length)],
      featureId: feature.id,
      projectId: feature.projectId,
      createdBy: user.id,
      userDisplayName: user.displayName,
      createdAt: { toDate: () => createdAt },
      likes: Math.floor(Math.random() * 20),
      likedBy: [],
      approved: Math.random() > 0.2, // 80% chance of being approved
      image: Math.random() > 0.8 ? 'https://picsum.photos/400/300' : undefined // 20% chance of having an image
    };
  });
}