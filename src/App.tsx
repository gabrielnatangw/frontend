import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { QueryProvider } from './lib/providers/query-provider';
import { NotificationProvider } from './lib/providers/notification-provider';
import { EnvDebug } from './components/debug/EnvDebug';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import PtracePage from './pages/p-trace/Ptrace';
import ModulesPage from './pages/p-trace/modules';
import NewModulePage from './pages/p-trace/modules/new';
import EditModulePage from './pages/p-trace/modules/[id]';
import SensorsPage from './pages/p-trace/sensors';
import NewAnalogSensorPage from './pages/p-trace/sensors/new-analog';
import NewDigitalSensorPage from './pages/p-trace/sensors/new-digital';
import EditAnalogSensorPage from './pages/p-trace/sensors/[id]-analog';
import EditDigitalSensorPage from './pages/p-trace/sensors/[id]-digital';
import MeasurementUnitsPage from './pages/p-trace/settings/measurement-unit';

// Profile Pages
import ProfilePage from './pages/profile';
import ProfileEditPage from './pages/profile/edit';
import ProfilePasswordPage from './pages/profile/password';

// Help Center Pages
import HelpCenterPage from './pages/help-center/index';
import ThemePage from './pages/help-center/theme/[id]';
import VideoPage from './pages/help-center/video/[id]';
import { PermissionTest } from './components/test/PermissionTest';

// Admin Pages
import AdminDashboard from './pages/admin/index';
import RolesDashboard from './pages/admin/roles/index';
import NewRolePage from './pages/admin/roles/new';
import EditRolePage from './pages/admin/roles/[id]';
import RolePermissionsPage from './pages/admin/roles/[id]/permissions';
import UsersDashboard from './pages/admin/users/index';
import NewUserPage from './pages/admin/users/new';
import EditUserPage from './pages/admin/users/[id]';
import UserRolesPage from './pages/admin/users/[id]/roles';
import AuditPage from './pages/admin/audit/index';
import TenantsDashboard from './pages/admin/tenants/index';
import NewTenantPage from './pages/admin/tenants/new';
import ViewTenantPage from './pages/admin/tenants/[id]';
import EditTenantPage from './pages/admin/tenants/[id]/edit';

// Layouts
import PtraceLayout from './components/layout/PtraceLayout';

// Hooks
import { useAuth, useAuthErrorInterceptor } from './components';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to='/auth/login' replace />;
  }

  return <>{children}</>;
}

