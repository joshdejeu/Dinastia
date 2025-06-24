// gedcomParser.js
// gedcom_line:= level + delim + [optional_xref_ID] + tag + [optional_line_value] + terminator

/**
 * Parses a GEDCOM 5.5.1 text and returns individuals, families, and the root person id.
 * Handles CONT/CONC and ignores proprietary underscore-prefixed tags.
 * @param {string} gedcomText - raw GEDCOM file content (UTF‑8)
 * @returns {{ people: Object, families: Object, rootId: string|null }}
 */
export function parseGedcom(gedcomText) {
    const lines = gedcomText.split(/\r?\n/);
    const people = {}, families = {};
    let current = null;
    let lastTag = null;

    const recordRegex = /^(\d+)\s+(@[^@]+@)?\s*([A-Z0-9_]+)(?:\s+(.*))?$/;

    for (const line of lines) {
        const parsed = parseLine(line, recordRegex);
        if (!parsed) continue;

        const { level, xref, tag, value } = parsed;
        if (tag.startsWith('_')) continue;

        if (level === 0) {
            current = handleNewRecord(tag, xref, people, families);
            lastTag = null;
        } else if (current) {
            const obj = current.data;
            handleSubRecord(current.tag, tag, value, obj, lastTag => (lastTag = tag));
        }
    }

    return { people, families, rootId: findFirstId(people) };
}

function parseLine(line, regex) {
    const m = regex.exec(line);
    if (!m) return null;

    const [, levelStr, xref, tag, valueRaw] = m;
    return {
        level: parseInt(levelStr, 10),
        xref,
        tag,
        value: valueRaw || ''
    };
}

function handleNewRecord(tag, xref, people, families) {
    const current = { tag, xref, data: { xrefId: xref } };

    if (tag === 'INDI') {
        people[xref] = current.data;
    } else if (tag === 'FAM') {
        families[xref] = current.data;
    } else {
        return null;
    }

    return current;
}

function handleSubRecord(recordTag, tag, value, obj, setLastTag) {
    if ((tag === 'CONC' || tag === 'CONT') && obj[lastTag]) {
        const lastIndex = obj[lastTag].length - 1;
        const append = tag === 'CONC' ? value : '\n' + value;
        obj[lastTag][lastIndex] += append;
        return;
    }

    if (recordTag === 'INDI') {
        if (!obj[tag]) obj[tag] = [];
        obj[tag].push(value);
        setLastTag(tag);
    } else if (recordTag === 'FAM') {
        if (tag === 'HUSB' || tag === 'WIFE') {
            obj[tag] = value;
        } else if (tag === 'CHIL') {
            obj.children = obj.children || [];
            obj.children.push(value);
        }
        setLastTag(tag);
    }
}

function findFirstId(map) {
    for (const id in map) return id;
    return null;
}
