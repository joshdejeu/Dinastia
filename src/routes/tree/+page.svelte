<!-- src/routes/tree/+page.svelte -->
<!-- loads file and renders tree -->

<script>
    import { onMount } from "svelte";
    import { parseGedcom } from "$lib/OLDgedcomParser";
    import { buildTree } from "$lib/buildTree";
    import TreeView from "./TreeView.svelte";

    let debug = false; // Set to true to see raw tree data, false to see the rendered tree
    let treeData = null;
    let parsedData = null; // <-- Reactive, while waiting for data to be parsed

    onMount(async () => {
        const gedcomText = await fetch("./demo.ged").then((res) => res.text());

        parsedData = parseGedcom(gedcomText); // Returns { people, families, root_id }
        // console.log(parsedData);

        treeData = buildTree({ ...parsedData });
        // console.log(treeData);
    });

    // The entire tree data structure
    // let testData = {
    //     name: "John Doe",
    //     parents: [
    //         {
    //             name: "Jane Doe",
    //             children: [{ name: "Jack Doe" }, { name: "Jill Doe" }],
    //         },
    //         {
    //             name: "Jim Doe",
    //             children: [{ name: "Jimmy Doe" }],
    //         },
    //     ],
    // };

    // YOU as the start
    // let testData = {
    //     name: "You (Root)",
    //     children: [
    //         {
    //             name: "Father",
    //             children: [
    //                 {
    //                     name: "Paternal Grandfather",
    //                 },
    //                 {
    //                     name: "Paternal Grandmother",
    //                 },
    //             ],
    //         },
    //         {
    //             name: "Mother",
    //             children: [
    //                 {
    //                     name: "Maternal Grandfather",
    //                 },
    //                 {
    //                     name: "Maternal Grandmother",
    //                 },
    //             ],
    //         },
    //         {
    //             name: "Sibling 1",
    //         },
    //         {
    //             name: "Sibling 2",
    //         },
    //     ],
    // };
</script>

<main>
    <div class="tree-wrapper">
        {#if treeData && !debug}
            <div class="tree-info">
                <h1>Family Tree</h1>
            </div>
            <div class="tree-container">
                <TreeView {treeData} rootId={parsedData.rootId} />
            </div>
        {:else if debug && parsedData}
            <h1>Debug mode</h1>
            <p>Parsed GEDCOM people data:</p>
            <!-- <pre>{JSON.stringify(parsedData.people, null, 2)}</pre> -->
        {:else}
            <p>Loading tree...</p>
        {/if}
    </div>
</main>

<style>
    main {
        background-color: var(--bg-color);
        height: 100vh;
    }
    .tree-wrapper {
        width: 100%;
        height: calc(100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    .tree-container {
        width: 95%;
        height: calc(80vh - 2rem - var(--header-height));
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
    }
    .tree-info {
        width: 100%;
        height: 15vh;
        display: flex;
        justify-content: start;
        align-items: center;
    }
    .tree-info h1 {
        margin: 0;
        padding: 0 2em;
        font-size: 2rem;
        color: var(--link-color);
    }
</style>
