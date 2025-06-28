<!-- src/routes/+layout.svelte -->

<script>
    import "../app.css";
    import { onMount } from "svelte";
    import { menu_items } from "$lib/menuItems.js";
    let showExplore = false;

    const DEFAULT_THEME = "theme-default";

    onMount(() => {
        const savedTheme =
            localStorage.getItem("selectedTheme") || DEFAULT_THEME;
        document.documentElement.setAttribute("data-theme", savedTheme);
    });

    const exploreMenu =
        menu_items.find((item) => item.name === "Explore")?.children ?? [];
</script>

<header class="site-header">
    <a href="/"><h1>Dinastia</h1></a>
    <nav style="position: relative;">
        <div class="dropdown" role="menu">
            <button
                class="nav-drop-down"
                aria-haspopup="true"
                aria-expanded={showExplore}
                on:click={() => (showExplore = !showExplore)}
            >
                Explore ▾
            </button>
            {#if showExplore}
                <div class="dropdown-menu">
                    {#each exploreMenu as item}
                        <a
                            on:click={() => (showExplore = !showExplore)}
                            href={item.route}>{item.name}</a
                        >
                    {/each}
                </div>
            {/if}
        </div>
        <a href="/theme">Color Theme</a>
        <a href="/upload">Upload GEDCOM</a>
    </nav>
</header>

<slot />

<!-- renders the actual page content -->

<style>
    .site-header {
        padding: 1rem;
        text-align: center;
        height: var(--header-height);
    }

    .site-header h1 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: bold;
    }

    .site-header nav {
        margin-top: 0.5rem;
        display: flex;
        justify-self: center;
        align-items: center;
        gap: 3em;
    }

    .site-header nav a {
        text-decoration: none;
        font-weight: bold;
    }

    .site-header nav a:hover {
        text-decoration: underline;
        color: var(--link-hover-color);
    }
    .nav-drop-down {
        all: unset; /* reset button styles to look like plain text */
        font-weight: bold;
        cursor: pointer;
        color: var(--link-color);
        font-size: 1rem;
        text-decoration: none;
        padding: 0;
    }

    .nav-drop-down:hover {
        color: var(--link-hover-color);
    }

    .dropdown {
        position: relative; /* NEW: dropdown menu positions relative to this */
        display: inline-block; /* shrink-wrap to button width */
    }

    .dropdown-menu {
        position: absolute;
        top: 1.5em;
        top: 100%; /* position just below button */
        left: 50%; /* center horizontally to .dropdown */
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        background-color: var(--bg-color, white);
        border: 1px solid var(--bg-lightest, #ccc);
        border-radius: 6px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        z-index: 999;
        min-width: 150px;
        padding: 0.5em;
    }

    .dropdown-menu a {
        padding: 0.25em 0.5em;
        white-space: nowrap;
        color: var(--link-color);
    }

    .dropdown-menu a:hover {
        background-color: var(--accent-hover-color, #eee);
        text-decoration: none !important;
        color: var(--link-hover-color);
    }
</style>
