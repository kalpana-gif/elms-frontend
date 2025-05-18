// HeaderToolbar.tsx
import React from "react";
import { Box, Breadcrumbs, Link, Typography } from "@mui/material";
import BadgeIcon from "@mui/icons-material/Badge";
import Chip from "@mui/material/Chip";
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';

interface BreadcrumbItem {
    text: string;
}

interface HeaderToolbarProps {
    breadcrumbTrail: BreadcrumbItem[];
    role: string;
    onBreadcrumbClick: (text: string) => void;
}

const HeaderToolbar: React.FC<HeaderToolbarProps> = ({ breadcrumbTrail, role, onBreadcrumbClick }) => {
    return (
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
                            onClick={() => onBreadcrumbClick(crumb.text)}
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
            <Chip

                label={`Role : ${role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()}`}
                variant="outlined"
                sx={(theme) => {
                    const normalizedRole = role.toLowerCase();
                    const colors = {
                        teacher: theme.palette.info.main,
                        admin: theme.palette.error.main,
                        parent: theme.palette.success.main
                    };

                    const color = colors[normalizedRole] || theme.palette.grey[800];
                    const borderColor = colors[normalizedRole] || theme.palette.grey[500];

                    return {
                        color,
                        borderColor,
                        fontWeight: 600,
                        px: 2,
                        py: 0.5,
                        height: 36,
                        borderRadius: "50px",
                        ".MuiChip-icon": {
                            color,
                            ml: 0.5,
                            mr: -0.5
                        },
                        "& .MuiChip-label": {
                            px: 1
                        }
                    };
                }}
                // icon={<VerifiedUserOutlinedIcon />}
            />



        </Box>
    );
};

export default HeaderToolbar;
