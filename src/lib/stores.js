// src/lib/stores.js
// made to share a variable between sibling components in a layout
import { writable } from "svelte/store";

// Flat object like: { "Freeze Nodes": { value: false }, "Day Time": { value: true }, ... }
export const globalSettingsStore = writable({});

// Takes an array of { name, value } and populates the store
export function initGlobalSettings(settings = []) {
    globalSettingsStore.update((store) => {
        for (const setting of settings) {
            if (!(setting.name in store)) {
                store[setting.name] = { value: setting.value };
            }
        }
        return store;
    });
}

// Enforce exclusivity between settings
const exclusives = {
    "Day/Night Cycle": ["Static Light Mode"],
    "Static Light Mode": ["Day/Night Cycle"],
    "Vertical": ["Horizontal"],
    "Horizontal": ["Vertical"],
};

export function updateSetting(name, value = null) {
    globalSettingsStore.update((store) => {
        if (store[name]) {
            const current = store[name].value;
            store[name].value = value !== null ? value : !current; // Either a user defined value or the opposite of whatever it's currently

            // Disable exclusive settings
            if (exclusives[name]) {
                exclusives[name].forEach((otherName) => {
                    if (store[otherName]) {
                        store[otherName].value = false;
                    }
                });
            }
        }
        return store;
    });
}

// import { derived } from "svelte/store";
// export const starsSetting = derived(globalSettingsStore, ($s) => $s["Stars"]?.value);
// export const dayNightCycle = derived(globalSettingsStore, ($s) => $s["Day/Night Cycle"]?.value);