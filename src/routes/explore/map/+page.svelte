<script>
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import Map3DView from "./Map3DView.svelte";

    export let data;
    const { treeData } = data;

    // import { GedcomGeoHelper } from "$lib/extractLocation";
    // let people = [];
    // onMount(async () => {
    //     if (treeData?.nodes) {
    //         console.log(treeData.nodes)
    //         const helper = new GedcomGeoHelper(treeData.nodes);
    //         await helper.ready;
    //         people = helper.people;
    //         console.log("People ready:", people);
    //     }
    // });
</script>

{#if treeData}
    <Map3DView />
{:else}
    <p class="loading-view">Loading...</p>
{/if}
