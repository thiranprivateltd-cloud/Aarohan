import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Signup } from './pages/Signup';
import { Login } from './pages/Login';
import { LearningProfileSetup } from './pages/LearningProfileSetup';
import { BaselineAssessment } from './pages/BaselineAssessment';
import { Dashboard } from './pages/Dashboard';
import { CourseAssessment } from './pages/CourseAssessment';
import { Lesson } from './pages/Lesson';
import { EducatorDashboard } from './pages/EducatorDashboard';
import { AdminPanel } from './pages/AdminPanel';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/setup-profile"
              element={
                <PrivateRoute>
                  <LearningProfileSetup />
                </PrivateRoute>
              }
            />
            <Route
              path="/baseline"
              element={
                <PrivateRoute>
                  <BaselineAssessment />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/course-assessment"
              element={
                <PrivateRoute>
                  <CourseAssessment />
                </PrivateRoute>
              }
            />
            <Route
              path="/lesson"
              element={
                <PrivateRoute>
                  <Lesson />
                </PrivateRoute>
              }
            />
            <Route
              path="/educator"
              element={
                <PrivateRoute>
                  <EducatorDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <AdminPanel />
                </PrivateRoute>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};
