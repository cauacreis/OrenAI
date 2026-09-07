import * as THREE from "./assets/three.module.js";
import { OrbitControls } from "./assets/three-addons/controls/OrbitControls.js";

const container = document.querySelector("#subsurfaceViewport");
const data = window.OrenAIMapData || { targets: [], terrainHotspots: [] };

const layerConfig = {
  prospectivity: {
    metric: "score",
    threshold: 55,
    title: "Score MAPDA",
    heat: ["#ffd37a", "#f07a32", "#bf241f"],
  },
  geochemistry: {
    metric: "geochem",
    threshold: 56,
    title: "Geoquimica",
    heat: ["#ffe0a3", "#dc7b2f", "#a33123"],
  },
  risk: {
    metric: "risk",
    threshold: 34,
    title: "Risco",
    heat: ["#f3d29a", "#e2763f", "#9b211b"],
  },
};

const world = {
  width: 10,
  depth: 6.4,
  height: 3.4,
};

let activeLayer = "prospectivity";
let activeView = "surface";
let renderer;
let scene;
let camera;
let controls;
let surfaceMaterial;
let heatTexture;
let volumeGroup;
let markerGroup;
let animationFrame = 0;
let isReady = false;

function metricValue(hotspot) {
  const config = layerConfig[activeLayer] || layerConfig.prospectivity;
  return hotspot[config.metric] || 0;
}

function metricIntensity(hotspot) {
  const value = metricValue(hotspot);
  const divisor = activeLayer === "risk" ? 72 : 92;
  return THREE.MathUtils.clamp(value / divisor, 0.18, 1);
}

function toWorld(x, y, elevation = 0) {
  return new THREE.Vector3((x - 0.5) * world.width, elevation, (y - 0.5) * world.depth);
}

function hexToColor(hex) {
  return new THREE.Color(hex);
}

function setObjectOpacity(object, opacity) {
  object.traverse((child) => {
    if (child.material) {
      child.material.opacity = opacity;
      child.material.needsUpdate = true;
    }
  });
}

function createRenderer() {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);
}

function createScene() {
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xf7f6f2, 12, 26);

  camera = new THREE.PerspectiveCamera(39, 1, 0.1, 80);
  camera.position.set(5.4, 2.65, 6.5);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0.15, -1.55, 0.08);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.34;
  controls.minDistance = 5.8;
  controls.maxDistance = 14;
  controls.minPolarAngle = 0.35;
  controls.maxPolarAngle = 1.42;
  controls.update();

  const ambient = new THREE.HemisphereLight(0xffffff, 0xd7cdbd, 1.85);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 2.35);
  key.position.set(-3.4, 6.5, 4.6);
  key.castShadow = true;
  scene.add(key);

  const warm = new THREE.PointLight(0xff8b3d, 2.2, 9);
  warm.position.set(2.4, -2.05, 1.1);
  scene.add(warm);
}

function createHeatTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 656;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const config = layerConfig[activeLayer] || layerConfig.prospectivity;
  data.terrainHotspots.forEach((hotspot) => {
    const intensity = metricIntensity(hotspot);
    const x = hotspot.x * canvas.width;
    const y = hotspot.y * canvas.height;
    const radius = canvas.width * (0.13 + intensity * 0.08);
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `${config.heat[2]}d8`);
    gradient.addColorStop(0.38, `${config.heat[1]}9a`);
    gradient.addColorStop(0.74, `${config.heat[0]}4a`);
    gradient.addColorStop(1, `${config.heat[0]}00`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(x, y, radius * 1.25, radius * 0.62, -0.24, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return texture;
}

function createSurface() {
  heatTexture = createHeatTexture();

  const surfaceGeometry = new THREE.PlaneGeometry(world.width, world.depth, 96, 56);
  const positions = surfaceGeometry.attributes.position;
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const y = positions.getY(index);
    const lift = Math.sin(x * 1.25) * 0.035 + Math.cos(y * 1.45) * 0.025;
    positions.setZ(index, lift);
  }
  positions.needsUpdate = true;
  surfaceGeometry.computeVertexNormals();
  surfaceGeometry.rotateX(-Math.PI / 2);

  surfaceMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xf7f2e7,
    map: heatTexture,
    roughness: 0.72,
    clearcoat: 0.08,
    transparent: true,
    opacity: 0.46,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
  surface.position.y = 0;
  surface.receiveShadow = true;
  scene.add(surface);
}

function createBoundingVolume() {
  const box = new THREE.BoxGeometry(world.width, world.height, world.depth);
  const edges = new THREE.EdgesGeometry(box);
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({
      color: 0x9a9180,
      transparent: true,
      opacity: 0.28,
    }),
  );
  line.position.y = -world.height / 2;
  scene.add(line);

  const bottom = new THREE.Mesh(
    new THREE.PlaneGeometry(world.width, world.depth),
    new THREE.MeshBasicMaterial({
      color: 0xe8e2d7,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  bottom.rotation.x = -Math.PI / 2;
  bottom.position.y = -world.height;
  scene.add(bottom);
}

function createDepthSlices() {
  const sliceMaterial = new THREE.MeshBasicMaterial({
    color: 0xd8cab6,
    transparent: true,
    opacity: 0.065,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x9a8f80,
    transparent: true,
    opacity: 0.22,
  });

  [-0.92, -1.78, -2.64].forEach((level) => {
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(world.width, world.depth), sliceMaterial.clone());
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = level;
    scene.add(plane);

    const edgeGeometry = new THREE.EdgesGeometry(new THREE.PlaneGeometry(world.width, world.depth));
    const edge = new THREE.LineSegments(edgeGeometry, lineMaterial);
    edge.rotation.x = -Math.PI / 2;
    edge.position.y = level + 0.01;
    scene.add(edge);
  });
}

function createHexGrid() {
  const vertices = [];
  const radius = 0.28;
  const rowStep = radius * 1.52;
  const colStep = radius * Math.sqrt(3);
  for (let row = 0; row < 16; row += 1) {
    for (let col = 0; col < 24; col += 1) {
      const x = -world.width / 2 + 0.42 + col * colStep + (row % 2) * colStep * 0.5;
      const z = -world.depth / 2 + 0.34 + row * rowStep;
      if (x > world.width / 2 - 0.25 || z > world.depth / 2 - 0.25) continue;
      const points = [];
      for (let side = 0; side < 6; side += 1) {
        const angle = Math.PI / 6 + side * (Math.PI / 3);
        points.push([x + Math.cos(angle) * radius, 0.065, z + Math.sin(angle) * radius]);
      }
      for (let side = 0; side < 6; side += 1) {
        const a = points[side];
        const b = points[(side + 1) % 6];
        vertices.push(...a, ...b);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  const grid = new THREE.LineSegments(
    geometry,
    new THREE.LineBasicMaterial({
      color: 0x8f897c,
      transparent: true,
      opacity: 0.34,
    }),
  );
  scene.add(grid);
}

function createContourLines() {
  const material = new THREE.LineBasicMaterial({
    color: 0xb1aa9a,
    transparent: true,
    opacity: 0.3,
  });

  for (let band = 0; band < 7; band += 1) {
    const points = [];
    for (let step = 0; step < 90; step += 1) {
      const t = step / 89;
      const x = -world.width / 2 + t * world.width;
      const z = -world.depth / 2 + 0.48 + band * 0.82 + Math.sin(t * Math.PI * 3 + band) * 0.12;
      points.push(new THREE.Vector3(x, 0.095 + band * 0.004, z));
    }
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material);
    scene.add(line);
  }
}

function createTextSprite(text, color = "#17191b") {
  const canvas = document.createElement("canvas");
  canvas.width = 192;
  canvas.height = 72;
  const ctx = canvas.getContext("2d");
  ctx.font = "700 28px Segoe UI, Arial, sans-serif";
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  ctx.fillText(text, 10, 36);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(1.25, 0.47, 1);
  return sprite;
}

function createMarkers() {
  markerGroup = new THREE.Group();
  const markerGeometry = new THREE.SphereGeometry(0.075, 24, 12);

  data.targets.forEach((target) => {
    const point = toWorld(target.x, target.y, 0.18);
    const color = target.status === "rejeitado" ? 0xd94b37 : target.status === "confirmado" ? 0x2b9b60 : 0x117e7f;
    const marker = new THREE.Mesh(
      markerGeometry,
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.52,
        metalness: 0.05,
      }),
    );
    marker.position.copy(point);
    marker.castShadow = true;
    markerGroup.add(marker);

    const label = createTextSprite(target.id.replace("AM-", "A"));
    label.position.copy(point).add(new THREE.Vector3(0.34, 0.1, 0.02));
    markerGroup.add(label);
  });

  scene.add(markerGroup);
}

function createDropLine(hotspot, center) {
  const surface = toWorld(hotspot.x, hotspot.y, 0.04);
  const geometry = new THREE.BufferGeometry().setFromPoints([surface, center]);
  const line = new THREE.Line(
    geometry,
    new THREE.LineDashedMaterial({
      color: 0x8a8172,
      dashSize: 0.09,
      gapSize: 0.08,
      transparent: true,
      opacity: 0.42,
    }),
  );
  line.computeLineDistances();
  return line;
}

function createDensityCloud(hotspot, center, index, intensity, colorStops) {
  const count = Math.round(150 + intensity * 170);
  const positions = [];
  const colors = [];
  const colorA = hexToColor(colorStops[0]);
  const colorB = hexToColor(colorStops[1]);
  const colorC = hexToColor(colorStops[2]);

  for (let i = 0; i < count; i += 1) {
    const seed = (i + 1) * (index + 2);
    const rx = Math.sin(seed * 12.9898) * 43758.5453;
    const rz = Math.sin(seed * 78.233) * 24634.6345;
    const ry = Math.sin(seed * 37.719) * 17321.9171;
    const nx = (rx - Math.floor(rx) - 0.5) * 1.55;
    const ny = (ry - Math.floor(ry) - 0.5) * 0.62;
    const nz = (rz - Math.floor(rz) - 0.5) * 1.05;
    const taper = 1 - Math.min(0.72, Math.sqrt(nx * nx + nz * nz) * 0.34);
    positions.push(
      center.x + nx * (0.78 + intensity * 0.55),
      center.y + ny * (0.62 + intensity * 0.34) * taper,
      center.z + nz * (0.56 + intensity * 0.52),
    );
    const mixed = colorA.clone().lerp(colorB, Math.min(1, intensity * 0.9)).lerp(colorC, i / count > 0.72 ? 0.5 : 0.12);
    colors.push(mixed.r, mixed.g, mixed.b);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 0.068,
      transparent: true,
      opacity: 0.78,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
}

function createVolumeBlob(hotspot, index, config) {
  const intensity = metricIntensity(hotspot);
  const center = toWorld(
    hotspot.x + Math.sin(index * 2.13) * 0.02,
    hotspot.y + Math.cos(index * 1.77) * 0.025,
    -1.12 - intensity * 1.15 - index * 0.12,
  );

  const group = new THREE.Group();
  group.add(createDropLine(hotspot, center));

  const baseRotation = new THREE.Euler(-0.16, -0.62 + index * 0.28, 0.1);
  const sphere = new THREE.SphereGeometry(1, 48, 24);
  const scales = [
    [1.9 + intensity * 0.9, 0.5 + intensity * 0.2, 0.98 + intensity * 0.5, 0.28],
    [1.18 + intensity * 0.7, 0.38 + intensity * 0.18, 0.68 + intensity * 0.38, 0.52],
    [0.62 + intensity * 0.48, 0.2 + intensity * 0.12, 0.36 + intensity * 0.26, 0.78],
  ];

  scales.forEach((scale, layerIndex) => {
    const color = layerIndex === 0 ? config.heat[0] : layerIndex === 1 ? config.heat[1] : config.heat[2];
    const material = new THREE.MeshPhysicalMaterial({
      color,
      emissive: layerIndex === 2 ? 0x4c0c09 : 0x2d0806,
      emissiveIntensity: layerIndex === 2 ? 0.18 : 0.08,
      roughness: 0.46,
      clearcoat: 0.18,
      transmission: layerIndex === 0 ? 0.08 : 0,
      transparent: true,
      opacity: scale[3],
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(sphere, material);
    mesh.position.copy(center).add(new THREE.Vector3(layerIndex * 0.08, layerIndex * 0.045, -layerIndex * 0.05));
    mesh.rotation.copy(baseRotation);
    mesh.scale.set(scale[0], scale[1], scale[2]);
    mesh.castShadow = true;
    group.add(mesh);
  });

  group.add(createDensityCloud(hotspot, center, index, intensity, config.heat));
  return group;
}

function disposeGroup(group) {
  group.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((material) => material.dispose());
      } else {
        child.material.dispose();
      }
    }
  });
  group.clear();
}

function rebuildVolumes() {
  if (volumeGroup) {
    scene.remove(volumeGroup);
    disposeGroup(volumeGroup);
  }

  const config = layerConfig[activeLayer] || layerConfig.prospectivity;
  volumeGroup = new THREE.Group();

  data.terrainHotspots
    .filter((hotspot) => metricValue(hotspot) >= config.threshold)
    .sort((left, right) => metricValue(left) - metricValue(right))
    .forEach((hotspot, index) => {
      volumeGroup.add(createVolumeBlob(hotspot, index, config));
    });

  scene.add(volumeGroup);
}

function updateHeatLayer() {
  if (!surfaceMaterial) return;
  if (heatTexture) heatTexture.dispose();
  heatTexture = createHeatTexture();
  surfaceMaterial.map = heatTexture;
  surfaceMaterial.needsUpdate = true;
  rebuildVolumes();
}

function setCameraForSize() {
  const width = Math.max(1, container.clientWidth);
  const height = Math.max(1, container.clientHeight);
  camera.aspect = width / height;
  if (width < 640) {
    camera.position.set(6.4, 4.8, 8.8);
  } else {
    camera.position.set(5.4, 2.65, 6.5);
  }
  controls.target.set(0.15, -1.55, 0.08);
  camera.updateProjectionMatrix();
  controls.update();
}

function resize() {
  if (!renderer || !container) return;
  const width = Math.max(1, container.clientWidth);
  const height = Math.max(1, container.clientHeight);
  renderer.setSize(width, height, false);
  setCameraForSize();
  renderer.render(scene, camera);
}

function animate() {
  animationFrame = window.requestAnimationFrame(animate);
  if (activeView === "subsurface") {
    controls.update();
    renderer.render(scene, camera);
  }
}

function init() {
  if (!container || isReady) return;
  createRenderer();
  createScene();
  createSurface();
  createBoundingVolume();
  createDepthSlices();
  createHexGrid();
  createContourLines();
  createMarkers();
  rebuildVolumes();
  resize();
  animate();
  isReady = true;
  container.dataset.ready = "true";
  window.dispatchEvent(new CustomEvent("orenai:subsurface-ready"));
}

window.OrenAISubsurfaceScene = {
  setLayer(layer) {
    if (!layerConfig[layer]) return;
    if (activeLayer === layer && isReady) return;
    activeLayer = layer;
    if (isReady) updateHeatLayer();
  },
  setView(view) {
    activeView = view;
    if (container) {
      setObjectOpacity(markerGroup || scene, view === "subsurface" ? 1 : 0.72);
    }
    if (view === "subsurface" && isReady) resize();
  },
  resize,
  getStatus() {
    return {
      ready: isReady,
      activeLayer,
      activeView,
      renderer: Boolean(renderer),
      volumes: volumeGroup ? volumeGroup.children.length : 0,
      markers: markerGroup ? markerGroup.children.length : 0,
      animationFrame: Boolean(animationFrame),
      width: container ? container.clientWidth : 0,
      height: container ? container.clientHeight : 0,
    };
  },
};

try {
  init();
} catch (error) {
  if (container) {
    container.dataset.ready = "false";
    container.textContent = "Visualizacao 3D indisponivel neste navegador.";
  }
}
