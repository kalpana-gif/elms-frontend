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
            {/*side-bar*/}
            <DashboardSidebar />

            <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>

                {/*upper nav-bar with loging and logout */}
                <DashboardNavbar />

                {/*main content area*/}
                <Box component="main" sx={{ flexGrow: 1, p: 3}}>
                    {children}
                </Box>

                {/*footer section*/}
                {/*<Footer />*/}
            </Box>
        </Box>
    );
};

export default DashboardLayout;