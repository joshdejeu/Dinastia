<script>
    import { gedcomFile, gedcomText } from "$lib/stores/gedcom.js";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";

    let useSampleData = true;
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
        <div
            style="display: flex; justify-content: center; align-items: center;"
        >
            <button on:click={navigateToExplore}>Let's explore!</button>
        </div>
        <div
            class="laravel-container"
            style="position: relative; display: flex; padding: 2rem"
        >
            <div class="laravel-outer">
                <div>
                    <div class="laravel-title">
                        Sample Family Tree: English and British Monarchs
                    </div>
                </div>
                <div class="laravel-inner">
                    <pre
                        style="max-width: 50vw; max-height: 40vh; overflow: auto; position: relative;">
                    {$gedcomText}
                </pre>
                </div>
            </div>
        </div>
    {/if}
</main>

<style>
    .laravel-outer {
        position: relative;
        width: 100%;
        /* height: 80%; */
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 1rem;
        box-shadow: 0px 0px 0px 10px var(--bg-lightest);
        /* background-color: var(--bg-color); */
        background-color: var(--bg-darkest);
    }
    .laravel-title {
        width: 100%;
        height: 3rem;
        padding: 0 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-sizing: border-box; /* fixes padding overflowing parent */
    }
    .laravel-inner {
        position: relative;
        width: calc(100% - 1rem); /* full width minus horizontal margin */
        /* top | right | bottom | left */
        margin: 0 auto 0.5rem auto; /* vertical + centered horizontal margin */
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        border-radius: calc(1rem - 0.25rem);
        border: 1px solid
            color-mix(in oklab, var(--bg-lightest) 80%, transparent);
        background-color: var(--bg-color);
    }
    /* test abv */
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

    pre {
        margin-block: 0;
    }

    @media (max-width: 600px) {
        pre {
            max-width: 100vw !important;
            max-height: 70vh !important;
        }

        .laravel-container {
            width: 100%;
            padding: 0 !important;
            margin: 2rem 0 !important;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .laravel-outer {
            position: relative;
            width: calc(100% - 2rem);
            /* height: 80%; */
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-radius: 1rem;
            box-shadow: 0px 0px 0px 10px var(--bg-lightest);
            /* background-color: var(--bg-color); */
            background-color: var(--bg-darkest);
        }
        .laravel-title {
            width: 100%;
            height: 3rem;
            padding: 0 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-sizing: border-box; /* fixes padding overflowing parent */
        }
        .laravel-inner {
            position: relative;
            width: calc(100% - 1rem); /* full width minus horizontal margin */
            /* top | right | bottom | left */
            margin: 0 auto 0.5rem auto; /* vertical + centered horizontal margin */
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            border-radius: calc(1rem - 0.25rem);
            border: 1px solid
                color-mix(in oklab, var(--bg-lightest) 80%, transparent);
            background-color: var(--bg-color);
        }
    }
</style>
