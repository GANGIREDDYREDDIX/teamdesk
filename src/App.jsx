import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import { StoreProvider } from './contexts/StoreContext.jsx'
import { ToastProvider } from './contexts/ToastContext.jsx'

// Auth pages
import Login from './pages/auth/Login.jsx'
import ResetPassword from './pages/auth/ResetPassword.jsx'
import InitialSetup from './pages/auth/InitialSetup.jsx'

// Layout
import AppShell from './components/layout/AppShell.jsx'

// Head pages
import HeadDashboard from './pages/head/Dashboard.jsx'
import EmployeesPage from './pages/head/Employees.jsx'
import DepartmentsPage from './pages/head/Departments.jsx'

// Employee pages
import EmployeeDashboard from './pages/employee/Dashboard.jsx'

// Shared pages
import TaskDetail from './pages/TaskDetail.jsx'
import Settings from './pages/Settings.jsx'
import NotFound from './pages/NotFound.jsx'

function ProtectedRoute({ children, requireHead = false }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100dvh' }}>
        <div className="spinner" style={{ width:32, height:32 }} />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (requireHead && user.role !== 'head') return <Navigate to="/my-tasks" replace />

  return children
}

function RedirectIfAuthed({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to={user.role === 'head' ? '/dashboard' : '/my-tasks'} replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <ToastProvider>
          <a href="#main-content" className="skip-link">Skip to main content</a>
          <Routes>
            {/* Public auth routes */}
            <Route path="/login" element={<RedirectIfAuthed><Login /></RedirectIfAuthed>} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/setup" element={<InitialSetup />} />

            {/* Protected app routes */}
            <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
              {/* Head-only routes */}
              <Route path="/dashboard"   element={<ProtectedRoute requireHead><HeadDashboard /></ProtectedRoute>} />
              <Route path="/employees"   element={<ProtectedRoute requireHead><EmployeesPage /></ProtectedRoute>} />
              <Route path="/departments" element={<ProtectedRoute requireHead><DepartmentsPage /></ProtectedRoute>} />

              {/* Employee routes */}
              <Route path="/my-tasks" element={<EmployeeDashboard />} />

              {/* Shared */}
              <Route path="/tasks/:id" element={<TaskDetail />} />
              <Route path="/settings"  element={<Settings />} />

              {/* Default redirect */}
              <Route index element={<RoleRedirect />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </StoreProvider>
    </AuthProvider>
  )
}

function RoleRedirect() {
  const { user } = useAuth()
  return <Navigate to={user?.role === 'head' ? '/dashboard' : '/my-tasks'} replace />
}
