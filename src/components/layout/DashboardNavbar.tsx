// src/components/layout/DashboardNavbar.tsx
import React from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Button,
    Avatar,
    Menu,
    MenuItem,
    useTheme,
    Chip,
    Divider,
    ListItemIcon,
    ListItemText,
    Fade,
    Tooltip,
} from "@mui/material";
import {
    AccountCircle,
    Logout,
    AdminPanelSettings,
    School,
    Person,
} from "@mui/icons-material";
import { useAuthStore } from "../../store/useAuthStore.ts";

const DashboardNavbar: React.FC = () => {
    const { role, username, logout } = useAuthStore();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const theme = useTheme();

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    // Function to get user initials
    const getUserInitials = (name: string): string => {
        if (!name) return "U";
        const words = name.trim().split(" ");
        if (words.length === 1) {
            return words[0].substring(0, 2).toUpperCase();
        }
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    };

    // Get role-specific configurations
    const getRoleConfig = () => {
        switch (role) {
            case "admin":
                return {
                    icon: <AdminPanelSettings />,
                    label: "Admin Panel",
                    color: theme.palette.error.main,
                    chipColor: "error" as const,
                };
            case "teacher":
                return {
                    icon: <School />,
                    label: "Teacher Panel",
                    color: theme.palette.success.main,
                    chipColor: "success" as const,
                };
            default:
                return {
                    icon: <Person />,
                    label: "User Panel",
                    color: theme.palette.primary.main,
                    chipColor: "primary" as const,
                };
        }
    };

    const roleConfig = getRoleConfig();
    const navbarBgGradient = theme.palette.bd_navbar.panelBg;
    const userInitials = getUserInitials(username || "User");

    return (
        <AppBar
            position="static"
            sx={{
                background: navbarBgGradient,
                borderRadius: 2,
                boxShadow: theme.shadows[4],
                backdropFilter: "blur(10px)",
            }}
        >
            <Toolbar sx={{ minHeight: 64, px: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 600,
                            background: "linear-gradient(45deg, #fff, #e3f2fd)",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Dashboard
                    </Typography>

                    {/* Role Badge */}
                    <Chip
                        icon={roleConfig.icon}
                        label={role?.charAt(0).toUpperCase() + role?.slice(1)}
                        color={roleConfig.chipColor}
                        variant="outlined"
                        size="small"
                        sx={{
                            backgroundColor: `${roleConfig.color}15`,
                            borderColor: `${roleConfig.color}50`,
                            color: "white",
                            "& .MuiChip-icon": {
                                color: "white",
                            },
                        }}
                    />
                </Box>

                <Box sx={{ flexGrow: 1 }} />

                {/* Role-specific Panel Button */}
                {(role === "admin" || role === "teacher") && (
                    <Tooltip title={roleConfig.label}>
                        <Button
                            color="inherit"
                            startIcon={roleConfig.icon}
                            sx={{
                                textTransform: "none",
                                fontWeight: 500,
                                mr: 2,
                                borderRadius: 2,
                                px: 2,
                                py: 1,
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                                "&:hover": {
                                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                                    transform: "translateY(-1px)",
                                },
                                transition: "all 0.2s ease-in-out",
                            }}
                        >
                            {roleConfig.label}
                        </Button>
                    </Tooltip>
                )}

                {/* User Avatar Button */}
                <Tooltip title={`${username} (${role})`}>
                    <Box
                        onClick={handleMenu}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            cursor: "pointer",
                            borderRadius: 3,
                            p: 1,
                            "&:hover": {
                                backgroundColor: "rgba(255, 255, 255, 0.1)",
                            },
                            transition: "all 0.2s ease-in-out",
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 40,
                                height: 40,
                                backgroundColor: roleConfig.color,
                                color: "white",
                                fontWeight: 600,
                                fontSize: "1rem",
                                boxShadow: theme.shadows[3],
                                border: "2px solid rgba(255, 255, 255, 0.2)",
                                "&:hover": {
                                    transform: "scale(1.05)",
                                    boxShadow: theme.shadows[6],
                                },
                                transition: "all 0.2s ease-in-out",
                            }}
                        >
                            {userInitials}
                        </Avatar>
                        {/*<Box sx={{ display: { xs: "none", sm: "block" } }}>*/}
                        {/*    <Typography*/}
                        {/*        variant="body2"*/}
                        {/*        sx={{*/}
                        {/*            fontWeight: 500,*/}
                        {/*            color: "white",*/}
                        {/*            maxWidth: 120,*/}
                        {/*            overflow: "hidden",*/}
                        {/*            textOverflow: "ellipsis",*/}
                        {/*            whiteSpace: "nowrap",*/}
                        {/*        }}*/}
                        {/*    >*/}
                        {/*        {username}*/}
                        {/*    </Typography>*/}
                        {/*</Box>*/}
                    </Box>
                </Tooltip>

                {/* Enhanced Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    TransitionComponent={Fade}
                    PaperProps={{
                        sx: {
                            mt: 1,
                            minWidth: 200,
                            borderRadius: 2,
                            boxShadow: theme.shadows[8],
                            "& .MuiMenuItem-root": {
                                borderRadius: 1,
                                mx: 1,
                                my: 0.5,
                            },
                        },
                    }}
                    transformOrigin={{
                        horizontal: "right",
                        vertical: "top",
                    }}
                    anchorOrigin={{
                        horizontal: "right",
                        vertical: "bottom",
                    }}
                >
                    {/* User Info Header */}
                    <Box sx={{ p: 2, backgroundColor: "rgba(0, 0, 0, 0.02)" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Avatar
                                sx={{
                                    width: 32,
                                    height: 32,
                                    backgroundColor: roleConfig.color,
                                    color: "white",
                                    fontSize: "0.875rem",
                                }}
                            >
                                {userInitials}
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                    {username}
                                </Typography>
                                <Chip
                                    label={role?.charAt(0).toUpperCase() + role?.slice(1)}
                                    size="small"
                                    color={roleConfig.chipColor}
                                    variant="outlined"
                                    sx={{ height: 20, fontSize: "0.6875rem" }}
                                />
                            </Box>
                        </Box>
                    </Box>

                    <Divider />

                    {/* Menu Items */}
                    <MenuItem onClick={handleClose} disabled sx={{ opacity: 0.7 }}>
                        <ListItemIcon>
                            <Person fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                            primary={`User: ${username}`}
                            primaryTypographyProps={{ variant: "body2" }}
                        />
                    </MenuItem>

                    <MenuItem onClick={handleClose} disabled sx={{ opacity: 0.7 }}>
                        <ListItemIcon>
                            {roleConfig.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={`Role: ${role?.charAt(0).toUpperCase() + role?.slice(1)}`}
                            primaryTypographyProps={{ variant: "body2" }}
                        />
                    </MenuItem>

                    <Divider sx={{ my: 1 }} />

                    <MenuItem
                        onClick={() => {
                            handleClose();
                            logout();
                        }}
                        sx={{
                            color: theme.palette.error.main,
                            "&:hover": {
                                backgroundColor: `${theme.palette.error.main}10`,
                            },
                        }}
                    >
                        <ListItemIcon>
                            <Logout fontSize="small" sx={{ color: "inherit" }} />
                        </ListItemIcon>
                        <ListItemText
                            primary="Logout"
                            primaryTypographyProps={{
                                variant: "body2",
                                fontWeight: 500
                            }}
                        />
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default DashboardNavbar;