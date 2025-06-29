<!-- src/src/expore/map/Map3DView.svelte -->
<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { globalSettingsStore } from "$lib/stores";
  import { get } from "svelte/store";
  import hurricane from "$lib/storm_clouds_8k.jpg";
  import night from "$lib/8k_earth_nightmap.jpg";
  import { people, arcs } from "./people";

  let container;
  let world;
  let cloudSphere;
  let resizeObserver;

  // Get CSS variables inside browser only
  const bgColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--bg-dark")
    .trim();
  const pointColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--text-color")
    .trim();
  const arcColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--bg-light")
    .trim();

  const globeTextures = [
    "//unpkg.com/three-globe/example/img/earth-day.jpg",
    night || "//unpkg.com/three-globe/example/img/earth-night.jpg",
  ];

  const bumpTexture = "//unpkg.com/three-globe/example/img/earth-topology.png";

  const globeBumpTextures =
    "//unpkg.com/three-globe/example/img/earth-topology.png";

  onMount(async () => {
    if (!browser) return;

    const Globe = (await import("globe.gl")).default;

    world = Globe()(container)
      .globeImageUrl($globalSettingsStore["Day Time"].data)
      .bumpImageUrl(globeBumpTextures)
      .backgroundColor(bgColor || "#000000")
      .pointOfView({ lat: 40, lng: 25, altitude: 2 }, 0)
      .atmosphereAltitude(0.15)
      .pointsData(people)
      .pointLat("lat")
      .pointLng("lng")
      .pointAltitude(() => 0.01)
      .pointColor(() => pointColor)
      .pointRadius(() => 0.05) // smaller radius, default might be ~0.01 or more
      .pointLabel("name");

    world
      .arcsData(arcs)
      .arcStartLat((d) => d.start.lat)
      .arcStartLng((d) => d.start.lng)
      .arcEndLat((d) => d.end.lat)
      .arcEndLng((d) => d.end.lng)
      .arcColor("#ffffff")
      .arcDashLength(0.8)
      .arcDashGap(1)
      // .arcAltitude(() => 0.125)
      .arcDashAnimateTime(2000);

    // Resize logic
    function resize() {
      if (!container || !world) return;
      const rect = container.getBoundingClientRect();
      world.width(rect.width).height(rect.height);
    }

    resize();

    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    // Add clouds as separate mesh (optional)
    const THREE = await import("three");
    const cloudsTexture = new THREE.TextureLoader().load(hurricane);
    cloudSphere = new THREE.Mesh(
      new THREE.SphereGeometry(world.getGlobeRadius() * 1.005, 64, 64),
      new THREE.MeshPhongMaterial({
        // color used for lighting the surface — here we make clouds white
        color: 0xffffff, // white clouds

        // alphaMap defines the transparency using the texture's brightness (white = visible, black = transparent)
        alphaMap: cloudsTexture,

        // makes sure transparency is respected in rendering
        transparent: true,

        // disables writing to the depth buffer, so clouds don't occlude globe details
        depthWrite: false,

        // the actual texture for visual detail (optional if alphaMap does the job alone)
        map: cloudsTexture,
        opacity: 1,
      }),
    );
    cloudSphere.raycast = () => {}; // disables pointer events on this mesh
    cloudSphere.rotation.x = Math.PI;
    cloudsTexture.minFilter = THREE.LinearMipMapLinearFilter;
    cloudsTexture.magFilter = THREE.LinearFilter;
    world.scene().add(cloudSphere);
  });

  onDestroy(() => {
    if (resizeObserver && container) {
      resizeObserver.unobserve(container);
    }
    if (world) {
      container.innerHTML = "";
    }
  });

  $: if (world) {
    // Reactively respond to Day Time change, update Night Time accordingly
    if ($globalSettingsStore["Day Time"]?.value) {
      globalSettingsStore.update((store) => {
        world.globeImageUrl($globalSettingsStore["Day Time"].data);
        return store;
      });
    } else {
      globalSettingsStore.update((store) => {
        store["Day Time"].value = false;
        world.globeImageUrl(globeTextures[1]);
        return store;
      });
    }

    world.controls().autoRotate = $globalSettingsStore["Auto Spin"].value;
    world.arcColor(() =>
      $globalSettingsStore["Day Time"].value ? arcColor : "#ffffff",
    );
  }

  $: if (cloudSphere) {
    const nightTimeOpacity = $globalSettingsStore["Day Time"]?.value ? 1 : 0.5;
    cloudSphere.material.opacity = $globalSettingsStore["Clouds"]?.value
      ? nightTimeOpacity
      : 0;
    const cloudRadius = world.getGlobeRadius() * 1.01;
  }
</script>

<div bind:this={container} style="width: 100%; height: 100%"></div>

<style>
  #map-container {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
  }

  #map-container canvas {
    display: block;
    width: 100% !important;
    height: 100% !important;
    object-fit: contain;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
</style>
