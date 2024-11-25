import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogIn, LogOut, Menu, X, Layout, SwitchCamera } from 'lucide-react';
import { useState } from 'react';
import { AdminMenu } from './AdminMenu';
import { useProject } from '../contexts/ProjectContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const { setShowProjectSelector } = useProject();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Layout className="h-8 w-8 text-brand" />
              <span className="ml-2 text-xl font-bold text-gray-900">FeatureFlow</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link to="/features" className="text-gray-600 hover:text-gray-900">Features</Link>
                <Link to="/roadmap" className="text-gray-600 hover:text-gray-900">Roadmap</Link>
                
                {user.isAdmin && <AdminMenu />}

                <button
                  onClick={() => setShowProjectSelector(true)}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <SwitchCamera className="w-4 h-4 mr-1.5" />
                  Switch
                </button>

                <div className="flex items-center space-x-4">
                  <Link to="/profile" className="flex items-center text-gray-600 hover:text-gray-900">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {user.displayName?.charAt(0)}
                        </span>
                      </div>
                    )}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/features" className="text-gray-600 hover:text-gray-900">Features</Link>
                <Link to="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
                <Link
                  to="/login"
                  className="flex items-center px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 p-2"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100">
          <div className="px-4 py-2 space-y-1">
            {user ? (
              <>
                <Link
                  to="/features"
                  className="block px-4 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  to="/roadmap"
                  className="block px-4 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Roadmap
                </Link>
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setShowProjectSelector(true);
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50"
                >
                  Switch Project
                </button>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/features"
                  className="block px-4 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  to="/pricing"
                  className="block px-4 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  to="/login"
                  className="block px-4 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}