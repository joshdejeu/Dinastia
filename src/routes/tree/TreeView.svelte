<!-- src/routes/tree/TreeView.svelte -->
<!-- D3-powered component -->

<script>
    import { onMount, onDestroy } from "svelte";
    import * as d3 from "d3";

    export let treeData;
    export let rootId;

    let svgEl;
    let containerEl;
    let observer;
    let selectedNodeElement = null; // Declare a variable to hold the currently selected DOM element

    function renderTree(width, height) {
        if (!treeData || !width || !height) return;

        const svg = d3
            .select(svgEl)
            .html("") // clear previous render
            .attr("width", width)
            .attr("height", height)
            .style("background", "var(--bg-secondary-color)")
            .call(
                d3.zoom().on("zoom", (e) => {
                    g.attr("transform", e.transform);
                }),
            );

        const g = svg.append("g");
        const root = d3.hierarchy(treeData);
        const layout = d3.tree().size([height, width - 500]); // Layout margins
        layout(root);

        // Automatically zoom to the root node on initial render
        zoomToNode(root, 1, 0); // this causes artifacts when moving the tree

        g.selectAll("line")
            .data(root.links())
            .enter()
            .append("line")
            .attr("x1", (d) => d.source.y) // line-root offeset horizontally
            .attr("y1", (d) => d.source.x) // line-root offset vertically
            .attr("x2", (d) => d.target.y) // line-target offset horizontally
            .attr("y2", (d) => d.target.x) // line-target offset vertically
            .attr("stroke", "var(--accent-color)");

        g.selectAll("g.card")
            .data(root.descendants())
            .enter()
            .append("foreignObject")
            .attr("x", (d) => d.y - 60)
            .attr("y", (d) => d.x - 15)
            .attr("width", 120)
            .attr("height", 60)
            .append("xhtml:div")
            .attr("class", (d) => {
                // Use a function to determine the class
                let classes = "person-card";
                if (d.data.id === rootId) {
                    classes += " selected-node"; // Add a new class
                }
                // You could also check for the root node if needed:
                // if (d.depth === 0) {
                //     classes += " root-node-card";
                // }
                return classes;
            })
            .html(
                (d) => `
                <div>
                    <strong>${d.data.name}</strong><br/>
                    ${d.data.BIRT?.[0] ? `<small>${d.data.BIRT[0]}</small>` : ""}
                </div>
            `,
            )
            .on("click", (event, d) => {
                // Remove class from previously selected element if any
                if (selectedNodeElement) {
                    d3.select(selectedNodeElement).classed(
                        "selected-node",
                        false,
                    );
                }
                // Add class to currently clicked element
                d3.select(event.currentTarget).classed("selected-node", true);

                // Update the selectedNodeElement reference
                selectedNodeElement = event.currentTarget;

                handlePersonClick(d.data);
            });
        // Initialize selectedNodeElement for rootId if exists:
        if (rootId) {
            // Find the node with rootId and set selectedNodeElement to that div
            const initiallySelected = g
                .selectAll("foreignObject")
                .filter((d) => d.data.id === rootId)
                .select("div.person-card");
            if (!initiallySelected.empty()) {
                selectedNodeElement = initiallySelected.node();
            }
        }
    }

    onMount(() => {
        if (!treeData) return;

        observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            renderTree(width, height);
        });

        if (containerEl) observer.observe(containerEl);
    });

    onDestroy(() => {
        if (observer && containerEl) observer.unobserve(containerEl);
    });

    function zoomToNode(node, scale = 1.5, duration = 750) {
        if (!node || !svgEl) return;

        const svg = d3.select(svgEl);
        const g = svg.select("g");

        const { width, height } = svgEl.getBoundingClientRect();
        const translateX = width / 2 - node.y * scale;
        const translateY = height / 2 - node.x * scale;

        const transform = d3.zoomIdentity
            .translate(translateX, translateY)
            .scale(scale);

        svg.transition()
            .duration(duration)
            .call(
                d3.zoom().on("zoom", (e) => {
                    g.attr("transform", e.transform);
                }).transform,
                transform,
            );
    }

    // CARD CLICK HANDLER
    function handlePersonClick(personData, d) {
        console.log("Clicked person:", personData, d);
        // optionally emit Svelte event or update a store here
        const root = d3.hierarchy(treeData);
        d3.tree().size([svgEl.clientHeight, svgEl.clientWidth - 160])(root);

        const node = root.descendants().find((d) => d.data === personData);
        if (!node) return;

        zoomToNode(node); // all zooming logic isolated
    }
</script>

<div bind:this={containerEl} class="tree" style="w">
    <svg bind:this={svgEl}></svg>
</div>

<style>
    .tree {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        border-radius: 0.5em;
    }
    :global(.person-card) {
        background-color: var(--accent-color);
        color: var(--button-text);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        padding: 6px;
        font-size: 0.75rem;
        font-family: sans-serif;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
        pointer-events: auto;
        /* So it doesn't block zoom/pan */
        cursor: pointer;
        transition: all 0.2s ease-in-out;
    }
    :global(.person-card:hover) {
        background: var(--accent-hover-color);
        filter: saturate(1.5);
    }
    :global(.selected-node) {
        background-color: var(--bg-color);
        color: var(--text-color);
        border: 2px solid var(--accent-color);
        height: 44px;
    }
    /* Override hover for selected nodes */
    :global(.person-card.selected-node:hover) {
        background-color: var(--bg-color);
        filter: none;
        cursor: default;
    }
</style>
