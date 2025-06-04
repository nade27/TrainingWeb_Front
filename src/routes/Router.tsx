import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import ProtectedRoute from '../components/auth/ProtectedRoute';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

/* ****Pages***** */
const Dashboard = Loadable(lazy(() => import('../views/dashboards/Dashboard')));

const ScheduleTraining = Loadable(lazy(() => import("../views/tables/SchTraining")))
const Registered = Loadable(lazy(() => import("../views/tables/Registered")))
const MyProfile = Loadable(lazy(() => import('../views/profile/MyProfile'))); 

/* AUTH PAGES */
const Login = Loadable(lazy(() => import('../views/auth/login/Login')));
const Register = Loadable(lazy(() => import('../views/auth/register/Register')));
const Error = Loadable(lazy(() => import('../views/auth/error/Error')));

const AppRoutes = () => {
  const routes = [
    {
      path: '/',
      element: <ProtectedRoute><FullLayout /></ProtectedRoute>,
      children: [
        { path: '/', element: <Navigate to="/dashboard" /> },
        { path: '/dashboard', element: <Dashboard /> },
        { path: '/my-profile', element: <MyProfile /> },
        { path: '/sch-training', element: <ScheduleTraining /> },
        { path: '/registered', element: <Registered /> },
      ],
    },
    {
      path: '/auth',
      element: <BlankLayout />,
      children: [
        { path: 'login', element: <Login /> },
        { path: 'register', element: <Register /> },
      ],
    },
    {
      path: '*',
      element: <BlankLayout />,
      children: [
        { path: '*', element: <Error /> }
      ]
    }
  ];

  return routes;
};

export default AppRoutes;
