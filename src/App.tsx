import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { ProjectSelector } from './components/ProjectSelector';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { FeaturesPage } from './pages/FeaturesPage';
import { FeatureDetailPage } from './pages/FeatureDetailPage';
import { NewFeaturePage } from './pages/NewFeaturePage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { AdminPage } from './pages/AdminPage';
import { AdminProjectsPage } from './pages/AdminProjectsPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminCommentsPage } from './pages/AdminCommentsPage';
import { AdminInvitesPage } from './pages/AdminInvitesPage';
import { AdminFeatureApprovalPage } from './pages/AdminFeatureApprovalPage';
import { AdminProjectDashboard } from './pages/AdminProjectDashboard';
import { ProfilePage } from './pages/ProfilePage';
import { ProjectSetupPage } from './pages/ProjectSetupPage';
import { ProjectSettingsPage } from './pages/ProjectSettingsPage';
import { DashboardPage } from './pages/DashboardPage';
import { TeamMembersPage } from './pages/TeamMembersPage';
import { AuthProvider } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { FirestoreProvider } from './contexts/FirestoreProvider';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAuth } from './hooks/useAuth';
import { Toaster } from 'react-hot-toast';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <FirestoreProvider>
          <ProjectProvider>
            <ThemeProvider>
              <Router>
                <div className="min-h-screen bg-gray-50">
                  <Navbar />
                  <ProjectSelector />
                  <Layout>
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={
                        <AuthenticatedRoute>
                          <HomePage />
                        </AuthenticatedRoute>
                      } />
                      <Route path="/login" element={
                        <AuthenticatedRoute>
                          <SignInPage />
                        </AuthenticatedRoute>
                      } />
                      <Route path="/signup" element={
                        <AuthenticatedRoute>
                          <SignUpPage />
                        </AuthenticatedRoute>
                      } />

                      {/* Protected routes */}
                      <Route path="/dashboard" element={
                        <PrivateRoute>
                          <DashboardPage />
                        </PrivateRoute>
                      } />
                      <Route path="/features" element={
                        <PrivateRoute>
                          <FeaturesPage />
                        </PrivateRoute>
                      } />
                      <Route path="/feature/:id" element={
                        <PrivateRoute>
                          <FeatureDetailPage />
                        </PrivateRoute>
                      } />
                      <Route path="/new" element={
                        <PrivateRoute>
                          <NewFeaturePage />
                        </PrivateRoute>
                      } />
                      <Route path="/setup" element={
                        <PrivateRoute>
                          <ProjectSetupPage />
                        </PrivateRoute>
                      } />
                      <Route path="/roadmap" element={
                        <PrivateRoute>
                          <RoadmapPage />
                        </PrivateRoute>
                      } />
                      <Route path="/team" element={
                        <PrivateRoute>
                          <TeamMembersPage />
                        </PrivateRoute>
                      } />
                      <Route path="/admin" element={
                        <PrivateRoute>
                          <AdminPage />
                        </PrivateRoute>
                      } />
                      <Route path="/admin/projects" element={
                        <PrivateRoute>
                          <AdminProjectsPage />
                        </PrivateRoute>
                      } />
                      <Route path="/admin/projects/:id/settings" element={
                        <PrivateRoute>
                          <ProjectSettingsPage />
                        </PrivateRoute>
                      } />
                      <Route path="/admin/projects/:id/dashboard" element={
                        <PrivateRoute>
                          <AdminProjectDashboard />
                        </PrivateRoute>
                      } />
                      <Route path="/admin/users" element={
                        <PrivateRoute>
                          <AdminUsersPage />
                        </PrivateRoute>
                      } />
                      <Route path="/admin/comments" element={
                        <PrivateRoute>
                          <AdminCommentsPage />
                        </PrivateRoute>
                      } />
                      <Route path="/admin/features" element={
                        <PrivateRoute>
                          <AdminFeatureApprovalPage />
                        </PrivateRoute>
                      } />
                      <Route path="/admin/invites" element={
                        <PrivateRoute>
                          <AdminInvitesPage />
                        </PrivateRoute>
                      } />
                      <Route path="/profile" element={
                        <PrivateRoute>
                          <ProfilePage />
                        </PrivateRoute>
                      } />
                    </Routes>
                  </Layout>
                  <Toaster position="top-right" />
                </div>
              </Router>
            </ThemeProvider>
          </ProjectProvider>
        </FirestoreProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}