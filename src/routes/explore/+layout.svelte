<!-- src/routes/tree/+layout.svelte -->
<!-- loads file and renders tree -->

<script>
    import { page } from "$app/stores";
    import { menu_items } from "$lib/menuItems.js";
    const exploreMenu =
        menu_items.find((item) => item.name === "Explore")?.children ?? [];

    // import { buildTree } from "$lib/buildTree";
    export let data;
    const { d3Data, firstIndi } = data;

    let debug = false; // Set to true to see raw tree data, false to see the rendered tree
    let isFullscreen = false;

    let rect = { top: 0, left: 0, width: 0, height: 0 };
    let fullScreenEl;

    // Track if we're animating exit fullscreen
    let isAnimatingExit = false;

    function toggleFullscreen() {
        if (!isFullscreen) {
            // Going fullscreen: measure and start animation
            rect = fullScreenEl.getBoundingClientRect();
            isFullscreen = true;
            isAnimatingExit = false;
            document.documentElement.requestFullscreen();
        } else {
            // Exiting fullscreen: start exit animation first
            isAnimatingExit = true;
            document.exitFullscreen();
            // Don't call exitFullscreen yet, wait for animation end
        }
    }

    // Handle animation end to finish exit fullscreen process
    function handleAnimationEnd(event) {
        if (
            event.animationName.endsWith("fullscreen-shrink") &&
            isAnimatingExit
        ) {
            isAnimatingExit = false;
            isFullscreen = false;
        }
    }
</script>

<!-- Select tree-view and render that component -->
<main>
    <div class="tree-wrapper">
        {#if d3Data && !debug}
            <div
                bind:this={fullScreenEl}
                class="laravel-shadow"
                class:fullscreen-animate={isFullscreen}
                class:fullscreen-exit={isAnimatingExit}
                style="
                    --start-top: {rect.top}px;
                    --start-left: {rect.left}px;
                    --start-width: {rect.width}px;
                    --start-height: {rect.height}px;"
                on:animationend={handleAnimationEnd}
            >
                <div class="tree-menu">
                    <div class="menu-list">
                        {#each exploreMenu as item, index}
                            <a
                                href={item.route}
                                class="tree-menu-item"
                                id={$page.url.pathname === item.route
                                    ? "tree-menu-selected"
                                    : ""}
                            >
                                {item.name}
                            </a>
                        {/each}
                    </div>
                    <div id="full-screen-toggle">
                        <button
                            class="tree-menu-item"
                            on:click={toggleFullscreen}
                            aria-label="Toggle fullscreen"
                        >
                            {#if !isFullscreen}
                                <!-- Enter fullscreen icon -->
                                <svg
                                    width="24"
                                    height="24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    color="var(--text-color)"
                                >
                                    <path d="M0 0h24v24H0z" fill="none"></path>
                                    <path
                                        d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
                                    ></path>
                                </svg>
                            {:else}
                                <!-- Exit fullscreen icon -->
                                <svg
                                    width="24"
                                    height="24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    color="var(--text-color)"
                                >
                                    <path d="M0 0h24v24H0z" fill="none"></path>
                                    <path
                                        d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"
                                    ></path>
                                </svg>
                            {/if}
                        </button>
                    </div>
                </div>
                <div class="tree-container">
                    <!-- <TreeView {treeData} rootId={firstIndi} /> -->
                    <slot />
                </div>
            </div>
        {:else if debug && parsedData}
            <h1>Debug mode</h1>
            <p>Parsed GEDCOM people data:</p>
            <!-- <pre>{JSON.stringify(parsedData.people, null, 2)}</pre> -->
        {:else}
            <p>Loading tree...</p>
        {/if}
    </div>
</main>

<style>
    main {
        background-color: var(--bg-darker);
        height: 100vh;
    }
    .tree-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    .laravel-shadow {
        width: 80%;
        height: 80%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 1rem;
        box-shadow: 0px 0px 0px 10px var(--bg-lightest);
        /* background-color: var(--bg-color); */
        background-color: var(--bg-darkest);
    }
    .tree-menu {
        width: 100%;
        height: 3rem;
        padding: 0 2em;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-sizing: border-box; /* fixes padding overflowing parent */
        .tree-menu-item {
            margin: 0;
            font-size: 1rem;
            font-weight: 400;
            color: var(--text-muted-color);
            display: inline-block;
            position: relative;
            background-clip: content-box;
            background: none;
            border: none;
            cursor: pointer;
            padding: 0;
            outline: none;
            transition: all 0.2s ease-in-out;
        }
        #tree-menu-selected {
            color: var(--text-color) !important;
        }
        #tree-menu-selected::after {
            content: "";
            position: absolute;
            width: 100%;
            left: 0;
            height: 1px;
            background-color: var(--text-color);
            bottom: calc(1px - 0.75rem); /* or adjust */
        }
    }
    .menu-list {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: start;
        gap: 1rem;
    }
    .tree-container {
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

    /* Fullscreen "popped" state */
    .fullscreen-animate {
        position: fixed;
        top: var(--start-top);
        left: var(--start-left);
        width: var(--start-width);
        height: var(--start-height);
        margin: 0;
        border-radius: 1rem;
        z-index: 9999;
        background-color: var(--bg-darkest, #111);
        animation: fullscreen-expand 0.5s forwards
            cubic-bezier(0.22, 1, 0.36, 1);
    }

    .fullscreen-exit {
        position: fixed;
        z-index: 9999;
        animation: fullscreen-shrink 0.5s forwards
            cubic-bezier(0.22, 1, 0.36, 1);
    }

    @keyframes fullscreen-expand {
        from {
            top: var(--start-top);
            left: var(--start-left);
            width: var(--start-width);
            height: var(--start-height);
            border-radius: 1rem;
        }
        to {
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            border-radius: 0;
        }
    }

    @keyframes fullscreen-shrink {
        from {
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            border-radius: 0;
        }
        to {
            top: var(--start-top);
            left: var(--start-left);
            width: var(--start-width);
            height: var(--start-height);
            border-radius: 1rem;
        }
    }
</style>
