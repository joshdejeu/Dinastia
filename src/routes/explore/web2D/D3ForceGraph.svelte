<!-- src\routes\explore\web\D3ForceGraph.svelte -->
<script>
    import { onMount, onDestroy } from "svelte";
    import { globalSettingsStore } from "$lib/stores.js";
    let d3;

    export let nodes = [];
    export let links = [];

    const nodeWidth = 120;
    const nodeHeight = 60;

    let svg;
    let containerEl;
    let observer;

    let width = 900;
    let height = 700;

    let simulation;
    let link, node, g, labels;

    function assignDepth(nodes, links) {
        const idToNode = new Map(nodes.map((n) => [n.id, n]));
        const childToParents = new Map();

        // Build child->parent map
        for (const link of links) {
            if (!childToParents.has(link.target)) {
                childToParents.set(link.target, []);
            }
            childToParents.get(link.target).push(link.source);
        }

        // Assign depth recursively
        function getDepth(id, visited = new Set()) {
            if (visited.has(id)) return 0; // avoid loops
            visited.add(id);

            const parents = childToParents.get(id);
            if (!parents || parents.length === 0) return 0;

            return (
                1 +
                Math.max(...parents.map((p) => getDepth(p.id || p, visited)))
            );
        }

        for (const node of nodes) {
            node.depth = getDepth(node.id);
        }
    }

    // Initialize simulation only once
    function initializeSimulation() {
        if (!d3 || !nodes.length || !links.length) return;

        // Set initial positions
        // Before simulation starts, set initial x/y positions a bit randomly if they’re not already:
        // nodes.forEach((n) => {
        //     if (n.x === undefined || n.y === undefined) {
        //         n.x = width / 2 + (Math.random() - 0.5) * 100;
        //         n.y = height / 2 + (Math.random() - 0.5) * 100;
        //     }
        // });
        assignDepth(nodes, links);

        const levelSpacingY = 120;
        const nodeSpacingX = 160;

        const nodesAtLevel = new Map();
        nodes.forEach((n) => {
            const level = n.depth || 0;
            if (!nodesAtLevel.has(level)) nodesAtLevel.set(level, []);
            nodesAtLevel.get(level).push(n);
        });

        // Set initial positions
        nodes.forEach((n) => {
            const levelNodes = nodesAtLevel.get(n.depth);
            const index = levelNodes.indexOf(n);

            n.x = index * nodeSpacingX + width / 4;
            n.y = n.depth * levelSpacingY + 100;
        });

        simulation = d3
            .forceSimulation(nodes)
            .force(
                "link",
                d3
                    .forceLink(links)
                    .id((d) => d.id)
                    .distance(100) // ← How long each link wants to be
                    .strength(0.5), // ← How *strongly* the link enforces that length
            )
            .force("y", d3.forceY((d) => 100 + d.depth * 180).strength(1))
            .force("x", d3.forceX(width / 2).strength(0.1)) // very light horizontal pull
            // .force("charge", d3.forceManyBody().strength(-800))
            .force(
                "collision",
                d3
                    .forceCollide(Math.max(nodeWidth, nodeHeight) / 1.5)
                    .strength(1),
            )
            .force("charge", d3.forceManyBody().strength(-150)) // repels nodes moderately
            .alpha(1)
            .alphaDecay(0.03)
            .on("tick", ticked);
    }

    function ticked() {
        if (!link || !node) return;
        link.attr("x1", (d) => d.source.x)
            .attr("y1", (d) => d.source.y)
            .attr("x2", (d) => d.target.x)
            .attr("y2", (d) => d.target.y);

        node.attr(
            "transform",
            (d) => `translate(${d.x - nodeWidth / 2},${d.y - nodeHeight / 2})`,
        );

        labels.attr("transform", (d) => `translate(${d.x},${d.y - 20})`);
    }

    function drag(simulation) {
        function dragstarted(event) {
            if (!event.active) simulation.alphaTarget(0.01).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragged(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragended(event) {
            if (!event.active) simulation.alphaTarget(0);
            // Optional: comment this out if you want nodes fixed after drag
            if (!$globalSettingsStore["Freeze Nodes"].value) {
                event.subject.fx = null;
                event.subject.fy = null;
            }
        }

        return d3
            .drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    function renderTree(widthParam, heightParam) {
        if (!d3 || !nodes.length || !links.length) return;

        width = widthParam;
        height = heightParam;

        const svgSelection = d3
            .select(svg)
            .attr("width", width)
            .attr("height", height);

        const zoom = d3.zoom().on("zoom", (event) => {
            if (g) g.attr("transform", event.transform);
        });
        svgSelection.call(zoom);

        if (!g) {
            // First time setup: create groups and bind data
            svgSelection.selectAll("*").remove();
            g = svgSelection.append("g");

            link = g
                .append("g")
                .attr("stroke", "#999")
                .attr("stroke-opacity", 0.6)
                .selectAll("line")
                .data(links)
                .join("line")
                .attr("stroke-width", 1.5);

            node = g
                .append("g")
                .selectAll("g")
                .data(nodes)
                .join("g")
                .attr("class", "node-group")
                .call(drag(simulation))
                .on("click", (event, d) => {
                    console.log("Clicked node:", d);
                });

            node.append("rect")
                .attr("width", nodeWidth)
                .attr("height", nodeHeight)
                .attr("rx", 8)
                .attr("ry", 8)
                .attr("fill", (d) => d.color || "var(--bg-color, #007bff)")
                .attr("stroke", "#fff")
                .attr("stroke-width", 1.5);

            node.append("text")
                .attr("x", nodeWidth / 2)
                .attr("y", nodeHeight / 2)
                .attr("dy", "0.35em")
                .attr("text-anchor", "middle")
                .attr("fill", "white")
                .text((d) => d.name);

            node.append("image")
                .attr(
                    "https://static.vecteezy.com/system/resources/thumbnails/001/209/907/small/geometric-pattern-square.png",
                    (d) => d.imgUrl,
                )
                .attr("x", 10)
                .attr("y", 10)
                .attr("width", 40)
                .attr("height", 40);

            labels = g
                .append("g")
                .attr("class", "labels")
                .selectAll("g")
                .data(nodes)
                .join("g")
                .attr("class", "label-group");

            // Birth year line
            labels
                .append("text")
                .attr("font-family", "sans-serif")
                .attr("font-size", 8)
                .attr("fill", "var(--text-color, #333)")
                .attr("dy", "5em") // move birth text *below* the node
                .attr("text-anchor", "middle")
                .text((d) => d.dob || "?");

            // Apply initial zoom transform here
            svgSelection.call(
                zoom.transform,
                d3.zoomIdentity.translate(width / 2, height / 2).scale(0.6),
            );
        } else {
            // Update size and forces without removing elements
            simulation
                .force("center")
                .x(width / 2)
                .y(height / 2);
            simulation.alpha(1).restart();
        }
    }

    onMount(async () => {
        const module = await import("d3");
        d3 = module;

        if (!containerEl) return;

        initializeSimulation();

        // Setup resize observer
        // observer = new ResizeObserver(([entry]) => {
        // const { width, height } = entry.contentRect;
        // renderTree(width, height); not needed, this is all svg based and relative
        // });
        // observer.observe(containerEl);

        // Initial render with container size
        const rect = containerEl.getBoundingClientRect();
        renderTree(rect.width, rect.height);
    });

    onDestroy(() => {
        if (observer && containerEl) observer.unobserve(containerEl);
        if (simulation) simulation.stop();
    });

    // If nodes or links change, update simulation data
    $: if (simulation && d3) {
        simulation.nodes(nodes);
        simulation.force("link").links(links);
        simulation.alpha(1).restart();
    }
</script>

<div bind:this={containerEl} class="tree">
    <svg bind:this={svg} style="width: 100%; height: 100%;"></svg>
</div>

<style>
    .tree {
        position: relative;
        width: 100%;
        height: 100%;
        /* overflow: hidden; */
        border-radius: 0.5em;
        /* border: 1px solid var(--text-color); */
    }
</style>
