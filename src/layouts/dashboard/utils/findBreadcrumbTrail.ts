import type { RouteItem } from "../../configs/sidebar-routes";

export function findBreadcrumbTrail(
    routes: RouteItem[],
    selectedText: string
): { text: string }[] | null {
    for (const route of routes) {
        if (route.text === selectedText) {
            return [{ text: route.text }];
        }

        if (route.subItems) {
            for (const sub of route.subItems) {
                if (sub.text === selectedText) {
                    return [{ text: route.text }, { text: sub.text }];
                }
            }
        }
    }

    return null;
}
