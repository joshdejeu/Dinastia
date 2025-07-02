// src/lib/SettingsManager.js
import { globalSettingsStore } from "$lib/stores.js";
import { get } from "svelte/store";

export class SettingsManager {
    static get(name) {
        const store = get(globalSettingsStore);
        return store[name]?.value ?? null;
    }

    static set(name, value) {
        globalSettingsStore.update((store) => {
            if (store[name]) {
                store[name].value = value;
            }
            return store;
        });
    }

    static toggle(name) {
        globalSettingsStore.update((store) => {
            if (store[name]) {
                store[name].value = !store[name].value;
            }
            return store;
        });
    }

    static subscribe(name, callback) {
        return globalSettingsStore.subscribe(($store) => {
            if (name in $store) {
                callback($store[name].value);
            }
        });
    }

    // Advanced: handle exclusives here too
    static setExclusive(name, value) {
        const exclusives = {
            "Day/Night Cycle": ["Static Light Mode"],
            "Static Light Mode": ["Day/Night Cycle"],
            "Vertical": ["Horizontal"],
            "Horizontal": ["Vertical"],
        };

        globalSettingsStore.update((store) => {
            if (store[name]) {
                store[name].value = value;

                if (exclusives[name]) {
                    for (const other of exclusives[name]) {
                        if (store[other]) {
                            store[other].value = false;
                        }
                    }
                }
            }
            return store;
        });
    }
}
