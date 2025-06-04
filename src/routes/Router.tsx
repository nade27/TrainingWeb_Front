import { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Loadable from 'src/layouts/full/shared/loadable/Loadable';
import ProtectedRoute from '../components/auth/ProtectedRoute';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

// Dashboard
const Dashboard = Loadable(lazy(() => import('../views/dashboards/Dashboard')));

// utilities
const Registered = Loadable(lazy(() => import('../views/tables/Registered')));
const SchsTraining = Loadable(lazy(() => import('../views/tables/SchTraining')));
const Form = Loadable(lazy(() => import('../views/forms/Form')));
const Shadow = Loadable(lazy(() => import('../views/shadows/Shadow')));

// icons
const Solar = Loadable(lazy(() => import('../views/icons/Solar')));

// authentication
const Login = Loadable(lazy(() => import('../views/auth/login/Login')));
const Register = Loadable(lazy(() => import('../views/auth/register/Register')));
const Error = Loadable(lazy(() => import('../views/auth/error/Error')));

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth/login" />} />
      
      {/* Auth Routes */}
      <Route path="/auth" element={<BlankLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <FullLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="registered" element={<Registered />} />
        <Route path="schedule" element={<SchsTraining />} />
        <Route path="form" element={<Form />} />
        <Route path="shadow" element={<Shadow />} />
        <Route path="icons" element={<Solar />} />
      </Route>

      {/* Error Route */}
      <Route path="*" element={<Error />} />
    </Routes>
  );
};

export default AppRoutes;
