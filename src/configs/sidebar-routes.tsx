import DashboardIcon from "@mui/icons-material/Dashboard";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";

import StudentPage from "../pages/StudentPage";
import TeacherPage from "../pages/TeacherPage";

export type RouteItem = {
    text: string;
    icon: JSX.Element;
    component?: React.FC;
    roles: string[];
    subItems?: RouteItem[];
    path?: string;
};

export const routeConfig: RouteItem[] = [
    {
        text: "Dashboard",
        icon: <DashboardIcon />,
        path: "/dashboard",
        component: StudentPage,
        roles: ["admin", "student", "teacher"],
    },
    {
        text: "Reports",
        icon: <BarChartIcon />,
        path: "/reports",
        roles: ["admin", "teacher"],
        subItems: [
            {
                text: "Monthly Report",
                path: "/reports/monthly",
                component: TeacherPage,
                icon: <></>,
                roles: ["admin", "teacher"],
            },
            {
                text: "Annual Report",
                path: "/reports/annual",
                component: StudentPage,
                icon: <></>,
                roles: ["admin"],
            },
        ],
    },
    {
        text: "Settings",
        icon: <SettingsIcon />,
        path: "/settings",
        roles: ["admin"],
        subItems: [
            {
                text: "Profile",
                path: "/settings/profile",
                component: StudentPage,
                icon: <></>,
                roles: ["admin"],
            },
            {
                text: "Preferences",
                path: "/settings/preferences",
                component: StudentPage,
                icon: <></>,
                roles: ["admin"],
            },
        ],
    },
];
