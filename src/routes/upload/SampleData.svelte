<script>
    import { gedcomFile, gedcomText } from "$lib/stores/gedcom.js";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";

    let useSampleData = false;
    let loading = false;

    // Whenever useSampleData changes to true, fetch and load the sample file
    $: if (useSampleData) {
        loading = true;
        loadSampleGedcom();
    }

    async function loadSampleGedcom() {
        try {
            const response = await fetch(
                "/The_English_and_British_Kings_and_Queens.ged",
            );
            if (!response.ok) throw new Error("Failed to load sample file");

            const text = await response.text();
            gedcomText.set(text);

            // Optional: set gedcomFile to a dummy File-like object if your app depends on it
            const sampleFile = new File(
                [text],
                "The_English_and_British_Kings_and_Queens.ged",
                {
                    type: "text/plain",
                },
            );
            gedcomFile.set(sampleFile);

            console.log("Loaded sample GEDCOM data");
        } catch (e) {
            console.error("Error loading sample GEDCOM:", e);
        } finally {
            loading = false;
        }
    }

    function navigateToExplore() {
        goto("/explore/web2D");
    }
</script>

<main>
    <div class="sample_data">
        <label for="sample-toggle">
            Don't have a family tree file? Try our sample data:
        </label>
        <button
            type="button"
            role="switch"
            aria-checked={useSampleData}
            aria-label={`Toggle use sample data setting`}
            tabindex="0"
            on:click={() => (useSampleData = !useSampleData)}
            class="switch"
        >
            <span class="slider"></span>
        </button>
    </div>
    {#if loading}
        <p>Loading file contents...</p>
    {:else if useSampleData && $gedcomText}
        <h2 style="text-align: center;">
            Sample Family Tree: English and British Monarchs
        </h2>
        <div
            style="display: flex; justify-content: center; align-items: center;"
        >
            <button on:click={navigateToExplore}>Let's explore!</button>
        </div>
        <div style="position: relative; display: flex">
            <pre
                style="max-width: 50vw; max-height: 40vh; overflow: auto; position: relative;">
{$gedcomText}
      </pre>
        </div>
    {/if}
</main>

<style>
    main {
        width: 100%;
        overflow: hidden;
        position: relative;
    }
    .sample_data {
        position: relative;
        width: 100%;
        padding-top: 4rem;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
    }

    .switch {
        position: relative;
        width: 38px;
        height: 20px;
        background-color: var(--toggle-off-bg);
        border-radius: 12px;
        border: none;
        cursor: pointer;
        padding: 0;
        outline-offset: 2px;
        transition: background-color 0.3s;
    }

    .switch[aria-checked="true"] {
        background-color: var(--toggle-on-bg);
    }

    .switch .slider {
        position: absolute;
        top: 2px;
        left: 2px;
        height: 16px;
        width: 16px;
        background-color: var(--toggle-off-knob);
        border-radius: 50%;
        transition: transform 0.3s;
        transform: translateX(0);
    }

    .switch[aria-checked="true"] .slider {
        transform: translateX(18px);
        background-color: var(--toggle-on-knob);
    }

    .switch:focus-visible {
        outline: 2px solid var(--toggle-focus, #2196f3);
    }

    @media (max-width: 600px) {
        pre {
            max-width: 100vw !important;
            max-height: 70vh !important;
        }
    }
</style>
