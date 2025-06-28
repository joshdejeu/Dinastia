export class FamilyTreeBuilder {
    constructor(nodes, families) {
        this.families = families;
        // Default root = first individual found
        this.root = nodes.find((obj) => obj.tag === 'INDI')?.id || null;
        // === Create a fast lookup table of people by their ID ===
        // This allows us to fetch person info like name, gender, etc. quickly by ID
        this.nodeMap = new Map(nodes.map((n) => [n.id, n]));
        // === Create a mapping: each child ID -> list of their parent IDs ===
        // This is directional: we go from child → parents (not the other way around)
        this.childToParents = new Map();

        this._buildRelationships();
    }

    _buildRelationships() {
        // === Parse each family and record parent-child relationships ===
        for (const fam of this.families) {
            if (!fam.tree) continue; // skip families with no data

            const parents = [];  // HUSB and WIFE tags → biological parents
            const children = []; // CHIL tag → biological children

            for (const entry of fam.tree) {
                // GEDCOM data sometimes stores person IDs in 'pointer', sometimes in 'data'
                const id = entry.pointer?.startsWith("@I")
                    ? entry.pointer
                    : entry.data?.startsWith("@I")
                        ? entry.data
                        : null;

                if (!id) continue; // skip invalid or malformed entries

                // Sort entries into parent or child roles
                if (entry.tag === "HUSB" || entry.tag === "WIFE") {
                    parents.push(id);
                } else if (entry.tag === "CHIL") {
                    children.push(id);
                }
            }

            // For each child, store their parents
            for (const child of children) {
                if (!this.childToParents.has(child)) {
                    this.childToParents.set(child, []);
                }
                this.childToParents.get(child).push(...parents);
            }
        }
    }

    getParentOnlyTree(root = this.root) {
        /**
         * Recursively builds a D3-style tree starting from a person and going *upward* through their ancestors.
         * The recursion follows the childToParents map and stops when no more parents are found.
         *
         * @param {string} currentId - The person we're building the tree from
         * @param {Set} visited - Prevents infinite loops if the tree has cycles (e.g. cousin marriages)
         * @returns {object|null} - A node object with `children` array (used by D3)
         */
        // Arrow functions don't create their own "this", so they inherit the class's context (required for this.nodeMap.get)
        const buildAncestorTree = (currentId, visited = new Set()) => {

            if (visited.has(currentId)) return null; // stop if we’ve already seen this person
            visited.add(currentId);

            const node = this.nodeMap.get(currentId);
            if (!node) return null; // ID doesn’t exist in our people list

            // Lookup this person’s parents (from our earlier map)
            const parentIds = this.childToParents.get(currentId) || [];

            const children = []; // Technically these are parents, but D3 expects them as "children"
            for (const parentId of parentIds) {
                const parentTree = buildAncestorTree(parentId, visited);
                if (parentTree) children.push(parentTree);
            }

            return {
                id: node.id,
                name: node.name,
                gender: node.gender,
                dob: node.dob,
                yod: node.yod,
                children, // IMPORTANT: This is a visual inversion — parents appear as children so D3 lays them out upward
            };
        }

        // Call the recursive tree builder starting from the target person
        return buildAncestorTree(this.root);
    }

}
