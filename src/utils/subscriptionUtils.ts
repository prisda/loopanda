import { Customer, SubscriptionTier } from '../types/customer';

export function isSubscriptionActive(customer: Customer): boolean {
  const now = new Date();
  const expiryDate = new Date(customer.subscription.expiryDate);
  return customer.subscription.isActive && expiryDate > now;
}

export function getDaysUntilExpiry(customer: Customer): number {
  const now = new Date();
  const expiryDate = new Date(customer.subscription.expiryDate);
  const diffTime = Math.abs(expiryDate.getTime() - now.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getSubscriptionFeatures(tier: SubscriptionTier): string[] {
  const features: Record<SubscriptionTier, string[]> = {
    'starter+': [
      'Basic Support',
      'Core Features',
      'Community Access',
      '5 Team Members'
    ],
    'smart+': [
      'Priority Support',
      'Advanced Features',
      'API Access',
      '15 Team Members',
      'Custom Integrations'
    ],
    'pro': [
      '24/7 Support',
      'Enterprise Features',
      'Unlimited API Access',
      'Unlimited Team Members',
      'Custom Development',
      'Dedicated Account Manager'
    ]
  };
  
  return features[tier] || [];
}