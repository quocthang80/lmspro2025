import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import CourseDetails from './pages/CourseDetails';
import LessonView from './pages/LessonView';
import QuizTake from './pages/QuizTake';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/student/dashboard" />;
  }

  return children;
};

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.roles?.includes('ADMIN') ? '/admin/dashboard' : '/student/dashboard'} /> : <Login />} />
      
      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Student Routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/courses/:courseId"
        element={
          <ProtectedRoute>
            <CourseDetails />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/courses/:courseId/lessons/:lessonId"
        element={
          <ProtectedRoute>
            <LessonView />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/quizzes/:quizId/take"
        element={
          <ProtectedRoute>
            <QuizTake />
          </ProtectedRoute>
        }
      />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
