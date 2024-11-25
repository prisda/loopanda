import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
}

const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'Perfect for small teams and startups',
    features: [
      'Up to 3 projects',
      '1,000 monthly active users',
      'Basic analytics',
      'Email support',
      'Community features'
    ]
  },
  {
    name: 'Pro',
    price: '$79',
    period: '/month',
    description: 'For growing teams and businesses',
    features: [
      'Up to 10 projects',
      '10,000 monthly active users',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
      'API access'
    ],
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations',
    features: [
      'Unlimited projects',
      'Unlimited users',
      'Custom analytics',
      '24/7 dedicated support',
      'SSO & advanced security',
      'Custom integrations'
    ]
  }
];

export function PricingSection() {
  return (
    <div className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600">Choose the plan that's right for you</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PRICING_TIERS.map(tier => (
            <div 
              key={tier.name}
              className={`bg-white rounded-xl shadow-sm p-8 relative ${
                tier.popular ? 'ring-2 ring-blue-600' : ''
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-8 transform -translate-y-1/2">
                  <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {tier.price}
                  <span className="text-lg font-normal text-gray-600">{tier.period}</span>
                </div>
                <p className="text-gray-600">{tier.description}</p>
              </div>
              <ul className="space-y-4 mb-8">
                {tier.features.map(feature => (
                  <li key={feature} className="flex items-center text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className={`block text-center py-3 rounded-lg font-medium transition-colors ${
                  tier.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}