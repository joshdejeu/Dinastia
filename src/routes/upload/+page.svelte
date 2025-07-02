<script>
    import { gedcomFile, gedcomText } from "$lib/stores/gedcom.js";
    import { goto } from "$app/navigation";

    let file;

    function handleFileChange(event) {
        file = event.target.files[0];
        if (file) {
            gedcomFile.set(file);

            const reader = new FileReader();
            reader.onload = (e) => {
                gedcomText.set(e.target.result);
                console.log("GEDCOM text loaded");
            };
            reader.readAsText(file);
        }
    }

    function handleParse() {
        // file is already stored and gedcomText is set
        // now do parsing or navigation
        // alert("Parsing will happen here soon!");
        // You can also navigate to /tree here if needed:
        // import { goto } from '$app/navigation'; then:
        goto("/explore/tree");
    }
</script>

<main>
    <div class="upload-backplate">
        <h1>Upload GEDCOM</h1>
        <p>
            Made for Ancestry.com (6-23-25) which supports
            <a
                style="text-decoration: underline;"
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
        <button on:click={handleParse}> Parse & Build Tree </button>
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
        border: 1px solid var(--text-color);
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
