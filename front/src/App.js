import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AdminSettingsProvider } from './context/AdminSettingsContext';
import { UserProvider, useUser } from './context/UserContext';
import Login from './components/login/Login';
import GoogleAuthCallback from './components/login/GoogleAuthCallback';
import Register from './components/register/Register';
import ForgotPassword from './components/recover/ForgotPassword';
import ResetPassword from './components/recover/ResetPassword';
import Home from './components/home/Home';
import Settings from './components/settings/Settings';
import MyUnit from './components/myunit/MyUnit';
import Shop from './components/shop/Shop';
import Contact from './components/contact/Contact';
import Services from './components/services/Services';
import Checkout from './components/checkout/Checkout';
import MyOrders from './components/orders/MyOrders';
import FaqPage from './components/faq/FaqPage';
import ProfileCenter from './components/profile/ProfileCenter';
import AdminDashboard from './components/ADMIN/Dashboard/AdminDashboard';
import AdminInventory from './components/ADMIN/Inventory/AdminInventory';
import AdminMaintenance from './components/ADMIN/Maintenance/AdminMaintenance';
import AdminTechnician from './components/ADMIN/Technicians/AdminTechnician';
import AdminReoder from './components/ADMIN/Reorder/AdminReoder';
import AdminProfile from './components/ADMIN/Profile/AdminProfile';
import AdminAttendance from './components/ADMIN/Attendance/AdminAttendance';
import AdminUnlockUsers from './components/ADMIN/Users/AdminUnlockUsers';
import AdminStoreOperations from './components/ADMIN/Store/AdminStoreOperations';
import AdminOrders from './components/ADMIN/Orders/AdminOrders';
import AdminReports from './components/ADMIN/Reports/AdminReports';
import AdminSettings from './components/ADMIN/Settings/AdminSettings';
import AdminAuditLogs from './components/ADMIN/AuditLogs/AdminAuditLogs';
import SuperAdminDashboard from './components/SUPERADMIN/Dashboard/SuperAdminDashboard';
import SuperAdminBranches from './components/SUPERADMIN/Dashboard/SuperAdminBranches';
import SuperAdminAttendance from './components/SUPERADMIN/Dashboard/SuperAdminAttendance';
import SuperAdminSales from './components/SUPERADMIN/Dashboard/SuperAdminSales';
import SuperAdminInventory from './components/SUPERADMIN/Dashboard/SuperAdminInventory';
import SuperAdminTasks from './components/SUPERADMIN/Dashboard/SuperAdminTasks';
import SuperAdminAlerts from './components/SUPERADMIN/Dashboard/SuperAdminAlerts';
import GlobalDialog from './components/common/GlobalDialog';
import LoginPromptModal from './components/common/LoginPromptModal';
import CustomerChatbot from './components/chatbot/CustomerChatbot';
import './App.css';

const getRoleHomePath = (role) => {
  switch (role) {
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
  const location = useLocation();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace state={{ from: location }} />;
};

const RoleRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, loading, userRole } = useUser();
  const location = useLocation();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
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

// Home Route - Accessible to both authenticated and unauthenticated users
const HomeRoute = ({ children }) => {
  const { loading } = useUser();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return children;
};

// Main App content with routes
function AppContent() {
  const { isAuthenticated, loading, userRole, showLoginPrompt, loginPromptMessage, hideAuthRequiredPrompt } = useUser();
  const location = useLocation();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  const hiddenChatbotRoutes = ['/login', '/register', '/forgot-password'];
  const isResetPasswordRoute = location.pathname.startsWith('/reset-password/');
  const shouldShowCustomerChatbot =
    isAuthenticated &&
    userRole === 'customer' &&
    !hiddenChatbotRoutes.includes(location.pathname) &&
    !isResetPasswordRoute;

  return (
    <>
      <Routes>
        {/* Root path redirects to home */}
        <Route 
          path="/" 
          element={<Navigate to="/home" replace />}
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
      <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
      
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
      />

      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      
      {/* Home route - accessible to both authenticated and unauthenticated users */}
      <Route 
        path="/home" 
        element={
          <HomeRoute>
            <Home />
          </HomeRoute>
        } 
      />
      
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfileCenter />
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
          <HomeRoute>
            <Shop />
          </HomeRoute>
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
      <Route
        path="/faq"
        element={
          <ProtectedRoute>
            <FaqPage />
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
        path="/admin/inventory"
        element={
          <RoleRoute allowedRoles={['admin']}>
            <AdminInventory />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/maintenance"
        element={
          <RoleRoute allowedRoles={['admin']}>
            <AdminMaintenance />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/technicians"
        element={
          <RoleRoute allowedRoles={['admin']}>
            <AdminTechnician />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/reorder"
        element={
          <RoleRoute allowedRoles={['admin']}>
            <AdminReoder />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <RoleRoute allowedRoles={['admin']}>
            <AdminReports />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <RoleRoute allowedRoles={['admin']}>
            <AdminSettings />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <RoleRoute allowedRoles={['admin']}>
            <AdminAuditLogs />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <RoleRoute allowedRoles={['admin']}>
            <AdminProfile />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/attendance"
        element={
          <RoleRoute allowedRoles={['admin']}>
            <AdminAttendance />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/unlock-users"
        element={
          <RoleRoute allowedRoles={['admin']}>
            <AdminUnlockUsers />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <RoleRoute allowedRoles={['admin']}>
            <AdminOrders />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/store"
        element={
          <RoleRoute allowedRoles={['admin']}>
            <AdminStoreOperations />
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
      <Route
        path="/superadmin/branches"
        element={
          <RoleRoute allowedRoles={['superadmin']}>
            <SuperAdminBranches />
          </RoleRoute>
        }
      />
      <Route
        path="/superadmin/attendance"
        element={
          <RoleRoute allowedRoles={['superadmin']}>
            <SuperAdminAttendance />
          </RoleRoute>
        }
      />
      <Route
        path="/superadmin/sales"
        element={
          <RoleRoute allowedRoles={['superadmin']}>
            <SuperAdminSales />
          </RoleRoute>
        }
      />
      <Route
        path="/superadmin/inventory"
        element={
          <RoleRoute allowedRoles={['superadmin']}>
            <SuperAdminInventory />
          </RoleRoute>
        }
      />
      <Route
        path="/superadmin/tasks"
        element={
          <RoleRoute allowedRoles={['superadmin']}>
            <SuperAdminTasks />
          </RoleRoute>
        }
      />
      <Route
        path="/superadmin/alerts"
        element={
          <RoleRoute allowedRoles={['superadmin']}>
            <SuperAdminAlerts />
          </RoleRoute>
        }
      />
      
        {/* Catch all - redirect to home */}
        <Route 
          path="*" 
          element={<Navigate to="/home" replace />}
        />
      </Routes>
      {shouldShowCustomerChatbot && <CustomerChatbot />}
      <LoginPromptModal 
        isOpen={showLoginPrompt} 
        onClose={hideAuthRequiredPrompt}
        message={loginPromptMessage}
      />
    </>
  );
}

// Main App component with providers
function App() {
  return (
    <UserProvider>
      <AdminSettingsProvider>
        <CartProvider>
          <Router>
            <div className="App">
              <AppContent />
              <GlobalDialog />
            </div>
          </Router>
        </CartProvider>
      </AdminSettingsProvider>
    </UserProvider>
  );
}

export default App;