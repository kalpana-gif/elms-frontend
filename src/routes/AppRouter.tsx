import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../layouts/dashboard/Dashboard.tsx';
import AdminPage from '../pages/AdminPage';
import TeacherPage from '../pages/TeacherPage';
import StudentPage from '../pages/StudentPage';
import ParentPage from '../pages/ParentPage';
import Unauthorized from '../pages/Unauthorized';
import ProtectedRoute from './ProtectedRoute.tsx';

const AppRouter = () => (
    <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route
            path="/"
            element={
                <ProtectedRoute allowedRoles={['admin', 'teacher', 'student', 'parent']}>
                    <Dashboard />
                </ProtectedRoute>
            }
        />

        {/*<Route*/}
        {/*    path="/test"*/}
        {/*    element={*/}
        {/*        <ProtectedRoute allowedRoles={['test']}>*/}
        {/*            <Dashboard />*/}
        {/*        </ProtectedRoute>*/}
        {/*    }*/}
        {/*/>*/}

        <Route
            path="/admin"
            element={
                <ProtectedRoute allowedRoles={['admin']}>
                    {/*<AdminPage />*/}
                    <Dashboard />
                </ProtectedRoute>
            }
        />
        <Route
            path="/teacher"
            element={
                <ProtectedRoute allowedRoles={['teacher']}>
                    <Dashboard />
                </ProtectedRoute>
            }
        />
        <Route
            path="/student"
            element={
                <ProtectedRoute allowedRoles={['student']}>
                    <Dashboard />
                </ProtectedRoute>
            }
        />
        <Route
            path="/parent"
            element={
                <ProtectedRoute allowedRoles={['parent']}>
                    <ParentPage />
                </ProtectedRoute>
            }
        />
        <Route path="*" element={<Navigate to="/" />} />
    </Routes>
);

export default AppRouter;
