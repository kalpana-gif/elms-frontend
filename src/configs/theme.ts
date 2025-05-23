// theme.ts
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        primary: {
            main: "#1a73e8",      // Replace with your primary color
            light: "#E3F2FD",     // Light variant
        },
        text: {
            primary: "#000000",
            secondary: "#888888",
        },
        sidebar: {
            mainBg: "#ffffff",
            gradient: "radial-gradient(circle, #ffffff, #1a73e8)",
            panelBg: "linear-gradient(to top, whitesmoke, #ffffff)",
            logoText: "#ffffff",
        },
        bd_navbar:{
            panelBg:  "radial-gradient(circle, #1a73e8, #1a73e8)",
            panelBg:  "#1a73e8",
        }
    },
});

export default theme;
