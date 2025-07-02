<!-- src/routes/tree/web/+page.svelte -->
<script>
    import { page } from "$app/stores";
    export let data;
    const { treeData } = data;

    import D3ForceGraph from "./D3ForceGraph.svelte";
    // Access layout-provided data reactively
</script>

{#if treeData}
    <D3ForceGraph nodes={treeData.nodes} links={treeData.links} />
{:else}
    <p class="loading-view">Loading...</p>
{/if}
