import React from "react";
import { routeConfig } from "../../configs/sidebar-routes";
import { useAuthStore } from "../../store/useAuthStore";
import { useSidebarStore } from "../../store/useSidebarStore";
import { Box, Typography, Breadcrumbs, Link } from "@mui/material";
import BadgeIcon from '@mui/icons-material/Badge';
import DashboardLayout from "../../components/layout/DashboardLayout";
import { findBreadcrumbTrail } from "./utils/findBreadcrumbTrail";

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

    return (
        <DashboardLayout>
            <Box py={1} px={1}>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2
                    }}
                >
                    {/* Breadcrumbs on the left */}
                    <Breadcrumbs aria-label="breadcrumb">
                        {breadcrumbTrail.map((crumb, index) =>
                            index < breadcrumbTrail.length - 1 ? (
                                <Link
                                    key={crumb.text}
                                    color="inherit"
                                    onClick={() => {
                                        useSidebarStore.setState({ selectedPage: crumb.text });
                                    }}
                                    underline="hover"
                                    sx={{ cursor: "pointer" }}
                                >
                                    {crumb.text}
                                </Link>
                            ) : (
                                <Typography key={crumb.text} color="text.primary">
                                    {crumb.text}
                                </Typography>
                            )
                        )}
                    </Breadcrumbs>

                    {/* Role on the right */}
                    <Typography
                        variant="subtitle1"
                        sx={{
                            fontWeight: 500,
                            color: "text.secondary",
                            display: "flex",
                            alignItems: "center",
                            gap: 1
                        }}
                    >
                        <BadgeIcon sx={{ fontSize: 20 }} />
                        Role:{" "}
                        <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
                            {role}
                        </Box>
                    </Typography>
                </Box>

                {findComponent(selectedPage)}
            </Box>
        </DashboardLayout>
    );
};

export default DashboardContent;
