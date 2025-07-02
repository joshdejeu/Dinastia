// src/lib/utils/initSettings.js
import { globalSettingsStore } from "$lib/stores.js";
import { menu_items } from "$lib/menuItems.js";

export function initSettingsFromMenu() {
    const settingsMap = {};

    function recurse(items) {
        for (const item of items) {
            if (item.settings) {
                for (const setting of item.settings) {
                    settingsMap[setting.name] = { ...setting };
                }
            }
            if (item.children) recurse(item.children);
        }
    }

    recurse(menu_items);
    globalSettingsStore.set(settingsMap);
}
