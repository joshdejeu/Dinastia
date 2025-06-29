<script>
    import { page } from "$app/stores";
    import Graph3DView from "./Graph3DView.svelte";

    $: treeData = $page.data.d3Data;
</script>

{#if treeData}
    <Graph3DView nodes={treeData.nodes} links={treeData.links} />
{:else}
    <p class="loading-view">Loading...</p>
{/if}
