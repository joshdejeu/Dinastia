<script>
    import { page } from "$app/stores";
    import Graph3DView from "./Graph3DView.svelte";

    export let data;
    const { treeData } = data;
</script>

{#if treeData}
    <Graph3DView nodes={treeData.nodes} links={treeData.links} />
{:else}
    <p class="loading-view">Loading...</p>
{/if}
