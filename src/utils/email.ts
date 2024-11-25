import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { generatePassword } from './password';

interface InviteEmailData {
  to: string;
  projectName: string;
  inviteLink: string;
  role: string;
}

interface WelcomeEmailData {
  to: string;
  projectName: string;
  password: string;
  loginLink: string;
}

export async function sendInvitationEmail({ to, projectName, inviteLink, role }: InviteEmailData) {
  try {
    // Store the email in Firestore to be processed by Cloud Functions
    await addDoc(collection(db, 'mail'), {
      to,
      template: {
        name: 'invitation',
        data: {
          projectName,
          inviteLink,
          role
        }
      },
      createdAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw error;
  }
}

export async function sendWelcomeEmail({ to, projectName, password, loginLink }: WelcomeEmailData) {
  try {
    // Store the email in Firestore to be processed by Cloud Functions
    await addDoc(collection(db, 'mail'), {
      to,
      template: {
        name: 'welcome',
        data: {
          projectName,
          password,
          loginLink
        }
      },
      createdAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function parseEmailList(input: string): string[] {
  return input
    .split(/[,\n]/)
    .map(email => email.trim())
    .filter(email => email.length > 0 && validateEmail(email));
}