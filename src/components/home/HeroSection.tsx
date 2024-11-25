import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blue-600 to-blue-800 text-white">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519389950473-47ba0277781c')] bg-cover bg-center opacity-10"></div>
      <div className="max-w-7xl mx-auto px-6 py-24 sm:px-8 lg:px-12 relative">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-8">
            Turn User Feedback Into Product Success
          </h1>
          <p className="text-xl text-blue-100 mb-12 leading-relaxed">
            Collect, organize, and prioritize user feedback in one place. 
            Make better product decisions with data-driven insights.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all shadow-lg text-lg font-medium"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center px-8 py-4 bg-blue-500/20 text-white rounded-xl hover:bg-blue-500/30 transition-all shadow-lg text-lg font-medium backdrop-blur-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}