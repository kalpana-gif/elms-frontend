// src/components/layout/Footer.tsx
import React from "react";
import { Box, Typography } from "@mui/material";

const Footer: React.FC = () => {
    return (
        <Box sx={{ py: 2, textAlign: "center", bgcolor: "#f1f1f1" }}>
            <Typography variant="body2">&copy; 2025 My Dashboard App</Typography>
        </Box>
    );
};

export default Footer;