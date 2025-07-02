<!-- src/routes/tree/family/+page.svelte -->
<script>
    export let data;
    const { treeData } = data;

    import TreeView from "./TreeView.svelte";
    // Access layout-provided data reactively
    console.log(treeData);
</script>

{#if treeData}
    <TreeView {treeData} />
{:else}
    <p class="loading-view">Loading...</p>
{/if}
