// ❌ DON'T DO THIS HERE:
// import { BrowserRouter as Router } from 'react-router-dom';

import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import AdminPage from '../pages/AdminPage';
import TeacherPage from '../pages/TeacherPage';
import StudentPage from '../pages/StudentPage';
import ParentPage from '../pages/ParentPage';
import Unauthorized from '../pages/Unauthorized';
import ProtectedRoute from '../components/ProtectedRoute';

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

        <Route
            path="/test"
            element={
                <ProtectedRoute allowedRoles={['test']}>
                    <h1>Hi TEST</h1>
                </ProtectedRoute>
            }
        />
        <Route
            path="/admin"
            element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPage />
                </ProtectedRoute>
            }
        />
        <Route
            path="/teacher"
            element={
                <ProtectedRoute allowedRoles={['teacher']}>
                    <TeacherPage />
                </ProtectedRoute>
            }
        />
        <Route
            path="/student"
            element={
                <ProtectedRoute allowedRoles={['student']}>
                    <StudentPage />
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
