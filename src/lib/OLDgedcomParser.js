// gedcomParser.js
// gedcom_line:=
// level + delim + [optional_xref_ID] + tag + [optional_line_value] + terminator
/**
 * Parses a GEDCOM 5.5.1 text and returns individuals, families, and the root person id.
 * Handles CONT/CONC and ignores proprietary underscore-prefixed tags.
 * @param {string} gedcomText - raw GEDCOM file content (UTF‑8)
 * @returns {{ people: Object, families: Object, rootId: string|null }}
 */
// OLD use case (birth dates wouldn't appear correctly)
        // parsedData = parseGedcom(gedcomText); // Returns { people, families, root_id }


        // help online https://github.com/oh-kay-blanket/gedcom-d3/blob/master/index.js
export function parseGedcom(gedcomText) {
    const lines = gedcomText.split(/\r?\n/);
    const people = {}, families = {};
    let current = null;
    let lastTag = null;

    const recordRegex = /^(\d+)\s+(@[^@]+@)?\s*([A-Z0-9_]+)(?:\s+(.*))?$/;

    for (const line of lines) {
        const m = recordRegex.exec(line);
        if (!m) continue;

        const [, levelStr, xref, tag, valueRaw] = m;
        const level = parseInt(levelStr, 10);
        const value = valueRaw || '';

        if (tag.startsWith('_')) continue; // Ignore proprietary tags

        if (level === 0) {
            // Start of a new record
            current = { tag, xref, data: { xrefId: xref } };
            lastTag = null;

            if (tag === 'INDI') {
                people[xref] = current.data;
            } else if (tag === 'FAM') {
                families[xref] = current.data;
            } else {
                current = null;
            }
        } else if (current) {
            const obj = current.data;

            if (tag === 'CONC' && lastTag && obj[lastTag]) {
                const lastIndex = obj[lastTag].length - 1;
                obj[lastTag][lastIndex] += value;
            } else if (tag === 'CONT' && lastTag && obj[lastTag]) {
                const lastIndex = obj[lastTag].length - 1;
                obj[lastTag][lastIndex] += '\n' + value;
            } else {
                if (current.tag === 'INDI') {
                    if (!obj[tag]) obj[tag] = [];
                    obj[tag].push(value);
                    lastTag = tag;
                } else if (current.tag === 'FAM') {
                    if (tag === 'HUSB' || tag === 'WIFE') {
                        obj[tag] = value;
                    } else if (tag === 'CHIL') {
                        obj.children = obj.children || [];
                        obj.children.push(value);
                    }
                    lastTag = tag;
                }
            }
        }
    }

    // Find root person — the first individual in the file
    let rootId = null;
    for (const id in people) {
        rootId = id;
        break;
    }

    return { people, families, rootId };
}


// Example usage:
// const fs = require('fs');
// const ged = fs.readFileSync('yourfile.ged', 'utf8');
// console.log(parseGedcom(ged));
