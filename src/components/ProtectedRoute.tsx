import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const ProtectedRoute = ({
                            children,
                            allowedRoles,
                        }: {
    children: JSX.Element;
    allowedRoles: string[];
}) => {
    const role = useAuthStore((state) => state.role);

    if (!role) return <Navigate to="/login" />;
    if (!allowedRoles.includes(role)) return <Navigate to="/unauthorized" />;

    return children;
};

export default ProtectedRoute;
