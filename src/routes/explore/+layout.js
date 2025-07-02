import { get } from "svelte/store";
import { gedcomText } from "$lib/stores/gedcom.js";
import { parse } from "gedcom-d3";
import { d3ize } from "$lib/d3ize";

/** @type {import('./$types').LayoutLoad} */
export async function load() {
  const raw = get(gedcomText);

  if (!raw) {
    return {
      treeData: null
    };
  }

  try {
    const parsed = parse(raw);
    const treeData = d3ize(parsed);
    return { treeData };
  } catch (e) {
    console.error("Error parsing GEDCOM:", e);
    return { treeData: null };
  }
}
