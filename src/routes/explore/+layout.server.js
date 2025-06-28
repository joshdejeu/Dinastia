// src/routes/tree/+layout.server.js
import gedcomRaw from '$lib/demo.ged?raw';
import { parse } from "gedcom-d3"; // official parser functions
import { d3ize } from '$lib/d3ize';

// Cache results to avoid re-parsing the same data on every sub-route load
// This is a simple cache, you might want to implement a more robust solution
let cached = null;

// Svelte resolves this before the layout is rendered
// so we can use it to prepare data for each tree component
export async function load() {
    if (!cached) {
        const parsedData = parse(gedcomRaw);
        const d3Data = d3ize(parsedData);
        cached = { d3Data };
    }

    return cached;
}
