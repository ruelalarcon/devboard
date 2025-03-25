import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ChannelDetailPage } from './pages/ChannelDetail.page';
import { DashboardPage } from './pages/Dashboard.page';
import { HomePage } from './pages/Home.page';
import { LoginPage } from './pages/Login.page';
import { MessageDetailPage } from './pages/MessageDetail.page';
import { RegisterPage } from './pages/Register.page';
import { SearchPage } from './pages/Search.page';
import { UserProfilePage } from './pages/UserProfile.page';

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

// Public only route (redirect to dashboard if logged in)
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }
  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}

export function AppRouter() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <HomePage />,
    },
    {
      path: '/register',
      element: (
        <PublicOnlyRoute>
          <RegisterPage />
        </PublicOnlyRoute>
      ),
    },
    {
      path: '/login',
      element: (
        <PublicOnlyRoute>
          <LoginPage />
        </PublicOnlyRoute>
      ),
    },
    {
      path: '/dashboard',
      element: (
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      ),
    },
    {
      path: '/channel/:id',
      element: (
        <ProtectedRoute>
          <ChannelDetailPage />
        </ProtectedRoute>
      ),
    },
    {
      path: '/message/:id',
      element: (
        <ProtectedRoute>
          <MessageDetailPage />
        </ProtectedRoute>
      ),
    },
    {
      path: '/reply/:id',
      element: (
        <ProtectedRoute>
          <MessageDetailPage />
        </ProtectedRoute>
      ),
    },
    {
      path: '/user/:id',
      element: (
        <ProtectedRoute>
          <UserProfilePage />
        </ProtectedRoute>
      ),
    },
    {
      path: '/search',
      element: (
        <ProtectedRoute>
          <SearchPage />
        </ProtectedRoute>
      ),
    },
    {
      path: '*',
      element: <Navigate to="/" />,
    },
  ]);

  return <RouterProvider router={router} />;
}
