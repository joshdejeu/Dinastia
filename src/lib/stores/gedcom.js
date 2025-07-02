// src/lib/stores/gedcom.js
import { writable } from "svelte/store";

// You can store the File object or its parsed text
export const gedcomFile = writable(null);      // stores the File object
export const gedcomText = writable(null);      // optional: store text content