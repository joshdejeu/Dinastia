// src/lib/buildTree.js
// Transforms GEDCOM into nested D3 tree

export function buildTree(people, families, rootId) {
    // console.log(people, families, rootId);
    const seen = new Set();

    function build(id) {
        if (!id || seen.has(id)) return null;
        seen.add(id);

        const person = people[id];
        if (!person) return null;
        // console.log(person)

        const node = {
            id,
            name: person.NAME?.[0]?.replace(/\//g, "") || id,
            sex: person.SEX,
            birth: person.BIRT,
            children: [] // for visualization purposes, "children" means connected people
        };

        // Get the family where this person is a child
        const famId = person.FAMC;
        const fam = families[famId];

        if (fam) {
            // Add father and mother
            const father = build(fam.HUSB);
            const mother = build(fam.WIFE);
            if (father) node.children.push(father);
            if (mother) node.children.push(mother);

            // Add siblings (other children in the same family)
            const siblings = fam.CHIL || [];
            siblings.forEach((siblingId) => {
                if (siblingId !== id) {
                    const sibling = build(siblingId);
                    if (sibling) node.children.push(sibling);
                }
            });
        }

        return node;
    }

    return build(rootId);
}


// Example usage:
// {
//   id: "@I1@",
//   name: "You",
//   sex: "M",
//   birth: "1 JAN 1995",
//   children: [
//     {
//       id: "@I2@",
//       name: "Father",
//       children: [ /* his parents, siblings, etc. */ ]
//     },
//     {
//       id: "@I3@",
//       name: "Mother",
//       children: [ /* her parents, siblings, etc. */ ]
//     },
//     {
//       id: "@I4@",
//       name: "Sibling",
//     }
//   ]
// }
