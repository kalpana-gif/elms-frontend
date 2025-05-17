import { Typography, Button, Box } from '@mui/material';
import { useAuth } from '../auth/useAuth';

const Dashboard = () => {
    const { role, logout } = useAuth();

    return (
        <Box p={4}>
            <Typography variant="h4">Dashboard</Typography>
            <Typography mt={2}>Welcome! Your role is <strong>{role}</strong>.</Typography>
            <Button variant="outlined" sx={{ mt: 2 }} onClick={logout}>Logout</Button>
        </Box>
    );
};

export default Dashboard;
