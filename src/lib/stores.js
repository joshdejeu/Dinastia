// src/lib/stores.js
// made to share a variable between sibling components in a layout
import { writable } from "svelte/store";

// Flat object like: { "Freeze Nodes": { value: false }, "Day Time": { value: true }, ... }
export const globalSettingsStore = writable({});