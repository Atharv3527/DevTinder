import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import HomeLayout from './components/HomeLayout';
import Home from './pages/Home';
import Feed from './pages/Feed';
import Chat from './pages/Chat';
import Community from './pages/Community';
import Jobs from './pages/Jobs';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Notifications from './pages/Notifications';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Home gets its own full-width layout for the scroll animation */}
      <Route element={<HomeLayout />}>
        <Route path="/" element={<Home />} />
      </Route>

      {/* All other pages use the standard constrained layout */}
      <Route path="/" element={<Layout />}>
        <Route path="feed" element={<Feed />} />
        <Route path="community" element={<Community />} />
        <Route
          path="chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route path="jobs" element={<Jobs />} />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
