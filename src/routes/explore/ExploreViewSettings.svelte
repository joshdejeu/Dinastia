<!-- src\routes\explore\ExploreViewSettings.svelte -->
<script>
    import { globalSettingsStore } from "$lib/stores";
    import { writable } from "svelte/store";

    export let settings;

    // Toggle the setting that was clicked
    function toggleSetting(setting) {
        const name = setting.name;
        globalSettingsStore.update((store) => {
            if (store[name]) {
                store[name].value = !store[name].value;
            }
            return store;
        });
        // Update local settings array directly so UI reflects immediately
        const index = settings.findIndex((s) => s.name === name);
        if (index !== -1) {
            // toggle the value in local array (this is NOT reactive but triggers update)
            settings[index].value = !settings[index].value;

            // force Svelte to notice the change by creating a new array reference
            settings = [...settings];
        }
    }

    let isMenuExpanded = false;
    // Toggle to expand/shrink the menu which displays the settings for the route you're on
    function toggleViewSettings() {
        isMenuExpanded = !isMenuExpanded;
    }
</script>

<main
    class:menu-isExpanded-true={isMenuExpanded}
    class:menu-isExpanded-false={!isMenuExpanded}
    id="tree-settings-toggle-container"
>
    <button
        class:show-arrow-left={isMenuExpanded}
        class:show-arrow-right={!isMenuExpanded}
        on:click={toggleViewSettings}
        aria-label={isMenuExpanded
            ? "Minimize settings menu"
            : "Toggle settings panel"}
    >
        <!-- Right Arrow SVG icon (css to flip) -->
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class:flipped={isMenuExpanded}
        >
            <polyline points="9 6 15 12 9 18" />
        </svg>
    </button>
    <div
        id="tree-settings-animate"
        class:settings-animation-true={isMenuExpanded}
        class:settings-animation-false={!isMenuExpanded}
    >
        <!-- Settings displayed when toggled -->
        <div id="tree-settings-title">Settings</div>
        {#each settings as setting}
            <div
                style="display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; white-space: nowrap; color: var(--text-muted-color)"
            >
                <p style="margin: 0;">{setting.name}</p>

                <button
                    type="button"
                    role="switch"
                    aria-checked={setting.value}
                    aria-label={`Toggle ${setting.name} setting`}
                    tabindex="0"
                    on:click={() => toggleSetting(setting)}
                    on:keydown={(e) =>
                        (e.key === " " || e.key === "Enter") &&
                        (e.preventDefault(), toggleSetting(setting))}
                    class="switch"
                >
                    <span class="slider"></span>
                </button>
            </div>
        {/each}
    </div>
</main>

<style>
    /* Parent container default */
    #tree-settings-toggle-container {
        position: absolute;
        top: calc(0.5rem - 1px);
        left: calc(0.5rem - 1px);
        background-color: var(--bg-darkest);
        border-radius: 0.5rem;
        border-top-right-radius: 0;
        border-color: var(--bg-lightest);
        z-index: 2;
        transition: padding 0.3s ease;
        padding: 0; /* no padding by default */
    }

    /* Toggle OFF: full border-radius all around */
    #tree-settings-toggle-container.menu-isExpanded-false {
        border-top-right-radius: 0.5rem; /* override */
    }

    /* When toggle is ON, add padding to container */
    #tree-settings-toggle-container.menu-isExpanded-true {
        /* padding: 1rem; */
    }

    /* Smoothly expand the menu */
    #tree-settings-animate {
        max-width: 0;
        max-height: 0;
        /* display: none; */
        overflow: hidden;
        transition: all 0.3s ease;
    }
    /* When isExpanded = false */
    #tree-settings-animate.settings-animation-true {
        display: flex;
        max-width: 1000px; /* or 100%, or whatever fits your layout */
        max-height: 1000px; /* or just enough to show all items */
        padding: 1rem;
        flex-direction: column;
        gap: 1rem;
    }
    #tree-settings-animate.settings-animation-false {
        width: 100%;
        height: 100%;
    }
    .settings-animation-false #tree-settings-title {
        display: none;
    }
    .settings-animation-true #tree-settings-title {
        position: absolute;
        width: 90%;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0.5rem;
        top: 0;
        left: 0;
        pointer-events: none;
        color: var(--text-color);
    }

    /* Button base styles */
    button.show-arrow-right {
        /* position: absolute;  */
        /* top: 0; */
        /* left: 0; */
        padding: 0.5rem 0.75rem;
        background-color: var(--bg-lighter);
        border: none;
        border-radius: 0.5rem;
        color: var(--button-text);
        cursor: pointer;
        transition: all 0.3s;
    }

    /* Hover style for toggle off button */
    button.show-arrow-right:hover {
        background-color: var(--bg-lightest);
        filter: brightness(1.2);
    }

    /* Button when toggle is ON */
    button.show-arrow-left {
        padding: 0.25rem;
        background-color: var(--bg-lighter);
        border: none;
        border-radius: 0 0.5rem 0.5rem 0;
        cursor: pointer;
        color: var(--button-text);
        margin-left: 100%;

        /* Move absolutely to the right within the parent */
        /* transition: all 0.3s; */
        border-style: solid solid solid none; /* top, right, bottom, left */
        border-width: 1px;
        border-color: var(--bg-dark);
    }

    button.show-arrow-left:hover {
        background-color: var(--bg-lightest);
        filter: brightness(1.2);
    }

    /* SVG stroke for both states */
    #tree-settings-toggle-container svg {
        stroke-width: 3;
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

    /* The arrow that expands/minimizes the settings within a view */
    .flipped {
        transform: rotate(180deg);
        transition: all 0.5s ease;
    }
</style>
