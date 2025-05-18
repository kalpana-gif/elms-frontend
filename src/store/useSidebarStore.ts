// useSidebarStore.ts
import { create } from "zustand";
import { ReactNode } from "react";

interface SidebarState {
    selectedPage: string;
    selectedComponent: ReactNode | null;
    setSelectedPage: (page: string, component: ReactNode) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
    selectedPage: "Dashboard",
    selectedComponent: null,
    setSelectedPage: (page, component) =>
        set({ selectedPage: page, selectedComponent: component }),
}));