// App Routes
function AppRoutes() {
  // Interceptor de erros de autenticação
  useAuthErrorInterceptor();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<Home />} />
        <Route path='/auth/login' element={<Login />} />

        {/* Protected Routes */}
        <Route
          path='/p-trace'
          element={
            <ProtectedRoute>
              <PtracePage />
            </ProtectedRoute>
          }
        />

        {/* Módulos Routes com PtraceLayout */}
        <Route
          path='/p-trace/modules'
          element={
            <ProtectedRoute>
              <PtraceLayout>
                <ModulesPage />
              </PtraceLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/p-trace/modules/new'
          element={
            <ProtectedRoute>
              <PtraceLayout>
                <NewModulePage />
              </PtraceLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/p-trace/modules/:id'
          element={
            <ProtectedRoute>
              <PtraceLayout>
                <EditModulePage />
              </PtraceLayout>
            </ProtectedRoute>
          }
        />

        {/* Sensores Routes com PtraceLayout */}
        <Route
          path='/p-trace/sensors'
          element={
            <ProtectedRoute>
              <PtraceLayout>
                <SensorsPage />
              </PtraceLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/p-trace/sensors/new-analog'
          element={
            <ProtectedRoute>
              <PtraceLayout>
                <NewAnalogSensorPage />
              </PtraceLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/p-trace/sensors/new-digital'
          element={
            <ProtectedRoute>
              <PtraceLayout>
                <NewDigitalSensorPage />
              </PtraceLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/p-trace/sensors/analog/:id'
          element={
            <ProtectedRoute>
              <PtraceLayout>
                <EditAnalogSensorPage />
              </PtraceLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/p-trace/sensors/digital/:id'
          element={
            <ProtectedRoute>
              <PtraceLayout>
                <EditDigitalSensorPage />
              </PtraceLayout>
            </ProtectedRoute>
          }
        />

        {/* Configurações Routes com PtraceLayout */}
        <Route
          path='/p-trace/settings/measurement-unit'
          element={
            <ProtectedRoute>
              <PtraceLayout>
                <MeasurementUnitsPage />
              </PtraceLayout>
            </ProtectedRoute>
          }
        />

        {/* Profile Routes */}
        <Route
          path='/p-trace/profile'
          element={
            <ProtectedRoute>
              <PtraceLayout>
                <ProfilePage />
              </PtraceLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/p-trace/profile/edit'
          element={
            <ProtectedRoute>
              <PtraceLayout>
                <ProfileEditPage />
              </PtraceLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/p-trace/profile/password'
          element={
            <ProtectedRoute>
              <PtraceLayout>
                <ProfilePasswordPage />
              </PtraceLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes com PtraceLayout */}
        <Route
          path='/admin'
          element={
            <ProtectedRoute>
              <PtraceLayout>
                <AdminDashboard />
              </PtraceLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/roles'
          element={
            <ProtectedRoute>
              <PtraceLayout>
                <RolesDashboard />
              </PtraceLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/roles/new'
          element={
            <ProtectedRoute>
              <PtraceLayout>
                <NewRolePage />
              </PtraceLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/roles/:id'
          element={
            <ProtectedRoute>
              <PtraceLayout>
                <EditRolePage />
              </PtraceLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/roles/:id/permissions'
          element={
            <ProtectedRoute>
              <PtraceLayout>
                <RolePermissionsPage />
              </PtraceLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/users'
          element={
            <ProtectedRoute>
              <PtraceLayout>
                <UsersDashboard />
              </PtraceLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/users/new'
          element={
            <ProtectedRoute>
              <PtraceLayout>
                <NewUserPage />
              </PtraceLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/users/:id'
          element={
            <ProtectedRoute>
              <PtraceLayout>
                <EditUserPage />
              </PtraceLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/users/:id/roles'
          element={
            <ProtectedRoute>
              <PtraceLayout>
                <UserRolesPage />
              </PtraceLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/audit'
          element={
            <ProtectedRoute>
              <PtraceLayout>
                <AuditPage />
              </PtraceLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/tenants'
          element={
            <ProtectedRoute>
              <PtraceLayout>
                <TenantsDashboard />
              </PtraceLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/tenants/new'
          element={
            <ProtectedRoute>
              <PtraceLayout>
                <NewTenantPage />
              </PtraceLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/tenants/:id'
          element={
            <ProtectedRoute>
              <PtraceLayout>
                <ViewTenantPage />
              </PtraceLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/tenants/:id/edit'
          element={
            <ProtectedRoute>
              <PtraceLayout>
                <EditTenantPage />
              </PtraceLayout>
            </ProtectedRoute>
          }
        />

        {/* Help Center Routes */}
        <Route
          path='/help-center'
          element={
            <ProtectedRoute>
              <HelpCenterPage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/help-center/theme/:id'
          element={
            <ProtectedRoute>
              <ThemePage />
            </ProtectedRoute>
          }
        />
        <Route
          path='/help-center/video/:id'
          element={
            <ProtectedRoute>
              <VideoPage />
            </ProtectedRoute>
          }
        />

        {/* Test Routes */}
        <Route
          path='/test/permissions'
          element={
            <ProtectedRoute>
              <PermissionTest />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </Router>
  );
}

// Main App Component
function App() {
  return (
    <QueryProvider>
      <NotificationProvider>
        <AppRoutes />
        <EnvDebug />
      </NotificationProvider>
    </QueryProvider>
  );
}

export default App;
