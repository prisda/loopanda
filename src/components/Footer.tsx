import { Link } from 'react-router-dom';
import { Github, Twitter } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between">
        <div className="text-sm text-gray-500">
          © {currentYear} FeatureFlow. All rights reserved.
        </div>
        
        <div className="flex items-center gap-6 mt-4 sm:mt-0">
          <Link to="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
            Privacy Policy
          </Link>
          <Link to="/terms" className="text-sm text-gray-600 hover:text-gray-900">
            Terms of Service
          </Link>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/featureflow"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com/featureflow"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}