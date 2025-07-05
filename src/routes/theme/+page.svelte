<script>
    import { onMount } from "svelte";

    const themes = [
        {
            id: "theme-default",
            label: "Default",
            aria: "Default Blue Theme",
            colorVar: "--border-color",
            color: "#2e4679",
        },
        {
            id: "theme-light",
            label: "Light",
            aria: "Bright Yellow Theme",
            colorVar: "--border-color",
            color: "#c9b85f",
        },
        {
            id: "theme-dark",
            label: "Dark",
            aria: "Dark Red Theme",
            colorVar: "--border-color",
            color: "#5f1e1e",
        },
    ];

    let currentTheme = "theme-default";

    // On mount, read saved theme or default
    onMount(() => {
        const saved = localStorage.getItem("selectedTheme");
        if (saved && themes.find((t) => t.id === saved)) {
            currentTheme = saved;
            applyTheme(saved);
        } else {
            applyTheme(currentTheme);
        }
    });

    function applyTheme(id) {
        const theme = themes.find((t) => t.id === id);
        if (!theme) return;

        // Example: apply CSS variables to :root for border color and text color
        document.documentElement.style.setProperty(
            "--border-color",
            theme.borderColor,
        );
        document.documentElement.style.setProperty("--theme-bg", theme.color);
        if (theme.textColor) {
            document.documentElement.style.setProperty(
                "--theme-text-color",
                theme.textColor,
            );
        } else {
            document.documentElement.style.removeProperty("--theme-text-color");
        }
    }

    function selectTheme(id) {
        currentTheme = id;
        applyTheme(id);
        localStorage.setItem("selectedTheme", id);
        document.documentElement.setAttribute("data-theme", id);
    }
</script>

<main class="theme-container" role="list" aria-label="Color Theme Picker">
    {#each themes as { id, label, aria }}
        <button
            {id}
            class="theme-card"
            aria-label={aria}
            on:click={() => selectTheme(id)}
            type="button"
        >
            {label}
        </button>
    {/each}
</main>

<style>
    .theme-container {
        max-width: 800px;
        margin: 2rem auto;
        height: 60vh;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 2rem;
    }

    .theme-card {
        width: 250px;
        height: 150px;
        border-radius: 10px;
        border: 2px solid var(--border-color, #4fc3f7);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        cursor: pointer;
        transition:
            transform 0.3s ease,
            box-shadow 0.3s ease,
            border-color 0.3s ease;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: #fff;
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        font-weight: 600;
        font-size: 1.2rem;
        user-select: none;
        background-color: transparent;
    }

    .theme-card:focus,
    .theme-card:hover {
        transform: scale(1.05);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        border-color: #a0d2ff;
        outline: none;
    }

    /* Blue Default Theme */
    #theme-default {
        background-color: #3b5998; /* Muted medium blue */
        --border-color: #2e4679;
    }

    /* Bright Yellow Theme */
    #theme-light {
        background-color: #f5d76e; /* Soft warm yellow */
        color: #3b3a1f; /* Darker text for contrast */
        --border-color: #c9b85f;
    }

    /* Dark Red Theme */
    #theme-dark {
        background-color: #8b2e2e; /* Deep dark red */
        --border-color: #5f1e1e;
    }

    @media (max-width: 600px) {
        .theme-container {
            max-width: 100vw;
            height: fit-content;
            max-height: 90vh;
            flex-direction: column;
        }
    }
</style>
