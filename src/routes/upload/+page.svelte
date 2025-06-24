<script>
    let file;

    function handleFileChange(event) {
        file = event.target.files[0];
        if (file) {
            // Placeholder: here you'll add GEDCOM parsing and tree building
            console.log("File selected:", file.name);
        }
    }
</script>

<main>
    <div class="upload-backplate">
        <h1>Dinastia Upload GEDCOM</h1>
        <p>
            Made for Ancestry.com 6-23-2025 which supports
            <a
                target="_blank"
                href="https://gedcom.io/specifications/ged551.pdf"
                ><strong>GEDCOM 5.5.1</strong>
            </a>.
        </p>

        <input
            class="file-upload"
            type="file"
            accept=".ged,.gedcom"
            on:change={handleFileChange}
        />
    </div>

    {#if file}
        <p>Selected file: <strong>{file.name}</strong></p>
        <button on:click={() => alert("Parsing will happen here soon!")}>
            Parse & Build Tree
        </button>
    {/if}
</main>

<style>
    /* Full page dark background */
    :global(body) {
        margin: 0;
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        min-height: 100vh;
    }

    main {
        max-width: 600px;
        margin: 3rem auto;
    }

    .upload-backplate {
        background-color: var(--bg-secondary-color);
        padding: 2rem;
        margin-top: 2rem;
        border-radius: 1em;
    }

    .file-upload {
        background-color: var(--bg-secondary-color);
        border: 2px dashed var(--text-color);
        padding: 1rem;
        border-radius: 6px;
        color: var(--text-color);
        font-size: 1rem;
        text-align: center;
    }

    h1 {
        text-align: center;
    }

    input[type="file"] {
        display: block;
        margin: 0 auto 2rem auto;
    }

    button {
        display: block;
        margin: 0 auto;
        border: none;
        padding: 0.75rem 2rem;
        border-radius: 6px;
        color: #121212;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.25s ease;
    }
</style>
