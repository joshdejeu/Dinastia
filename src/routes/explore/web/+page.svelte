<!-- src/routes/tree/web/+page.svelte -->
<script>
    import { page } from "$app/stores";

    import D3ForceGraph from "./D3ForceGraph.svelte";
    // Access layout-provided data reactively
    $: treeData = $page.data.d3Data;
</script>

{#if treeData}
    <D3ForceGraph nodes={treeData.nodes} links={treeData.links} />
{:else}
    <p>Loading...</p>
{/if}
