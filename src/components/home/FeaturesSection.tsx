import { MessageSquare, Users, BarChart3, CheckCircle, Globe, HeartHandshake } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: MessageSquare,
    title: 'Collect Feedback',
    description: 'Gather user feedback and feature requests in one centralized place.'
  },
  {
    icon: Users,
    title: 'Community Voting',
    description: 'Let your users vote and prioritize the features they want most.'
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track engagement, analyze trends, and make data-driven decisions.'
  },
  {
    icon: CheckCircle,
    title: 'Project Roadmap',
    description: 'Share your product roadmap and keep users informed of progress.'
  },
  {
    icon: Globe,
    title: 'Multi-Project Support',
    description: 'Manage feedback for multiple products from one dashboard.'
  },
  {
    icon: HeartHandshake,
    title: 'Team Collaboration',
    description: 'Work together with your team to manage and respond to feedback.'
  }
];

export function FeaturesSection() {
  return (
    <div className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need</h2>
          <p className="text-xl text-gray-600">Powerful features to help you manage feedback effectively</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map(feature => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="bg-white p-8 rounded-xl shadow-sm text-center hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-xl mb-6">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}