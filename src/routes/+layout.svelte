<!-- src/routes/+layout.svelte -->

<script>
    import "../app.css";
    export let data;
    import { onMount } from "svelte";

    const DEFAULT_THEME = "theme-default";

    onMount(() => {
        const savedTheme =
            localStorage.getItem("selectedTheme") || DEFAULT_THEME;
        document.documentElement.setAttribute("data-theme", savedTheme);
    });
</script>

<header class="site-header">
    <h1>Dinastia</h1>
    <nav>
        <a href="/tree">Family Tree</a>
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
    }
</style>
