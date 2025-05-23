import React from "react";
import { routeConfig } from "../../configs/sidebar-routes";
import { useAuthStore } from "../../store/useAuthStore";
import { useSidebarStore } from "../../store/useSidebarStore";
import { Box, Typography,Container } from "@mui/material";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { findBreadcrumbTrail } from "./utils/findBreadcrumbTrail";
import HeaderToolbar from "../../components/HeaderToolbar.tsx"; // adjust path as needed

const DashboardContent: React.FC = () => {
    const role = useAuthStore((state) => state.role);
    const selectedPage = useSidebarStore((state) => state.selectedPage);

    const breadcrumbTrail = findBreadcrumbTrail(routeConfig, selectedPage) || [];

    const findComponent = (text: string): React.ReactNode => {
        for (const item of routeConfig) {
            if (item.text === text && item.roles.includes(role)) {
                return item.component ? React.createElement(item.component) : null;
            }
            if (item.subItems) {
                for (const sub of item.subItems) {
                    if (sub.text === text && sub.roles.includes(role)) {
                        return sub.component ? React.createElement(sub.component) : null;
                    }
                }
            }
        }
        return <Typography color="error">Unknown Page or Access Denied</Typography>;
    };

    const handleBreadcrumbClick = (text: string) => {
        useSidebarStore.setState({ selectedPage: text });
    };

    return (
        <DashboardLayout>
            <Box py={1} px={1}>
                {/*header with breadcrumb and logger-role chip */}
                <HeaderToolbar
                    breadcrumbTrail={breadcrumbTrail}
                    role={role}
                    onBreadcrumbClick={handleBreadcrumbClick}
                />
                {/*main content area */}
                {/*<Container*/}
                {/*    maxWidth={false}*/}
                {/*    sx={{*/}
                {/*        width: '100%',*/}
                {/*        height: '100%',*/}
                {/*        p: 8,*/}
                {/*        display: 'flex',*/}
                {/*        flexDirection: 'column',*/}
                {/*        backgroundColor: 'background.default',*/}
                {/*        borderRadius: 2,*/}
                {/*        boxShadow: 8*/}
                {/*    }}*/}
                {/*>*/}
                {findComponent(selectedPage)}
                {/*</Container>*/}
            </Box>
        </DashboardLayout>
    );
};

export default DashboardContent;
