import React, { useState, useEffect } from "react";
import {
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Divider,
    Box,
    Typography,
    IconButton,
    Collapse,
    Tooltip,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import BarChartIcon from "@mui/icons-material/BarChart";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";

import { useSidebarStore } from "../../store/useSidebarStore";
import Logo from "../../assets/react.svg";
import StudentPage from "../../pages/StudentPage";

const drawerWidth = 350;
const collapsedWidth = 140;

// Dummy components
const MonthlyReportPage = () => <div>Monthly Report</div>;
const AnnualReportPage = () => <div>Annual Report</div>;
const ProfilePage = () => <div>Profile</div>;
const PreferencesPage = () => <div>Preferences</div>;

const DashboardSidebar: React.FC = () => {
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

    const menuItems = [
        {
            text: "Dashboard",
            icon: <DashboardIcon />,
            component: <StudentPage />,
        },
        {
            text: "Reports",
            icon: <BarChartIcon />,
            subItems: [
                { text: "Monthly Report", component: <MonthlyReportPage /> },
                { text: "Annual Report", component: <AnnualReportPage /> },
            ],
        },
        {
            text: "Settings",
            icon: <SettingsIcon />,
            subItems: [
                { text: "Profile", component: <ProfilePage /> },
                { text: "Preferences", component: <PreferencesPage /> },
            ],
        },
    ];

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
                    background: "radial-gradient(circle, #ffffff, #1a73e8)",
                    borderRight: "1px solid #e0e0e0",
                    overflow: "hidden",
                },
            }}
        >
            <Toolbar
                sx={{
                    justifyContent: isCollapsed ? "center" : "space-between",
                    minHeight: "55px !important",
                    backgroundColor: "1a73e8",
                    borderBottom: "0px solid #e0e0e0",
                    marginTop:2,
                    px: 2,
                }}
            >
                {!isCollapsed && (
                    <Box display="flex" alignItems="center" gap={1}>
                        <img src={Logo} alt="Logo" width={32} height={32} />
                        <Typography variant="h6" noWrap  sx={{ color: (theme) => theme.palette.common.white }}>
                            SLMS
                        </Typography>
                    </Box>
                )}
                <IconButton onClick={toggleDrawer} sx={{ color: (theme) => theme.palette.common.white }}>
                    {isCollapsed ? <MenuIcon /> : <MenuOpenIcon />}
                </IconButton>
            </Toolbar>

            <Box sx={{ p: 2 }}>
                <Box
                    sx={{
                        overflowY: "auto",
                        height: "calc(100vh - 64px - 32px)", // Adjust height to avoid overflow
                        background: "linear-gradient(to top, whitesmoke, #ffffff)",
                        borderRadius: 2,
                        p: 1,
                        boxShadow: "inset 0 0 4px rgba(0,0,0,0.05)",

                    }}
                >

                    <List sx={{ mt: 2 }}>
                        {!isCollapsed && (
                            <Typography
                                variant="caption"
                                sx={{ pl: 2, pb: 1, mb: 0, color: "text.secondary", fontWeight: 600 }}
                            >
                                MAIN MENU
                            </Typography>
                        )}

                        <Divider sx={{ my: 1 }} variant="middle" component="li" />
                        <br/>

                        {menuItems.map((item) => (
                            <React.Fragment key={item.text}>
                                <Tooltip title={isCollapsed ? item.text : ""} placement="right" arrow>
                                    <ListItemButton
                                        selected={selectedPage === item.text}
                                        onClick={() =>
                                            item.subItems
                                                ? handleSubMenuClick(item.text)
                                                : setSelectedPage(item.text, item.component)
                                        }
                                        sx={{
                                            mx: 1,
                                            mb: 1,
                                            borderRadius: 2,
                                            color: selectedPage === item.text ? "primary.main" : "text.primary",
                                            backgroundColor: selectedPage === item.text ? "primary.light" : "transparent",
                                            "&:hover": {
                                                backgroundColor: "primary.light",
                                            },
                                        }}
                                    >
                                        <ListItemIcon
                                            sx={{
                                                color:
                                                    selectedPage === item.text
                                                        ? "primary.main"
                                                        : "text.secondary",
                                                minWidth: 36,
                                                justifyContent: "center",
                                            }}
                                        >
                                            {item.icon}
                                        </ListItemIcon>
                                        {!isCollapsed && (
                                            <>
                                                <ListItemText primary={item.text} />
                                                {item.subItems &&
                                                    (openSubMenu === item.text ? <ExpandLess /> : <ExpandMore />)}
                                            </>
                                        )}
                                    </ListItemButton>
                                </Tooltip>

                                {item.subItems && !isCollapsed && (
                                    <Collapse in={openSubMenu === item.text} timeout="auto" unmountOnExit>
                                        <List component="div" disablePadding>
                                            {item.subItems.map((subItem) => (
                                                <ListItemButton
                                                    key={subItem.text}
                                                    onClick={() =>
                                                        setSelectedPage(subItem.text, subItem.component)
                                                    }
                                                    selected={selectedPage === subItem.text}
                                                    sx={{
                                                        pl: 6,
                                                        mx: 1,
                                                        mb: 1,
                                                        borderRadius: 2,
                                                        backgroundColor:
                                                            selectedPage === subItem.text
                                                                ? "primary.light"
                                                                : "transparent",
                                                        "&:hover": {
                                                            backgroundColor: "primary.light",
                                                        },
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={subItem.text}
                                                        sx={{
                                                            color:
                                                                selectedPage === subItem.text
                                                                    ? "primary.main"
                                                                    : "text.primary",
                                                        }}
                                                    />
                                                </ListItemButton>
                                            ))}
                                        </List>
                                    </Collapse>
                                )}
                            </React.Fragment>
                        ))}
                    </List>

                    {/*<Divider sx={{ my: 2 }} />*/}

                    {/*<List>*/}
                    {/*    {!isCollapsed && (*/}
                    {/*        <Typography*/}
                    {/*            variant="caption"*/}
                    {/*            sx={{ pl: 2, pb: 1, color: "text.secondary", fontWeight: 600 }}*/}
                    {/*        >*/}
                    {/*            SUPPORT*/}
                    {/*        </Typography>*/}
                    {/*    )}*/}
                    {/*    <Tooltip title={isCollapsed ? "Help & Support" : ""} placement="right" arrow>*/}
                    {/*        <ListItemButton*/}
                    {/*            onClick={() => window.open("https://support.example.com", "_blank")}*/}
                    {/*            sx={{*/}
                    {/*                mx: 1,*/}
                    {/*                borderRadius: 2,*/}
                    {/*                "&:hover": {*/}
                    {/*                    backgroundColor: "primary.light",*/}
                    {/*                },*/}
                    {/*            }}*/}
                    {/*        >*/}
                    {/*            <ListItemIcon sx={{ minWidth: 36, justifyContent: "center" }}>*/}
                    {/*                <HelpOutlineIcon />*/}
                    {/*            </ListItemIcon>*/}
                    {/*            {!isCollapsed && <ListItemText primary="Help & Support" />}*/}
                    {/*        </ListItemButton>*/}
                    {/*    </Tooltip>*/}
                    {/*</List>*/}
                </Box>
            </Box>
        </Drawer>
    );
};

export default DashboardSidebar;
