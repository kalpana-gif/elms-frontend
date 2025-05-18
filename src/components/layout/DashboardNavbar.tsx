// src/components/layout/DashboardNavbar.tsx
import React from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Button,
    IconButton,
    Menu,
    MenuItem,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import {useAuthStore} from "../../store/useAuthStore.ts";

const DashboardNavbar: React.FC = () => {
    const { role, logout } = useAuthStore();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <AppBar position="static" sx={{background: "radial-gradient(circle, #1a73e8, #1a73e8)",borderRadius: 2,}}>
            <Toolbar>
                <Typography variant="h6">Dashboard</Typography>
                <Box sx={{ flexGrow: 1 }} />
                {role === "admin" && (
                    <Button color="inherit">Admin Panel</Button>
                )}
                {role === "teacher" && (
                    <Button color="inherit">Teacher Panel</Button>
                )}
                <IconButton color="inherit" onClick={handleMenu}>
                    <AccountCircle />
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                    <MenuItem disabled>Role: {role}</MenuItem>
                    <MenuItem onClick={logout}>Logout</MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default DashboardNavbar;