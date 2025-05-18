import { Typography, Button, Box } from "@mui/material";
import { useAuthStore } from "../../store/useAuthStore.ts";
import DashboardContent from "./DashboardContent.tsx";

const Dashboard = () => {
    const { role } = useAuthStore();
    return (
        <div><DashboardContent role={role} /></div>
    );
};

export default Dashboard;
