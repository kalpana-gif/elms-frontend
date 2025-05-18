// src/components/layout/DashboardLayout.tsx
import React, { ReactNode } from "react";
import { Box } from "@mui/material";
import DashboardNavbar from "./DashboardNavbar";
import DashboardSidebar from "./DashboardSidebar";
import Footer from "./Footer";

interface Props {
    children: ReactNode;
}

const DashboardLayout: React.FC<Props> = ({ children }) => {
    return (
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
            <DashboardSidebar />
            <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                <DashboardNavbar />
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                    {children}
                </Box>
                {/*<Footer />*/}
            </Box>
        </Box>
    );
};

export default DashboardLayout;