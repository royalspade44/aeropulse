import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { UserProvider, useUser } from './context/UserContext';
import Login from './components/login/Login';
import Register from './components/register/Register';
import Home from './components/home/Home';
import Settings from './components/settings/Settings';
import MyUnit from './components/myunit/MyUnit';
import Shop from './components/shop/Shop';
import Contact from './components/contact/Contact';
import Services from './components/services/Services';
import Checkout from './components/checkout/Checkout';
import MyOrders from './components/orders/MyOrders';
import AdminDashboard from './components/ADMIN/Dashboard/AdminDashboard';
import TechMainScreen from './components/TECH/Dashboard/TechMainScreen';
import SuperAdminDashboard from './components/SUPERADMIN/Dashboard/SuperAdminDashboard';
import './App.css';

const getRoleHomePath = (role) => {
  switch (role) {
    case 'technician':
      return '/tech/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'superadmin':
      return '/superadmin/dashboard';
    default:
      return '/home';
  }
};

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useUser();
  
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const RoleRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, loading, userRole } = useUser();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return allowedRoles.includes(userRole)
    ? children
    : <Navigate to="/home" replace />;
};

// Public Route wrapper (redirects to home if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, userRole } = useUser();
  
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  return !isAuthenticated ? children : <Navigate to={getRoleHomePath(userRole)} replace />;
};

// Main App content with routes
function AppContent() {
  const { isAuthenticated, loading, userRole } = useUser();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <Routes>
      {/* Root path redirects based on auth status */}
      <Route 
        path="/" 
        element={
          isAuthenticated ? 
            <Navigate to={getRoleHomePath(userRole)} replace /> : 
            <Navigate to="/login" replace />
        } 
      />
      
      {/* Public routes */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
      />
      
      {/* Protected routes */}
      <Route 
        path="/home" 
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/myunit" 
        element={
          <ProtectedRoute>
            <MyUnit />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/shop" 
        element={
          <ProtectedRoute>
            <Shop />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/contact" 
        element={
          <ProtectedRoute>
            <Contact />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/services" 
        element={
          <ProtectedRoute>
            <Services />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/checkout" 
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/my-orders" 
        element={
          <ProtectedRoute>
            <MyOrders />
          </ProtectedRoute>
        } 
      />

      {/* Role-based dashboards */}
      <Route
        path="/admin/dashboard"
        element={
          <RoleRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </RoleRoute>
        }
      />

      <Route
        path="/tech/dashboard"
        element={
          <RoleRoute allowedRoles={['technician']}>
            <TechMainScreen />
          </RoleRoute>
        }
      />

      <Route
        path="/superadmin/dashboard"
        element={
          <RoleRoute allowedRoles={['superadmin']}>
            <SuperAdminDashboard />
          </RoleRoute>
        }
      />
      
      {/* Catch all - redirect to home or login based on auth */}
      <Route 
        path="*" 
        element={
          <Navigate to={isAuthenticated ? getRoleHomePath(userRole) : "/login"} replace />
        } 
      />
    </Routes>
  );
}

// Main App component with providers
function App() {
  return (
    <UserProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <AppContent />
          </div>
        </Router>
      </CartProvider>
    </UserProvider>
  );
}

export default App;