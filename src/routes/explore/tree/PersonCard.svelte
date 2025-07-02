<!-- PersonCard.svelte -->
<script>
    export let person;
    export let selected = false;
    // console.log(person);
</script>

<div
    class="person-card {selected ? 'selected-node' : ''} {person.gender === 'M'
        ? 'male'
        : 'female'}"
>
    <div style="text-wrap: nowrap;">{person.name}</div>
    {#if person.dob || person.yod}
        <div class="person-date">{person?.dob} - {person?.yod}</div>
    {/if}
</div>

<style>
    .male {
        /* var(--person-male-color); */
        background: "#3b5998" !important;
        color: var(--text-color);
    }
    .female {
        background: var(--person-female-color) !important;
        color: var(--text-color);
    }
    .person-card {
        /* background-color: var(--bg-lightest); */
        color: var(--button-text);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        padding: 6px;
        font-size: 0.75rem;
        font-family: sans-serif;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
        pointer-events: auto;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        /* min-width: 80px; */
        /* height: 50px; */
        width: fit-content;
        height: fit-content;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .person-card:hover {
        background: var(--accent-hover-color);
        filter: saturate(1.5);
    }

    .selected-node {
        background-color: var(--bg-color);
        color: var(--text-color);
        border: 2px solid var(--accent-color);
    }

    .person-card.selected-node:hover {
        background-color: var(--bg-color);
        filter: none;
        cursor: default;
    }

    .person-date {
        text-wrap: nowrap;
        font-size: 0.65rem;
        opacity: 0.8;
    }
</style>
