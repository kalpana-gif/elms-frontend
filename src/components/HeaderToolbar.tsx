// HeaderToolbar.tsx
import React from "react";
import {
    Box,
    Breadcrumbs,
    Link,
    Typography,
    Chip,
    useTheme
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import SchoolIcon from "@mui/icons-material/School";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import FaceIcon from "@mui/icons-material/Face";

interface BreadcrumbItem {
    text: string;
}

interface HeaderToolbarProps {
    breadcrumbTrail: BreadcrumbItem[];
    role: string;
    onBreadcrumbClick: (text: string) => void;
}

const HeaderToolbar: React.FC<HeaderToolbarProps> = ({
                                                         breadcrumbTrail,
                                                         role,
                                                         onBreadcrumbClick
                                                     }) => {
    const theme = useTheme();
    const normalizedRole = role.toLowerCase();

    const roleConfig: Record<
        string,
        { color: string; icon: JSX.Element; label: string }
    > = {
        teacher: {
            color: theme.palette.info.main,
            icon: <SchoolIcon />,
            label: "Teacher"
        },
        admin: {
            color: theme.palette.error.main,
            icon: <AdminPanelSettingsIcon />,
            label: "Administrator"
        },
        parent: {
            color: theme.palette.success.main,
            icon: <FaceIcon />,
            label: "Parent"
        },
        student: {
            color: theme.palette.warning.main,
            icon: <SchoolIcon />,
            label: "Student"
        }
    };

    const fallback = {
        color: theme.palette.text.primary,
        icon: <VerifiedUserOutlinedIcon />,
        label: role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
    };

    const { color, icon, label } = roleConfig[normalizedRole] || fallback;

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
                padding: theme.spacing(2),
                backgroundColor: theme.palette.background.paper,
                position: "sticky",
                top: 0,
                zIndex: theme.zIndex.appBar
            }}
        >
            {/* Breadcrumbs */}
            <Breadcrumbs
                separator={<NavigateNextIcon fontSize="small" />}
                aria-label="breadcrumb"
                sx={{ fontSize: 14 }}
            >
                {breadcrumbTrail.map((crumb, index) =>
                    index < breadcrumbTrail.length - 1 ? (
                        <Link
                            key={crumb.text}
                            color="inherit"
                            onClick={() => onBreadcrumbClick(crumb.text)}
                            underline="hover"
                            sx={{
                                cursor: "pointer",
                                "&:hover": { color: theme.palette.primary.main }
                            }}
                        >
                            {crumb.text}
                        </Link>
                    ) : (
                        <Typography key={crumb.text} color="text.primary" fontWeight={500}>
                            {crumb.text}
                        </Typography>
                    )
                )}
            </Breadcrumbs>

            {/* Role Chip */}
            {/*<Chip*/}
            {/*    icon={icon}*/}
            {/*    label={`Role: ${label}`}*/}
            {/*    variant="outlined"*/}
            {/*    sx={{*/}
            {/*        color,*/}
            {/*        borderColor: color,*/}
            {/*        fontWeight: 500,*/}
            {/*        height: 36,*/}
            {/*        borderRadius: "20px",*/}
            {/*        backgroundColor: theme.palette.background.default,*/}
            {/*        transition: "all 0.3s ease",*/}
            {/*        "&:hover": {*/}
            {/*            backgroundColor: theme.palette.action.hover,*/}
            {/*            borderColor: theme.palette.primary.main*/}
            {/*        },*/}
            {/*        "& .MuiChip-icon": {*/}
            {/*            color*/}
            {/*        }*/}
            {/*    }}*/}
            {/*/>*/}
        </Box>
    );
};

export default HeaderToolbar;
