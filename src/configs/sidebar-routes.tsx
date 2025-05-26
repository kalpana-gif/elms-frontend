// src/config/routeConfig.ts

import DashboardIcon from "@mui/icons-material/Dashboard";
import SchoolIcon from "@mui/icons-material/School";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import RoomPreferencesIcon from '@mui/icons-material/RoomPreferences';
import { lazy } from "react";

export type RouteItem = {
    text: string;
    icon: JSX.Element;
    component?: React.FC;
    roles: string[];
    path?: string;
    subItems?: RouteItem[];
};

export const routeConfig: RouteItem[] = [
    {
        text: "Dashboard",
        icon: <DashboardIcon />,
        component: lazy(() => import("../pages/StudentPage.tsx")),
        path: "/dashboard",
        roles: ["admin", "teacher", "student"],
    },
    {
        text: "Courses",
        icon: <SchoolIcon />,
        roles: ["admin", "teacher"],
        subItems: [
            {
                text: "All Courses",
                icon: <SchoolIcon />,
                component: lazy(() => import("../pages/StudentPage")),
                path: "/courses",
                roles: ["admin", "teacher"],
            },
            {
                text: "Create Course",
                icon: <SchoolIcon />,
                component: lazy(() => import("../pages/CourseCreatePage.tsx")),
                path: "/courses/create",
                roles: ["admin"],
            },
        ],
    },
    {
        text: "Users",
        icon: <GroupIcon />,
        roles: ["admin"],
        subItems: [
            {
                text: "Add User",
                icon: <PersonIcon />,
                component: lazy(() => import("../pages/AddUserPage.tsx")),
                path: "/users/add",
                roles: ["admin"],
            },
            {
                text: "All Users",
                icon: <PersonIcon />,
                component: lazy(() => import("../pages/ManageUserPage.tsx")),
                path: "/users/viewall",
                roles: ["admin"],
            },

            {
                text: "Setup Student",
                icon: <SettingsIcon />,
                component: lazy(() => import("../pages/StudentSetupPage.tsx")),
                path: "/users/setup-student",
                roles: ["admin"],
            },
        ],
    },
    {
        text: "Class Room Setup",
        icon: <RoomPreferencesIcon />,
        component: lazy(() => import("../pages/ClassRoomSetupPage.tsx")),
        path: "/class-room",
        roles: ["admin"],
    },
    {
        text: "Settings",
        icon: <SettingsIcon />,
        component: lazy(() => import("../pages/StudentPage")),
        path: "/settings",
        roles: ["admin", "teacher"],
    },
];
