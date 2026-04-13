import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { UserProvider, useUser } from './context/UserContext';
import Login from './components/login/Login';
import Register from './components/register/Register';
import RecoverAlias from './components/recover/RecoverAlias';
import RecoverTotp from './components/recover/RecoverTotp';
import Home from './components/home/Home';
import Settings from './components/settings/Settings';
import MyUnit from './components/myunit/MyUnit';
import Shop from './components/shop/Shop';
import Contact from './components/contact/Contact';
import Services from './components/services/Services';
import Checkout from './components/checkout/Checkout';
import MyOrders from './components/orders/MyOrders';
import AdminDashboard from './components/ADMIN/Dashboard/AdminDashboard';
import AdminInventory from './components/ADMIN/Inventory/AdminInventory';
import AdminMaintenance from './components/ADMIN/Maintenance/AdminMaintenance';
import AdminTechnician from './components/ADMIN/Technicians/AdminTechnician';
import AdminReoder from './components/ADMIN/Reorder/AdminReoder';
import AdminProfile from './components/ADMIN/Profile/AdminProfile';
import AdminAttendance from './components/ADMIN/Attendance/AdminAttendance';
import AdminUnlockUsers from './components/ADMIN/Users/AdminUnlockUsers';
import TechMainScreen from './components/TECH/Dashboard/TechMainScreen';
import TaskScreens from './components/TECH/Tasks/TaskScreens';
import TaskDetails from './components/TECH/Tasks/TaskDetails';
import ProfileTechnicianScreen from './components/TECH/Profile/ProfileTechnicianScreen';
import TechEditProfile from './components/TECH/Profile/TechEditProfile';
import SuperAdminDashboard from './components/SUPERADMIN/Dashboard/SuperAdminDashboard';
import SuperAdminBranches from './components/SUPERADMIN/Dashboard/SuperAdminBranches';
import SuperAdminAttendance from './components/SUPERADMIN/Dashboard/SuperAdminAttendance';
import SuperAdminSales from './components/SUPERADMIN/Dashboard/SuperAdminSales';
import SuperAdminInventory from './components/SUPERADMIN/Dashboard/SuperAdminInventory';
import SuperAdminTasks from './components/SUPERADMIN/Dashboard/SuperAdminTasks';
import SuperAdminAlerts from './components/SUPERADMIN/Dashboard/SuperAdminAlerts';
import GlobalDialog from './components/common/GlobalDialog';
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

      <Route path="/recover/alias" element={<RecoverAlias />} />
      <Route path="/recover/totp" element={<RecoverTotp />} />
      
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
        path="/tech/dashboard"
        element={
          <RoleRoute allowedRoles={['technician']}>
            <TechMainScreen />
          </RoleRoute>
        }
      />
      <Route
        path="/tech/tasks"
        element={
          <RoleRoute allowedRoles={['technician']}>
            <TaskScreens />
          </RoleRoute>
        }
      />
      <Route
        path="/tech/tasks/:taskId"
        element={
          <RoleRoute allowedRoles={['technician']}>
            <TaskDetails />
          </RoleRoute>
        }
      />
      <Route
        path="/tech/profile"
        element={
          <RoleRoute allowedRoles={['technician']}>
            <ProfileTechnicianScreen />
          </RoleRoute>
        }
      />
      <Route
        path="/tech/profile/edit"
        element={
          <RoleRoute allowedRoles={['technician']}>
            <TechEditProfile />
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
            <GlobalDialog />
          </div>
        </Router>
      </CartProvider>
    </UserProvider>
  );
}

export default App;