<!-- src/routes/tree/TreeView.svelte -->
<!-- D3-powered component -->

<script>
    import { mount, onMount, onDestroy } from "svelte";
    import * as d3 from "d3";
    import { FamilyTreeBuilder } from "./FamilyTreeBuilder";
    import PersonCard from "./PersonCard.svelte";

    export let treeData;

    let svgEl;
    let containerEl;
    let observer;

    const myFamilyTree = new FamilyTreeBuilder(
        treeData.nodes,
        treeData.families,
    );

    const rootData = myFamilyTree.getParentOnlyTree();

    function renderTree(width, height) {
        if (!rootData || !svgEl) return;

        const svg = d3.select(svgEl);
        svg.selectAll("*").remove();

        const g = svg.append("g").attr("transform", "translate(40,40)");

        const zoom = d3
            .zoom()
            .scaleExtent([0.1, 3])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });

        svg.call(zoom);

        // const layout = d3.tree().size([height - 80, width - 80]); horiztonal
        const layout = d3.tree().size([width - 80, height - 80]);
        const rootHierarchy = d3.hierarchy(rootData);
        layout(rootHierarchy);

        // Flip Y axis for upward growth:
        const totalHeight = height - 80;
        rootHierarchy.each((d) => {
            d.y = totalHeight - d.y;
        });

        // Links
        g.selectAll(".link")
            .data(rootHierarchy.links())
            .enter()
            .append("path")
            .attr("class", "link")
            .attr("fill", "none")
            .attr("stroke", "var(--accent-color)")
            .attr("stroke-width", 1.5)
            .attr(
                "d",
                d3
                    //     .linkHorizontal()
                    //     .x((d) => d.y)
                    //     .y((d) => d.x),
                    .linkVertical()
                    .x((d) => d.x)
                    .y((d) => d.y),
            );

        // Nodes
        const node = g
            .selectAll(".node")
            .data(rootHierarchy.descendants())
            .enter()
            .append("foreignObject")
            // .attr("x", (d) => d.y - 50) // center card horizontally
            // .attr("y", (d) => d.x - 15) // center card vertically
            .attr("x", (d) => d.x - 45)
            .attr("y", (d) => d.y - 10)
            .attr("width", 150)
            .attr("height", 50)
            .attr("class", "tree_node");
        //     .selectAll(".node")
        //     .data(rootHierarchy.descendants())
        //     .enter()
        //     .append("g")
        //     .attr("class", "node")
        //     .attr("transform", (d) => `translate(${d.y},${d.x})`);

        // node.append("circle").attr("r", 5).attr("fill", "var(--accent-color)");

        // node.append("text")
        //     .text((d) => d.data.name)
        //     .attr("x", "-3em")
        //     .attr("dy", "-0.75em")
        //     .attr("fill", "var(--text-color)")
        //     .style("font", "12px sans-serif");

        node.each(function (d) {
            const wrapper = document.createElement("div");
            wrapper.style.width = "fit-content";
            wrapper.style.height = "fit-content";

            mount(PersonCard, {
                target: wrapper,
                props: {
                    person: d.data,
                    selected: d.data.selected || false,
                },
            });

            this.appendChild(wrapper);
        });
    }

    onMount(() => {
        if (!rootData || !svgEl) return;

        observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            renderTree(width, height);
        });

        if (containerEl) {
            observer.observe(containerEl);
            const rect = containerEl.getBoundingClientRect();
            renderTree(rect.width, rect.height);
        }
    });

    onDestroy(() => {
        if (observer && containerEl) observer.unobserve(containerEl);
    });
</script>

<div bind:this={containerEl} class="tree">
    <svg bind:this={svgEl} style="width: 100%; height: 100%;"></svg>
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
    :global(.tree_node) {
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
