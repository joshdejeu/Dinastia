export class GedcomGeoHelper {
    constructor(nodes) {
        this.nodes = nodes;
        this.people = [];
        this.ready = this.buildPeopleFromNodes(); // Promise you can await
    }

    // Words/phrases to discard (non-location noise)
    static noisePhrases = [
        "ancestry family tree",
        "death index",
        "record group",
        "social security",
        "national archives",
        "department",
        "master file",
        "naid",
        "records",
        "index",
        "archives",
        "uscis",
        "u.s.",
        "dept.",
        "office",
        "service",
        "school yearbooks",
        "birthdate",
        "year",
        "record group number",
        "record group title",
        "master file",
        "mentionat",
        "slujit",
        "publication date",
        "publication place",
        "school name"
    ];

    // Location keywords for identifying labeled parts
    static locationLabels = [
        "location",
        "city",
        "state",
        "county",
        "province",
        "country",
        "town",
        "village",
        "parohia",
        "oraș",
        "sat",
        "comuna",
        "județ",
        "provincia",
        "departamento",
        "región",
        "distrikt",
        "gemeinde",
        "ville",
        "stadt",
    ];

    static unwantedLabelPrefixes = [
        "birth county",
        "birth city",
        "death county",
        "death city",
        "school name",
        "place of burial",
        "cemetery",
        "hospital",
    ];

    // Remove noise phrases (case insensitive)
    static isNoise(text) {
        const lower = text.toLowerCase();
        return this.noisePhrases.some(phrase => lower.includes(phrase));
    }

    // Check if text contains location keyword labels
    static containsLocationKeyword(text) {
        const lower = text.toLowerCase();
        return this.locationKeywords.some(keyword => lower.includes(keyword));
    }

    // Simple heuristic: single word place names
    static looksLikePlace(text) {
        // Accept if at least one word is capitalized and is not just an acronym or short code
        const words = text.split(/\s+/);
        // Count words starting with uppercase letter but exclude 2-3 letter uppercase acronyms
        const capWords = words.filter(w => /^[A-ZĂÎÂȘȚ]/.test(w) && !/^[A-Z]{2,3}$/.test(w));
        return capWords.length >= 1;
    }

    // Extract location strings from node entries
    extractLocationStringsFromNode(node) {
        const locations = [];

        node.tree?.forEach(entry => {
            if (entry.tag === "RESI" && entry.data) {
                // Remove prefix like "Something Location:"
                let clean = entry.data.replace(/^.*Location:\s*/i, "").trim();
                if (clean.length > 0) locations.push(clean);
            }

            if (entry.tag === "SOUR" && Array.isArray(entry.tree)) {
                entry.tree.forEach(sub => {
                    if (sub.tag === "PAGE" && sub.data) locations.push(sub.data.trim());
                });
            }
        });

        return locations;
    }

    // Extract and clean location parts from a raw text string
    extractMultipleLocations(rawText) {
        if (!rawText || typeof rawText !== "string") return [];

        // Split on common delimiters
        const parts = rawText.split(/[,;\n]+/).map(p => p.trim()).filter(Boolean);

        const labeledParts = {};
        const unlabeled = [];

        for (const part of parts) {
            let matchedKey = null;
            const lowerPart = part.toLowerCase();

            // Skip if it matches any noise phrase
            if (GedcomGeoHelper.isNoise(part)) continue;

            // Check for and strip unwanted label prefixes
            const unwantedPrefix = GedcomGeoHelper.unwantedLabelPrefixes.find(prefix => lowerPart.startsWith(prefix + ":"));
            if (unwantedPrefix) {
                const stripped = part.split(":").slice(1).join(":").trim();
                if (stripped.length >= 3) {
                    unlabeled.push(stripped);
                }
                continue;
            }

            // Standard labeled key check
            for (const key of GedcomGeoHelper.locationLabels) {
                const regex = new RegExp(`^${key.toLowerCase()}:\\s*(.+)`, "i");
                const match = part.toLowerCase().match(regex);
                if (match && match[1]) {
                    const value = part.split(":").slice(1).join(":").trim();
                    labeledParts[key.toLowerCase()] = value;
                    matchedKey = key;
                    break;
                }
            }

            // Fallbacks — handle short uppercase strings like AR, MO, USA, *after* the loop
            if (!matchedKey) {
                if (part.toLowerCase().startsWith("url:") || part.toLowerCase().startsWith("http")) {
                    console.log("Dropped potential location:", part);
                    continue;  // silently ignore URL strings
                }
                // Filter date-like strings (year ranges, with optional spaces/dashes)
                if (/^\d{4}\s*[-–—]?\s*(\d{2,4})?$/.test(part.trim()) ||
                    /^mo\.?\s*\d{4}[-–—]\d{4}$/i.test(part.trim())) {
                    console.log("Dropped potential location:", part);
                    continue;
                }
                if (/^[A-Z]{2,3}$/.test(part.toUpperCase())) {
                    unlabeled.push(part);
                } else if (GedcomGeoHelper.looksLikePlace(part)) {
                    unlabeled.push(part);
                } else {
                    // If it is not a URL, date, acronym, or looksLikePlace, log drop here
                    console.log("Dropped potential location:", part);
                }
            }
        }


        // Combine labeled parts in a standard order (city, state, country, etc.)
        const combinedLocations = [];
        if (Object.keys(labeledParts).length > 0) {
            const order = [
                "city", "state", "county", "province", "country",
                "town", "village", "location", "parohia",
            ];
            const combined = order
                .filter(k => labeledParts[k])
                .map(k => labeledParts[k])
                .join(", ");
            if (combined.length > 0) combinedLocations.push(combined);
        }

        // Add any unlabeled plausible locations
        combinedLocations.push(...unlabeled);

        return combinedLocations;
    }

    // (Optional) Geocode a location string via OpenStreetMap Nominatim
    async geocodeLocation(location) {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;
        const response = await fetch(url);
        const results = await response.json();
        if (results.length > 0) {
            return {
                lat: parseFloat(results[0].lat),
                lng: parseFloat(results[0].lon),
            };
        }
        return null;
    }

    // Build array of people with geocoded locations (lat/lng)
    async buildPeopleFromNodes(nodes = this.nodes) {
        const people = [];

        for (const node of nodes) {
            const rawLocations = this.extractLocationStringsFromNode(node);

            for (const rawLoc of rawLocations) {
                const cleanedLocations = this.extractMultipleLocations(rawLoc);

                for (const loc of cleanedLocations) {
                    if (!loc || loc.length < 3) continue;

                    // For testing, skip geocoding:
                    people.push({
                        name: node.name || "Unknown",
                        id: node.pointer || "Error",
                        lat: 0,
                        lng: 0,
                        data: loc,
                    });

                    break; // only first valid location per rawLoc
                }
            }
        }

        this.people = people;
        return people;
    }
}
