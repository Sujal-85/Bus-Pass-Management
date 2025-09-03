import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Dashboard';
import DiplomaForm from './components/forms/DiplomaForm';
import EngineeringForm from './components/forms/EngineeringForm';
import PharmacyForm from './components/forms/PharmacyForm';
import ITIForm from './components/forms/ITIForm';
import RouteDetails from './components/RouteDetails';
import LoaderOverlay from './components/LoaderOverlay';


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

// Remove inline dummy Dashboard. Using real Dashboard component.

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [appLoading, setAppLoading] = useState(true);

  // Fake login/logout functions
  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

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
          <Route path="/forgot-password" element={<ForgotPassword />} /> {/* ✅ Real page added */}
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
