import { Typography, Button, Box } from "@mui/material";
import { useAuthStore } from "../store/useAuthStore";
import DashboardContent from "../layouts/dashboard/DashboardContent.tsx";

const Dashboard = () => {
    const { role } = useAuthStore();

    return (
        <div><DashboardContent role={role} /> </div>


        // <Box p={4}>
        //     {/*<Typography mt={2}>*/}
        //     {/*    Welcome! Your role is <strong>{role}</strong>.*/}
        //     {/*</Typography>*/}
        //     {/*<Button variant="outlined" sx={{ mt: 2, mb: 4 }} onClick={logout}>*/}
        //     {/*    Logout*/}
        //     {/*</Button>*/}
        //
        //     {/* Dashboard Widgets / Layout */}
        //
        //
        // </Box>
    );
};

export default Dashboard;
