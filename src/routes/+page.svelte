<!-- src/routes/+page.svelte -->
<!-- the home page -->
<script>
  const routes = [
    { label: "Explore", href: "/explore/web" },
    { label: "Color Theme", href: "/theme" },
    { label: "Upload GEDCOM", href: "/upload" },
  ];
</script>

<main>
  <div class="button-grid">
    {#each routes as { label, href }}
      <a class="button-tile" {href}>{label}</a>
    {/each}
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    min-height: 100vh;
    font-family: "Segoe UI", Tahoma, sans-serif;
  }

  .button-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    width: 100%;
    height: 70%;
  }

  .button-tile {
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 3 / 2;
    width: 100%;
    max-width: 240px;
    background-color: var(--bg-lighter);
    color: var(--text-color);
    text-decoration: none;
    font-weight: bold;
    font-size: 1.25rem;
    border-radius: 12px;
    transition: background-color 0.2s ease;
    text-align: center;
    padding: 1rem;
  }

  .button-tile:hover {
    background-color: var(--bg-lightest);
  }

  @media (max-width: 768px) {
    .button-grid {
      flex-direction: column;
      align-items: center;
    }

    .button-tile {
      max-width: 90%;
    }
  }
</style>
