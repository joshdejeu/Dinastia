<!-- src/routes/tree/family/+page.svelte -->
<script>
    import { page } from "$app/stores";

    import TreeView from "./TreeView.svelte";
    // Access layout-provided data reactively
    $: treeData = $page.data.d3Data;
</script>

{#if treeData}
    <TreeView {treeData} />
{:else}
    <p>Loading...</p>
{/if}
