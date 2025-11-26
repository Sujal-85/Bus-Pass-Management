import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Dashboard';
import DiplomaForm from './components/forms/DiplomaForm';
import EngineeringForm from './components/forms/EngineeringForm';
import PharmacyForm from './components/forms/PharmacyForm';
import ITIForm from './components/forms/ITIForm';
import RouteDetails from './components/RouteDetails';
import LoaderOverlay from './components/LoaderOverlay';
import LostFound from './components/LostFound';
import Chatbot from './components/Chatbot';


// Auth Context to manage login state
interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
export const useAuth = () => useContext(AuthContext)!;

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

// Route Loader Component
const RouteLoader: React.FC = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [location]);

  return <LoaderOverlay show={loading} message="Loading..." fullscreen />;
};

// Remove inline dummy Dashboard. Using real Dashboard component.

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('auth') === 'true';
  });
  const [appLoading, setAppLoading] = useState(true);

  const login = () => {
    localStorage.setItem('auth', 'true');
    setIsAuthenticated(true);
  };
  const logout = () => {
    localStorage.removeItem('auth');
    setIsAuthenticated(false);
  };

  const authValue: AuthContextType = {
    isAuthenticated,
    login,
    logout,
  };

  React.useEffect(() => {
    const timer = setTimeout(() => setAppLoading(false), 500); // simulate initial app splash
    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthContext.Provider value={authValue}>
      <LoaderOverlay show={appLoading} message="Starting…" fullscreen />
      <Router>
        <RouteLoader />
        {isAuthenticated && <Chatbot />}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/Dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forms/diploma"
            element={
              <ProtectedRoute>
                <DiplomaForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forms/engineering"
            element={
              <ProtectedRoute>
                <EngineeringForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forms/pharmacy"
            element={
              <ProtectedRoute>
                <PharmacyForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forms/iti"
            element={
              <ProtectedRoute>
                <ITIForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/route/:routeName"
            element={
              <ProtectedRoute>
                <RouteDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lost-found"
            element={
              <ProtectedRoute>
                <LostFound />
              </ProtectedRoute>
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
