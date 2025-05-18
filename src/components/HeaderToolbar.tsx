// HeaderToolbar.tsx
import React from "react";
import { Box, Breadcrumbs, Link, Typography } from "@mui/material";
import BadgeIcon from "@mui/icons-material/Badge";

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
    );
};

export default HeaderToolbar;
