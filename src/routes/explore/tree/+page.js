export async function load({ parent }) {
    return parent(); // gets all layout data, including treeData
}