<script>
    import { onMount, onDestroy } from "svelte";

    export let nodes = [];
    export let links = [];

    let container;
    let Graph;
    let resizeObserver;

    onMount(async () => {
        const ForceGraph3D = (await import("3d-force-graph")).default;
        const THREE = await import("three");

        Graph = ForceGraph3D()(container)
            .graphData({ nodes, links })
            .nodeLabel((node) => `${node.name ?? node.id}`)
            .nodeAutoColorBy("group")
            .nodeThreeObjectExtend(true)
            .nodeThreeObject((node) => {
                const sprite = new THREE.Sprite(
                    new THREE.SpriteMaterial({
                        color: node.color ?? "#00bfff",
                    }),
                );
                sprite.scale.set(8, 8, 1);
                return sprite;
            });

        const bgColor = getComputedStyle(document.documentElement)
            .getPropertyValue("--bg-color")
            .trim();
        Graph.backgroundColor(bgColor);

        function resize() {
            if (!container || !Graph) return;
            const rect = container.getBoundingClientRect();
            Graph.width(rect.width).height(rect.height);
        }

        // Initial resize
        resize();

        // Watch container size changes
        resizeObserver = new ResizeObserver(() => {
            resize();
        });
        resizeObserver.observe(container);
    });

    onDestroy(() => {
        if (resizeObserver && container) {
            resizeObserver.unobserve(container);
        }
        if (Graph) {
            Graph.pauseAnimation();
            // Optionally: Graph.dispose(); if you want to fully clean up
        }
    });
</script>

<div bind:this={container} style="width: 100%; height: 100%;"></div>
