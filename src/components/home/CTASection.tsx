import { Link } from 'react-router-dom';
import { ArrowRight, LifeBuoy } from 'lucide-react';

export function CTASection() {
  return (
    <div className="bg-blue-600 text-white py-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
        <h2 className="text-3xl font-bold mb-8">Ready to Get Started?</h2>
        <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
          Join thousands of teams already using FeatureFlow to build better products.
          Start your free 14-day trial today.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link
            to="/signup"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all shadow-lg text-lg font-medium"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
          <a
            href="mailto:support@featureflow.app"
            className="inline-flex items-center px-8 py-4 bg-blue-500/20 text-white rounded-xl hover:bg-blue-500/30 transition-all shadow-lg text-lg font-medium backdrop-blur-sm"
          >
            <LifeBuoy className="w-5 h-5 mr-2" />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}