<!-- src/routes/+page.svelte -->

<script>
  const routes = [
    { label: "Family Tree", href: "/tree" },
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
    gap: 1rem;
    width: 100%;
    max-width: 900px;
  }

  .button-tile {
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 4 / 3;
    width: 100%;
    max-width: 280px;
    background-color: #4fc3f7;
    color: #121212;
    text-decoration: none;
    font-weight: bold;
    font-size: 1.25rem;
    border-radius: 12px;
    transition: background-color 0.2s ease;
    text-align: center;
    padding: 1rem;
  }

  .button-tile:hover {
    background-color: #29b6f6;
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
