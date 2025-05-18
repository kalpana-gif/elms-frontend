import React, { useState, useEffect } from "react";
import {
    Drawer, List, ListItemButton, ListItemIcon, ListItemText,
    Toolbar, Divider, Box, Typography, IconButton, Collapse,
    Tooltip, useMediaQuery, useTheme,
} from "@mui/material";

import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";

import { useSidebarStore } from "../../store/useSidebarStore";
import Logo from "../../assets/react.svg";
import { routeConfig } from "../../configs/sidebar-routes.tsx";
import {useAuthStore} from "../../store/useAuthStore.ts";

// Mock role (Replace with actual user role from auth/context)


const drawerWidth = 350;
const collapsedWidth = 140;

const DashboardSidebar: React.FC = () => {
    const { role } = useAuthStore();
    const currentUserRole = role;

    const { selectedPage, setSelectedPage } = useSidebarStore();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const [isCollapsed, setIsCollapsed] = useState(isSmallScreen);
    const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

    useEffect(() => {
        setIsCollapsed(isSmallScreen);
    }, [isSmallScreen]);

    const toggleDrawer = () => setIsCollapsed(!isCollapsed);

    const handleSubMenuClick = (menu: string) => {
        setOpenSubMenu((prev) => (prev === menu ? null : menu));
    };

    const filteredRoutes = routeConfig.filter((route) =>
        route.roles.includes(currentUserRole)
    );



    // Color variables
    const drawerBgGradient = theme.palette.sidebar.gradient;
    const drawerContentBg = theme.palette.sidebar.panelBg;
    const selectedTextColor = theme.palette.primary.main;
    const selectedBgColor = theme.palette.primary.light;
    const hoverBgColor = theme.palette.primary.light;
    const defaultTextColor = theme.palette.text.primary;
    const secondaryTextColor = theme.palette.text.secondary;
    const whiteTextColor = "#fff";

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: isCollapsed ? collapsedWidth : drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: {
                    width: isCollapsed ? collapsedWidth : drawerWidth,
                    transition: "width 0.3s",
                    boxSizing: "border-box",
                    background: drawerBgGradient,
                    overflow: "hidden",
                },
            }}
        >
            <Toolbar
                sx={{
                    justifyContent: isCollapsed ? "center" : "space-between",
                    minHeight: "60px !important",
                    marginTop: 2,
                    px: 6,
                    borderRadius: 2,
                    backgroundColor: drawerBgGradient,
                }}
            >
                {!isCollapsed && (
                    <Box display="flex" alignItems="center" gap={1}>
                        <img src={Logo} alt="Logo" width={32} height={32} />
                        <Typography variant="h6" noWrap sx={{ color: whiteTextColor }}>
                            DMMS
                        </Typography>
                    </Box>
                )}
                <IconButton onClick={toggleDrawer} sx={{ color: whiteTextColor }}>
                    {isCollapsed ? <MenuIcon /> : <MenuOpenIcon />}
                </IconButton>
            </Toolbar>

            <Box sx={{ p: 2 }}>
                <Box
                    sx={{
                        overflowY: "auto",
                        height: "calc(100vh - 64px - 32px)",
                        background: drawerContentBg,
                        borderRadius: 2,
                        p: 1,
                        boxShadow: "inset 0 0 4px rgba(0,0,0,0.05)",
                    }}
                >
                    <List sx={{ mt: 2 }}>
                        {!isCollapsed && (
                            <Typography
                                variant="caption"
                                sx={{ pl: 2, pb: 1, color: secondaryTextColor, fontWeight: 600 }}
                            >
                                MAIN MENU
                            </Typography>
                        )}
                        <Divider sx={{ my: 1 }} />
                        <br />

                        {filteredRoutes.map((item) => {
                            const hasSubItems = item.subItems && item.subItems.length > 0;

                            return (
                                <React.Fragment key={item.text}>
                                    <Tooltip title={isCollapsed ? item.text : ""} placement="right" arrow>
                                        <ListItemButton
                                            selected={selectedPage === item.text}
                                            onClick={() =>
                                                hasSubItems
                                                    ? handleSubMenuClick(item.text)
                                                    : item.component &&
                                                    setSelectedPage(item.text, <item.component />)
                                            }
                                            sx={{
                                                mx: 1,
                                                mb: 1,
                                                borderRadius: 2,
                                                color: selectedPage === item.text
                                                    ? selectedTextColor
                                                    : defaultTextColor,
                                                backgroundColor: selectedPage === item.text
                                                    ? selectedBgColor
                                                    : "transparent",
                                                "&:hover": {
                                                    backgroundColor: hoverBgColor,
                                                },
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    color: selectedPage === item.text
                                                        ? selectedTextColor
                                                        : secondaryTextColor,
                                                    minWidth: 36,
                                                    justifyContent: "center",
                                                }}
                                            >
                                                {item.icon}
                                            </ListItemIcon>
                                            {!isCollapsed && (
                                                <>
                                                    <ListItemText primary={item.text} />
                                                    {hasSubItems &&
                                                        (openSubMenu === item.text ? <ExpandLess /> : <ExpandMore />)}
                                                </>
                                            )}
                                        </ListItemButton>
                                    </Tooltip>

                                    {hasSubItems && !isCollapsed && (
                                        <Collapse in={openSubMenu === item.text} timeout="auto" unmountOnExit>
                                            <List component="div" disablePadding>
                                                {item.subItems
                                                    .filter((sub) => sub.roles.includes(currentUserRole))
                                                    .map((subItem) => (
                                                        <ListItemButton
                                                            key={subItem.text}
                                                            onClick={() =>
                                                                subItem.component &&
                                                                setSelectedPage(subItem.text, <subItem.component />)
                                                            }
                                                            selected={selectedPage === subItem.text}
                                                            sx={{
                                                                pl: 6,
                                                                mx: 1,
                                                                mb: 1,
                                                                borderRadius: 2,
                                                                backgroundColor: selectedPage === subItem.text
                                                                    ? selectedBgColor
                                                                    : "transparent",
                                                                "&:hover": {
                                                                    backgroundColor: hoverBgColor,
                                                                },
                                                            }}
                                                        >
                                                            <ListItemText
                                                                primary={subItem.text}
                                                                sx={{
                                                                    color: selectedPage === subItem.text
                                                                        ? selectedTextColor
                                                                        : defaultTextColor,
                                                                }}
                                                            />
                                                        </ListItemButton>
                                                    ))}
                                            </List>
                                        </Collapse>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </List>
                </Box>
            </Box>
        </Drawer>
    );
};


export default DashboardSidebar;
