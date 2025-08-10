// src/config/routeConfig.ts

import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import GradeIcon from '@mui/icons-material/Grade';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SpeedIcon from '@mui/icons-material/Speed';

import { lazy } from "react";
import {HomeIcon} from "lucide-react";

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
        component: lazy(() => import("../pages/DashboardPage.tsx")),
        path: "/dashboard",
        roles: ["admin", "teacher", "student","parent"],
    },
    // {
    //     text: "Courses",
    //     icon: <SchoolIcon />,
    //     roles: ["admin", "teacher"],
    //     subItems: [
    //         {
    //             text: "All Courses",
    //             icon: <SchoolIcon />,
    //             component: lazy(() => import("../pages/StudentPage")),
    //             path: "/courses",
    //             roles: ["admin", "teacher"],
    //         },
    //         {
    //             text: "Create Course",
    //             icon: <SchoolIcon />,
    //             component: lazy(() => import("../pages/CourseCreatePage.tsx")),
    //             path: "/courses/create",
    //             roles: ["admin"],
    //         },
    //     ],
    // },
    {
        text: "Manage Subject",
        icon: <MenuBookIcon />,
        component: lazy(() => import("../pages/ManageSubjectPage.tsx")),
        path: "/manage-subject",
        roles: ["admin"],
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
        icon: <HomeIcon />,
        component: lazy(() => import("../pages/ClassRoomSetupPage.tsx")),
        path: "/class-room",
        roles: ["admin"],
    },

    {
        text: "Marks Manager",
        icon: <SportsScoreIcon />,
        component: lazy(() => import("../pages/MarkEntryPage.tsx")),
        path: "/marks-manager",
        roles: ["teacher"],
    },
    // {
    //     text: "Settings",
    //     icon: <SettingsIcon />,
    //     component: lazy(() => import("../pages/StudentPage")),
    //     path: "/settings",
    //     roles: ["admin", "teacher"],
    // },
    {
        text: "Marks",
        icon: <GradeIcon />,
        component: lazy(() => import("../pages/MarkListViewPage")),
        path: "/view-mark",
        roles: ["admin", "teacher","student","parent"],
    },
    {
        text: "Notifications",
        icon: <NotificationsIcon />,
        component: lazy(() => import("../pages/NotificationPage.tsx")),
        path: "/notifications",
        roles: ["admin", "teacher","student","parent"],
    },
    {
        text: "Exams",
        icon: <SpeedIcon />,
        component: lazy(() => import("../pages/ExamPage.tsx")),
        path: "/exam",
        roles: ["admin", "teacher","student"],
    },
];
