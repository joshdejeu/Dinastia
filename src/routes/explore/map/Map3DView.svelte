<!-- src/src/expore/map/Map3DView.svelte -->
<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { SettingsManager } from "$lib/SettingsManager.js";
  import { people, arcs } from "./people";
  import { enableDayNightCycle } from "./day_night_cycle";

  import hurricane from "$lib/local_db/storm_clouds_8k.jpg";
  import day from "$lib/local_db/earth-day.jpg";
  import night from "$lib/local_db/8k_earth_nightmap.jpg";
  import stars from "$lib/local_db/night-sky.png";
  import topology from "$lib/local_db/earth-topology.png";

  let container;
  let world;
  let cloudSphere;
  let resizeObserver;
  let THREE;
  let stopCycle = () => {};
  let unsubscribes = [];

  function safeSubscribe(settingName, callback, opts = { skipInitial: true }) {
    const unsub = SettingsManager.subscribe(settingName, callback, opts);
    unsubscribes.push(unsub);
  }

  function getComputedColor(cssVariable, fallback = "#ffffff") {
    let result = getComputedStyle(document.documentElement).getPropertyValue(
      cssVariable,
    );
    if (typeof result !== "string") return fallback;
    result = result.trim();
    return result.length > 0 ? result : fallback;
  }

  async function createWorld() {
    const Globe = (await import("globe.gl")).default;
    return Globe()(container);
  }

  async function addCloudObject(world) {
    const cloudsTexture = new THREE.TextureLoader().load(hurricane);
    cloudSphere = new THREE.Mesh(
      new THREE.SphereGeometry(world.getGlobeRadius() * 1.005, 64, 64),
      new THREE.MeshPhongMaterial({
        color: 0xffffff,
        alphaMap: cloudsTexture,
        transparent: true,
        depthWrite: false,
        map: cloudsTexture,
        opacity: 1,
      }),
    );
    cloudSphere.rotation.x = Math.PI;
    cloudSphere.rotation.z = Math.PI;
    cloudSphere.rotation.y = Math.PI * 0.45;
    cloudsTexture.minFilter = THREE.LinearMipMapLinearFilter;
    cloudsTexture.magFilter = THREE.LinearFilter;
    world.scene().add(cloudSphere);
    return cloudSphere;
  }

  function setupWorld(world) {
    const bgDark = getComputedColor("--bg-dark", "#000000");
    const accent = getComputedColor("--accent-color", "#ffffff");
    const bgLight = getComputedColor("--bg-light", "rgba(255,255,255,1)");

    world
      .globeImageUrl(day)
      .bumpImageUrl(topology)
      .backgroundColor(bgDark)
      .pointOfView({ lat: 40, lng: 25, altitude: 2 }, 0)
      .atmosphereAltitude(0.15)
      .pointsData(people)
      .pointLat("lat")
      .pointLng("lng")
      .pointAltitude(() => 0.01)
      .pointColor(() => accent)
      .pointRadius(() => 0.05)
      .pointLabel("name")
      .arcsData(arcs)
      .arcStartLat((d) => d.start.lat)
      .arcStartLng((d) => d.start.lng)
      .arcEndLat((d) => d.end.lat)
      .arcEndLng((d) => d.end.lng)
      .arcColor(bgLight)
      .arcDashLength(0.8)
      .arcDashGap(1)
      .arcDashAnimateTime(2000);
  }

  function setupSubscriptions(world, cloudSphere) {
    safeSubscribe("Static Light Mode", (value) => {
      world.arcColor(() => (value ? "#d9cd1c" : "#ffffff"));
      world.globeMaterial(null).globeImageUrl(value ? day : night);
    });

    safeSubscribe("Day/Night Cycle", (value) => {
      if (value) {
        stopCycle = enableDayNightCycle(world, THREE, day, night);
      } else {
        stopCycle?.();
        stopCycle = () => {};
        // SettingsManager.set("Static Light Mode", true);
      }
    });

    safeSubscribe("Stars", (value) => {
      world.backgroundImageUrl(value ? stars : null);
    });

    safeSubscribe("Auto-Rotate", (value) => {
      world.controls().autoRotate = value;
    });

    safeSubscribe("Arcs", (value) => {
      const color = value ? "#d9cd1c" : "rgba(0,0,0,0)";
      if (!color || color.trim() === "") {
        world.arcColor(() => "#ffffff");
      } else {
        world.arcColor(() => color);
      }
    });

    if (cloudSphere) {
      safeSubscribe("Cloud Overlay", (value) => {
        const staticLightMode = SettingsManager.get("Static Light Mode");
        cloudSphere.material.opacity = value ? (staticLightMode ? 1 : 0.5) : 0;
      });
    }
  }

  onMount(async () => {
    if (!browser) return;
    THREE = await import("three");
    world = await createWorld();
    setupWorld(world);
    cloudSphere = await addCloudObject(world);

    // Set initial cloud opacity immediately
    const cloudOverlay = SettingsManager.get("Cloud Overlay");
    const staticLightMode = SettingsManager.get("Static Light Mode");
    cloudSphere.material.opacity = cloudOverlay
      ? staticLightMode
        ? 1
        : 0.5
      : 0;

    resizeObserver = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect();
      world.width(rect.width).height(rect.height);
    });
    resizeObserver.observe(container);

    setupSubscriptions(world, cloudSphere);
  });

  onDestroy(() => {
    unsubscribes.forEach((unsub) => unsub?.());
    unsubscribes = [];
    stopCycle?.();
    resizeObserver?.disconnect();
    container.innerHTML = "";
  });
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
