<!-- src/src/expore/map/Map3DView.svelte -->
<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { SettingsManager } from "$lib/SettingsManager.js";
  import { get } from "svelte/store";
  import { people, arcs } from "./people";
  import { enableDayNightCycle } from "./day_night_cycle";

  import hurricane from "$lib/local_db/storm_clouds_8k.jpg";
  import day from "$lib/local_db/earth-day.jpg";
  import night from "$lib/local_db/8k_earth_nightmap.jpg";
  import stars from "$lib/local_db/night-sky.png";
  import topology from "$lib/local_db/earth-topology.png";
  // import coutries_110m from "$lib/local_db/countries-110m.json";
  // import { feature } from "topojson-client";

  let container;
  let world;
  let cloudSphere;
  let resizeObserver;
  let THREE;

  function getComputedColor(document, cssVariable) {
    const color = getComputedStyle(document.documentElement).getPropertyValue(
      cssVariable,
    );
    // .trim();
    return color;
  }

  const globeTextures = [
    day || "//unpkg.com/three-globe/example/img/earth-day.jpg",
    night || "//unpkg.com/three-globe/example/img/earth-night.jpg",
  ];

  const bumpTexture =
    topology || "//unpkg.com/three-globe/example/img/earth-topology.png";

  async function addCloudObject(world) {
    const cloudsTexture = new THREE.TextureLoader().load(hurricane);
    // cloudsTexture.flipY = false; // Flip the texture vertically
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
    // Rotate the cloud layer 180° around the X-axis to flip it upside down (vertical inversion)
    cloudSphere.rotation.x = Math.PI;
    // Rotate 180° around the Z-axis to further align the texture properly (horizontal flip)
    cloudSphere.rotation.z = Math.PI * 1;
    // Slightly rotate around the Y-axis to align the hurricane texture with the globe's features
    cloudSphere.rotation.y = Math.PI * 0.45;
    cloudsTexture.minFilter = THREE.LinearMipMapLinearFilter;
    cloudsTexture.magFilter = THREE.LinearFilter;
    world.scene().add(cloudSphere);
    return cloudSphere;
  }

  async function createWorld() {
    const Globe = (await import("globe.gl")).default;
    const { default: ThreeGlobe } = await import("three-globe");
    return Globe()(container);
    // const controls = world.controls();
    // controls.reset(); // resets the controls to their initial state
    // controls.object.position.set(0, 0, 2); // default zoom/distance
    // controls.target.set(0, 0, 0); // look at globe center
    // controls.update();
  }

  function setWorldSettings(world) {
    const bgColor = getComputedColor(document, "--bg-dark");
    world
      .globeImageUrl(day)
      .bumpImageUrl(topology)
      .backgroundColor(bgColor || "#000000")
      .pointOfView({ lat: 40, lng: 25, altitude: 2 }, 0)
      .atmosphereAltitude(0.15);
  }

  function populateWorld(world) {
    const pointColor = getComputedColor(document, "--accent-color");
    world
      .pointsData(people)
      .pointLat("lat")
      .pointLng("lng")
      .pointAltitude(() => 0.01)
      .pointColor(() => pointColor)
      .pointRadius(() => 0.05) // smaller radius, default might be ~0.01 or more
      .pointLabel("name");
  }

  function createArcs(world) {
    const arcColor = getComputedColor(document, "--bg-light");
    world
      .arcsData(arcs)
      .arcStartLat((d) => d.start.lat)
      .arcStartLng((d) => d.start.lng)
      .arcEndLat((d) => d.end.lat)
      .arcEndLng((d) => d.end.lng)
      .arcColor(arcColor)
      .arcDashLength(0.8)
      .arcDashGap(1)
      // .arcAltitude(() => 0.125)
      .arcDashAnimateTime(2000);
  }

  onMount(async () => {
    if (!browser) return;
    if (browser) {
      const threeModule = await import("three");
      THREE = threeModule;
      // Now THREE is ready to use
    }
    // Add clouds as separate mesh (optional)
    // Get CSS variables inside browser only

    world = await createWorld();
    setWorldSettings(world);
    populateWorld(world);
    createArcs(world);

    cloudSphere = await addCloudObject(world);

    // Resize logic
    function resize() {
      if (!container || !world) return;
      const rect = container.getBoundingClientRect();
      world.width(rect.width).height(rect.height);
    }

    resize();
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
  });

  onDestroy(() => {
    if (resizeObserver && container) {
      resizeObserver.unobserve(container);
    }
    if (world) {
      container.innerHTML = "";
    }
  });

  // React to changes
  let stopCycle = () => {};

  // Hanlde Settings, Reactively respond to changes
  $: if (world) {
    SettingsManager.subscribe("Static Light Mode", (value) => {
      world.arcColor(() => (value ? "#d9cd1c" : "#ffffff"));
      if (value) {
        world.globeMaterial(null).globeImageUrl(day);
      } else {
        world.globeMaterial(null).globeImageUrl(night);
      }
    });

    // -- Sun-Casted Orbit Shadow ----------------------------
    SettingsManager.subscribe("Day/Night Cycle", (value) => {
      if (value) {
        stopCycle = enableDayNightCycle(world, THREE, day, night);
      } else {
        stopCycle();
      }
    });

    // -- Stary Background ----------------------------
    SettingsManager.subscribe("Stars", (value) => {
      if (value) {
        world.backgroundImageUrl(stars);
      } else {
        world.backgroundImageUrl(null);
      }
    });

    // -- Globe Spin ------------------------------------
    SettingsManager.subscribe("Auto-Rotate", (value) => {
      world.controls().autoRotate = value;
    });

    // -- Globe Spin ------------------------------------
    SettingsManager.subscribe("Arcs", (value) => {
      const arcColor = value ? "#d9cd1c" : "rgba(0,0,0,0)";
      world.arcColor(() => arcColor);
    });
  }

  // -- Cloud Overlay ------------------------------------
  $: if (cloudSphere) {
    SettingsManager.subscribe("Cloud Overlay", (value) => {
      const staticLightMode = SettingsManager.get("Static Light Mode");
      const nightTimeOpacity = staticLightMode ? 1 : 0.5;
      cloudSphere.material.opacity = value ? nightTimeOpacity : 0;
    });
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
