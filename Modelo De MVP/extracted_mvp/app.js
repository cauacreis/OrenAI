const prospectivityCanvas = document.querySelector("#prospectivityChart");
const prospectivityContext = prospectivityCanvas.getContext("2d");
const terrainCanvas = document.querySelector("#terrainHeatmap");
const terrainContext = terrainCanvas.getContext("2d");
const heatmapWrap = document.querySelector(".heatmap-wrap");
const subsurfaceViewport = document.querySelector("#subsurfaceViewport");
const targetRows = document.querySelector("#targetRows");
const toast = document.querySelector("#toast");
const datasetName = document.querySelector("#datasetName");
const datasetSummary = document.querySelector("#datasetSummary");
const reviewedCount = document.querySelector("#reviewedCount");
const reportCard = document.querySelector("#reportCard p");
const fileInput = document.querySelector("#fileInput");
const runAnalysisButton = document.querySelector("#runAnalysisButton");
const reportDialog = document.querySelector("#reportDialog");
const reportSummary = document.querySelector("#reportSummary");
const downloadReportButton = document.querySelector("#downloadReportButton");

const scenarios = {
  base: {
    targets: 24,
    strong: 7,
    confidence: "68% - 91%",
    trend: [34, 38, 42, 48, 52, 59, 63, 69, 74, 82, 86],
    baseline: [32, 35, 38, 41, 45, 49, 54, 58, 63, 67, 72],
  },
  upside: {
    targets: 31,
    strong: 11,
    confidence: "61% - 88%",
    trend: [36, 43, 49, 57, 62, 70, 74, 79, 83, 89, 92],
    baseline: [32, 36, 40, 44, 49, 53, 58, 62, 67, 71, 75],
  },
  conservative: {
    targets: 16,
    strong: 4,
    confidence: "74% - 93%",
    trend: [31, 34, 39, 43, 47, 52, 57, 61, 66, 72, 77],
    baseline: [30, 32, 35, 38, 42, 46, 51, 55, 59, 63, 67],
  },
};

const targets = [
  {
    id: "AM-024",
    region: "Crixás Norte",
    score: 91,
    factors: ["Au", "As", "Cu"],
    status: "pendente",
    x: 0.72,
    y: 0.28,
    risk: 18,
  },
  {
    id: "AM-018",
    region: "Serra Verde",
    score: 84,
    factors: ["Zn", "Pb", "Mn"],
    status: "confirmado",
    x: 0.62,
    y: 0.42,
    risk: 22,
  },
  {
    id: "AM-041",
    region: "Porongos",
    score: 79,
    factors: ["Cu", "Fe", "As"],
    status: "pendente",
    x: 0.48,
    y: 0.56,
    risk: 35,
  },
  {
    id: "AM-007",
    region: "Jales Oeste",
    score: 73,
    factors: ["Ag", "Pb", "Zn"],
    status: "rejeitado",
    x: 0.24,
    y: 0.68,
    risk: 64,
  },
  {
    id: "AM-033",
    region: "Lateritinga",
    score: 68,
    factors: ["Au", "Fe", "Mn"],
    status: "pendente",
    x: 0.36,
    y: 0.32,
    risk: 42,
  },
  {
    id: "AM-052",
    region: "Cristalina Sul",
    score: 64,
    factors: ["Cu", "Mo", "Fe"],
    status: "pendente",
    x: 0.82,
    y: 0.62,
    risk: 29,
  },
];

const terrainHotspots = [
  { x: 0.72, y: 0.28, score: 92, geochem: 88, risk: 21, label: "Zona A" },
  { x: 0.58, y: 0.44, score: 82, geochem: 75, risk: 28, label: "Zona B" },
  { x: 0.34, y: 0.34, score: 69, geochem: 72, risk: 44, label: "Zona C" },
  { x: 0.22, y: 0.70, score: 58, geochem: 81, risk: 68, label: "Ruído SW" },
  { x: 0.84, y: 0.62, score: 66, geochem: 59, risk: 31, label: "Cu-Mo" },
];

window.OrenAIMapData = {
  targets,
  terrainHotspots,
};

let activeScenario = "base";
let activeLayer = "prospectivity";
let activeMapView = "surface";
let analysisRuns = 1;
let datasetState = {
  name: "geoquimica_demo.csv",
  samples: 128,
  variables: 11,
  integrity: 96,
  outliers: 14,
};

function colorToken(name, fallback) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    toast.classList.remove("visible");
  }, 2600);
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function prepareCanvas(canvas, context) {
  const ratio = window.devicePixelRatio || 1;
  const bounds = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.round(bounds.width * ratio));
  canvas.height = Math.max(1, Math.round(bounds.height * ratio));
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { width: bounds.width, height: bounds.height };
}

function updateMapVisibility() {
  if (!heatmapWrap || !subsurfaceViewport) return;
  heatmapWrap.dataset.view = activeMapView;
  terrainCanvas.hidden = activeMapView !== "surface";
  subsurfaceViewport.hidden = activeMapView !== "subsurface";
}

function syncSubsurfaceScene() {
  updateMapVisibility();
  if (window.OrenAISubsurfaceScene) {
    window.OrenAISubsurfaceScene.setLayer(activeLayer);
    window.OrenAISubsurfaceScene.setView(activeMapView);
    window.OrenAISubsurfaceScene.resize();
  }
}

function resizeCanvases() {
  drawProspectivityChart();
  drawTerrainHeatmap();
  syncSubsurfaceScene();
}

function drawProspectivityChart() {
  const { width, height } = prepareCanvas(prospectivityCanvas, prospectivityContext);
  const context = prospectivityContext;
  const data = scenarios[activeScenario];
  const padding = { top: 28, right: 42, bottom: 44, left: 56 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const labels = ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11"];
  const minValue = 20;
  const maxValue = 100;
  const chartBackground = colorToken("--chart-bg", "#0F1516");
  const chartGrid = colorToken("--chart-grid", "#273234");
  const chartLabel = colorToken("--chart-label", "#73817F");
  const chartRange = colorToken("--chart-range", "rgba(72, 209, 206, 0.14)");
  const chartAnnotation = colorToken("--chart-annotation", "#f1f6f4");
  const chartAnnotationLine = colorToken("--chart-annotation-line", "#6f7d79");
  const chartLine = colorToken("--chart-line", "#48D1CE");
  const chartBaseline = colorToken("--chart-baseline", "#8BB8B5");

  context.clearRect(0, 0, width, height);
  context.fillStyle = chartBackground;
  context.fillRect(0, 0, width, height);

  function xAt(index) {
    return padding.left + (chartWidth / (data.trend.length - 1)) * index;
  }

  function yAt(value) {
    const normalized = (value - minValue) / (maxValue - minValue);
    return padding.top + chartHeight - normalized * chartHeight;
  }

  context.strokeStyle = chartGrid;
  context.lineWidth = 1;
  context.setLineDash([4, 5]);
  context.fillStyle = chartLabel;
  context.font = "12px Segoe UI, sans-serif";

  for (let value = 20; value <= 100; value += 20) {
    const y = yAt(value);
    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.stroke();
    context.fillText(String(value), 14, y + 4);
  }
  context.setLineDash([]);

  context.fillStyle = chartRange;
  context.beginPath();
  data.trend.forEach((value, index) => {
    const x = xAt(index);
    const y = yAt(Math.min(100, value + 10));
    index === 0 ? context.moveTo(x, y) : context.lineTo(x, y);
  });
  [...data.trend].reverse().forEach((value, reverseIndex) => {
    const index = data.trend.length - 1 - reverseIndex;
    context.lineTo(xAt(index), yAt(Math.max(20, value - 11)));
  });
  context.closePath();
  context.fill();

  context.strokeStyle = chartLine;
  context.lineWidth = 3;
  context.beginPath();
  data.trend.forEach((value, index) => {
    const x = xAt(index);
    const y = yAt(value);
    index === 0 ? context.moveTo(x, y) : context.lineTo(x, y);
  });
  context.stroke();

  context.strokeStyle = chartBaseline;
  context.lineWidth = 2;
  context.setLineDash([10, 10]);
  context.beginPath();
  data.baseline.forEach((value, index) => {
    const x = xAt(index);
    const y = yAt(value);
    index === 0 ? context.moveTo(x, y) : context.lineTo(x, y);
  });
  context.stroke();
  context.setLineDash([]);

  data.trend.forEach((value, index) => {
    const x = xAt(index);
    const y = yAt(value);
    context.fillStyle = chartLine;
    context.beginPath();
    context.arc(x, y, index === 5 ? 7 : 5, 0, Math.PI * 2);
    context.fill();
  });

  [
    { index: 3, label: "Au + As\ncrescem juntos", offset: -48 },
    { index: 6, label: "limiar MAPDA\natingido", offset: -58 },
    { index: 9, label: "revisão HITL\nconfirmada", offset: -64 },
  ].forEach((item) => {
    const x = xAt(item.index);
    const y = yAt(data.trend[item.index]);
    context.strokeStyle = chartAnnotationLine;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(x, y - 8);
    context.lineTo(x, y + item.offset + 22);
    context.stroke();
    context.fillStyle = chartAnnotation;
    context.beginPath();
    context.arc(x, y + item.offset + 18, 4, 0, Math.PI * 2);
    context.fill();
    context.font = "12px Segoe UI, sans-serif";
    item.label.split("\n").forEach((line, lineIndex) => {
      context.fillText(line, x - 42, y + item.offset + lineIndex * 14);
    });
  });

  context.fillStyle = chartLabel;
  labels.forEach((label, index) => {
    context.fillText(label, xAt(index) - 8, height - 18);
  });

  context.fillStyle = chartLine;
  context.font = "700 12px Segoe UI, sans-serif";
  context.fillText(`Score final ${data.trend.at(-1)}%`, width - 138, yAt(data.trend.at(-1)) + 5);
}

function heatColor(value, layer) {
  if (layer === "risk") {
    return value > 60 ? "rgba(240, 107, 95, 0.48)" : "rgba(214, 168, 79, 0.26)";
  }

  if (layer === "geochemistry") {
    return value > 80 ? "rgba(214, 168, 79, 0.48)" : "rgba(98, 211, 148, 0.24)";
  }

  return value > 85 ? "rgba(72, 209, 206, 0.50)" : "rgba(40, 175, 174, 0.26)";
}

function drawTerrainHeatmap() {
  updateMapVisibility();
  if (activeMapView === "subsurface") {
    syncSubsurfaceScene();
    return;
  }

  const { width, height } = prepareCanvas(terrainCanvas, terrainContext);
  const context = terrainContext;
  const surface = colorToken("--chart-bg", "#fbfaf6");
  const grid = colorToken("--chart-grid", "#e5ded2");
  const teal = colorToken("--teal", "#117e7f");
  const text = colorToken("--ink", "#17191b");
  const muted = colorToken("--muted", "#777975");
  const heatOrange = colorToken("--heat-orange", "#f07a32");
  const heatRed = colorToken("--heat-red", "#bf241f");
  const heatYellow = colorToken("--heat-yellow", "#ffd37a");

  context.clearRect(0, 0, width, height);
  context.fillStyle = surface;
  context.fillRect(0, 0, width, height);

  const metricKey = activeLayer === "prospectivity" ? "score" : activeLayer === "geochemistry" ? "geochem" : "risk";
  const activeHotspots = terrainHotspots.map((hotspot) => ({
    ...hotspot,
    metric: hotspot[metricKey],
  }));

  function hotspotIntensity(metric) {
    if (activeLayer === "risk") return Math.min(1, Math.max(0.22, metric / 72));
    return Math.min(1, Math.max(0.22, metric / 92));
  }

  function layerLabel() {
    if (activeLayer === "risk") return "Camada: risco";
    if (activeLayer === "geochemistry") return "Camada: geoquimica";
    return "Camada: score MAPDA";
  }

  function drawInfoBox(title, subtitle) {
    context.fillStyle = "rgba(255, 255, 255, 0.78)";
    context.fillRect(18, 18, 238, 74);
    context.strokeStyle = "rgba(17, 126, 127, 0.26)";
    context.lineWidth = 1;
    context.strokeRect(18, 18, 238, 74);
    context.fillStyle = teal;
    context.font = "800 12px Segoe UI, sans-serif";
    context.fillText(title, 34, 45);
    context.fillStyle = muted;
    context.font = "12px Segoe UI, sans-serif";
    context.fillText(subtitle, 34, 67);
  }

  function drawLegend(label) {
    const legendY = height - 34;
    const legendX = Math.max(24, width - 184);
    context.fillStyle = heatOrange;
    context.beginPath();
    context.arc(legendX, legendY, 5, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = heatRed;
    context.beginPath();
    context.arc(legendX + 44, legendY, 5, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = teal;
    context.beginPath();
    context.arc(legendX + 88, legendY, 5, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = text;
    context.font = "700 12px Segoe UI, sans-serif";
    context.fillText(label, legendX + 104, legendY + 4);
  }

  function drawSurfaceView() {
    const map = {
      x: width * 0.07,
      y: height * 0.14,
      w: width * 0.84,
      h: height * 0.68,
    };

    function point(x, y) {
      return { x: map.x + x * map.w, y: map.y + y * map.h };
    }

    const terrainGradient = context.createLinearGradient(map.x, map.y, map.x + map.w, map.y + map.h);
    terrainGradient.addColorStop(0, "rgba(255, 255, 255, 0.96)");
    terrainGradient.addColorStop(0.62, "rgba(244, 241, 233, 0.95)");
    terrainGradient.addColorStop(1, "rgba(232, 226, 215, 0.88)");
    context.fillStyle = terrainGradient;
    context.fillRect(map.x, map.y, map.w, map.h);
    context.strokeStyle = "rgba(137, 130, 116, 0.28)";
    context.strokeRect(map.x, map.y, map.w, map.h);

    context.save();
    context.beginPath();
    context.rect(map.x, map.y, map.w, map.h);
    context.clip();

    context.strokeStyle = grid;
    context.lineWidth = 1;
    for (let col = 0; col <= 12; col += 1) {
      const x = map.x + (map.w / 12) * col;
      context.beginPath();
      context.moveTo(x, map.y);
      context.lineTo(x, map.y + map.h);
      context.stroke();
    }
    for (let row = 0; row <= 7; row += 1) {
      const y = map.y + (map.h / 7) * row;
      context.beginPath();
      context.moveTo(map.x, y);
      context.lineTo(map.x + map.w, y);
      context.stroke();
    }

    context.strokeStyle = "rgba(127, 118, 98, 0.16)";
    for (let band = 0; band < 7; band += 1) {
      context.beginPath();
      for (let x = map.x - 20; x <= map.x + map.w + 20; x += 14) {
        const y = map.y + 24 + band * 34 + Math.sin(x / 62 + band * 0.75) * 9 + Math.cos(x / 43 + band) * 4;
        x === map.x - 20 ? context.moveTo(x, y) : context.lineTo(x, y);
      }
      context.stroke();
    }

    activeHotspots.forEach((hotspot) => {
      const center = point(hotspot.x, hotspot.y);
      const intensity = hotspotIntensity(hotspot.metric);
      const radius = Math.min(map.w, map.h) * (0.22 + intensity * 0.12);
      const gradient = context.createRadialGradient(center.x, center.y, 0, center.x, center.y, radius);
      gradient.addColorStop(0, `rgba(191, 36, 31, ${0.16 + intensity * 0.28})`);
      gradient.addColorStop(0.34, `rgba(240, 122, 50, ${0.14 + intensity * 0.22})`);
      gradient.addColorStop(0.72, `rgba(255, 211, 122, ${0.08 + intensity * 0.12})`);
      gradient.addColorStop(1, "rgba(255, 211, 122, 0)");
      context.fillStyle = gradient;
      context.beginPath();
      context.ellipse(center.x, center.y, radius * 1.2, radius * 0.72, -0.14, 0, Math.PI * 2);
      context.fill();
    });
    context.restore();

    targets.forEach((target) => {
      const center = point(target.x, target.y);
      const isConfirmed = target.status === "confirmado";
      const isRejected = target.status === "rejeitado";
      context.fillStyle = isRejected ? colorToken("--red", "#d94b37") : isConfirmed ? colorToken("--green", "#2b9b60") : teal;
      context.strokeStyle = "rgba(255, 255, 255, 0.94)";
      context.lineWidth = 3;
      context.beginPath();
      context.arc(center.x, center.y, isConfirmed ? 7 : 6, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      context.fillStyle = text;
      context.font = "700 11px Segoe UI, sans-serif";
      context.fillText(target.id.replace("AM-", "A"), center.x + 10, center.y + 4);
    });

    drawInfoBox(layerLabel(), "Superficie 2D: leitura por cima");
    drawLegend("calor / alvo");
  }

  function drawSubsurfaceView() {
    const bounds = {
      originX: width * 0.1,
      originY: height * 0.25,
      planeW: width * 0.68,
      planeH: height * 0.35,
      skewX: width * 0.18,
      depth: height * 0.28,
    };

    function project(x, y, z = 0) {
      return {
        x: bounds.originX + x * bounds.planeW + (y - 0.5) * bounds.skewX,
        y: bounds.originY + y * bounds.planeH - z * bounds.depth,
      };
    }

    function planePath(z = 0) {
      const corners = [
        project(0, 0, z),
        project(1, 0, z),
        project(1, 1, z),
        project(0, 1, z),
      ];
      context.beginPath();
      corners.forEach((corner, index) => {
        index === 0 ? context.moveTo(corner.x, corner.y) : context.lineTo(corner.x, corner.y);
      });
      context.closePath();
      return corners;
    }

    function drawHexGrid(z, alpha) {
      context.save();
      planePath(z);
      context.clip();
      context.globalAlpha = alpha;
      context.strokeStyle = "rgba(118, 112, 100, 0.46)";
      context.lineWidth = 1;
      for (let row = 0; row <= 9; row += 1) {
        for (let col = 0; col <= 16; col += 1) {
          const x = 0.05 + col * 0.06 + (row % 2) * 0.03;
          const y = 0.08 + row * 0.09;
          if (x >= 0.98 || y >= 0.95) continue;
          context.beginPath();
          for (let i = 0; i < 6; i += 1) {
            const angle = Math.PI / 6 + i * (Math.PI / 3);
            const point = project(x + Math.cos(angle) * 0.034, y + Math.sin(angle) * 0.034, z);
            i === 0 ? context.moveTo(point.x, point.y) : context.lineTo(point.x, point.y);
          }
          context.closePath();
          context.stroke();
        }
      }
      context.restore();
    }

    function drawProjectedPatch(hotspot, z, opacity) {
      const center = project(hotspot.x, hotspot.y, z);
      const intensity = hotspotIntensity(hotspot.metric);
      const radius = Math.min(width, height) * (0.12 + intensity * 0.05);
      const gradient = context.createRadialGradient(center.x, center.y, 0, center.x, center.y, radius);
      gradient.addColorStop(0, `rgba(191, 36, 31, ${opacity * (0.24 + intensity * 0.28)})`);
      gradient.addColorStop(0.38, `rgba(240, 122, 50, ${opacity * (0.2 + intensity * 0.22)})`);
      gradient.addColorStop(0.78, `rgba(255, 211, 122, ${opacity * (0.12 + intensity * 0.1)})`);
      gradient.addColorStop(1, "rgba(255, 211, 122, 0)");
      context.fillStyle = gradient;
      context.beginPath();
      context.ellipse(center.x, center.y, radius * 1.36, radius * 0.48, -0.36, 0, Math.PI * 2);
      context.fill();
    }

    function drawSubsurfaceVolume(hotspot, index) {
      const intensity = hotspotIntensity(hotspot.metric);
      const center = project(hotspot.x, hotspot.y, -0.72 - index * 0.04);
      const size = Math.min(width, height) * (0.09 + intensity * 0.08);
      const angle = -0.42 + index * 0.11;

      for (let layer = 3; layer >= 0; layer -= 1) {
        const lift = layer * size * 0.11;
        const gradient = context.createRadialGradient(center.x, center.y - lift, 0, center.x, center.y - lift, size * (1.1 + layer * 0.1));
        gradient.addColorStop(0, `rgba(104, 20, 19, ${0.28 + intensity * 0.28})`);
        gradient.addColorStop(0.4, `rgba(191, 36, 31, ${0.24 + intensity * 0.28})`);
        gradient.addColorStop(0.74, `rgba(240, 122, 50, ${0.16 + intensity * 0.2})`);
        gradient.addColorStop(1, "rgba(255, 211, 122, 0)");
        context.fillStyle = gradient;
        context.beginPath();
        context.ellipse(center.x, center.y - lift, size * (1.46 - layer * 0.08), size * (0.52 - layer * 0.04), angle, 0, Math.PI * 2);
        context.fill();
      }

      context.fillStyle = `rgba(104, 20, 19, ${0.22 + intensity * 0.22})`;
      context.beginPath();
      context.ellipse(center.x + size * 0.2, center.y - size * 0.18, size * 0.54, size * 0.2, angle, 0, Math.PI * 2);
      context.fill();
    }

    const topZ = 0.56;
    const bottomZ = -0.96;
    const topCorners = planePath(topZ);
    const bottomCorners = planePath(bottomZ);

    context.fillStyle = "rgba(201, 135, 43, 0.05)";
    context.fill();
    context.strokeStyle = "rgba(137, 130, 116, 0.2)";
    context.stroke();

    context.strokeStyle = "rgba(116, 107, 91, 0.24)";
    context.lineWidth = 1;
    topCorners.forEach((corner, index) => {
      const bottom = bottomCorners[index];
      context.beginPath();
      context.moveTo(corner.x, corner.y);
      context.lineTo(bottom.x, bottom.y);
      context.stroke();
    });

    planePath(bottomZ);
    context.fillStyle = "rgba(232, 226, 215, 0.34)";
    context.fill();
    context.strokeStyle = "rgba(137, 130, 116, 0.18)";
    context.stroke();

    activeHotspots
      .filter((hotspot) => hotspot.metric >= (activeLayer === "risk" ? 42 : 58))
      .forEach((hotspot, index) => {
        const surfacePoint = project(hotspot.x, hotspot.y, topZ);
        const lowerPoint = project(hotspot.x, hotspot.y, -0.74 - index * 0.04);
        context.strokeStyle = "rgba(137, 130, 116, 0.22)";
        context.setLineDash([5, 6]);
        context.beginPath();
        context.moveTo(surfacePoint.x, surfacePoint.y);
        context.lineTo(lowerPoint.x, lowerPoint.y);
        context.stroke();
        context.setLineDash([]);
        drawSubsurfaceVolume(hotspot, index);
      });

    const planeGradient = context.createLinearGradient(0, bounds.originY - bounds.depth * topZ, width, bounds.originY + bounds.planeH);
    planeGradient.addColorStop(0, "rgba(255, 255, 255, 0.74)");
    planeGradient.addColorStop(0.58, "rgba(246, 243, 236, 0.62)");
    planeGradient.addColorStop(1, "rgba(232, 226, 215, 0.48)");
    planePath(topZ);
    context.fillStyle = planeGradient;
    context.fill();
    context.strokeStyle = "rgba(137, 130, 116, 0.32)";
    context.stroke();

    context.save();
    planePath(topZ);
    context.clip();
    activeHotspots.forEach((hotspot) => drawProjectedPatch(hotspot, topZ, 0.38));
    context.restore();
    drawHexGrid(topZ, 0.64);

    targets.forEach((target) => {
      const point = project(target.x, target.y, topZ);
      const isConfirmed = target.status === "confirmado";
      const isRejected = target.status === "rejeitado";
      context.fillStyle = isRejected ? colorToken("--red", "#d94b37") : isConfirmed ? colorToken("--green", "#2b9b60") : teal;
      context.strokeStyle = "rgba(255, 255, 255, 0.96)";
      context.lineWidth = 3;
      context.beginPath();
      context.arc(point.x, point.y, isConfirmed ? 7 : 6, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      context.fillStyle = text;
      context.font = "700 11px Segoe UI, sans-serif";
      context.fillText(target.id.replace("AM-", "A"), point.x + 10, point.y + 4);
    });

    context.strokeStyle = "rgba(120, 114, 102, 0.34)";
    context.setLineDash([8, 9]);
    context.beginPath();
    const traceA = project(0.11, 0.82, topZ);
    const traceB = project(0.42, 0.52, topZ);
    const traceC = project(0.75, 0.22, topZ);
    context.moveTo(traceA.x, traceA.y);
    context.bezierCurveTo(traceB.x - 38, traceB.y + 12, traceB.x + 58, traceB.y - 8, traceC.x, traceC.y);
    context.stroke();
    context.setLineDash([]);

    context.fillStyle = heatYellow;
    context.globalAlpha = 0.16;
    context.beginPath();
    context.ellipse(width * 0.52, height * 0.66, width * 0.28, height * 0.08, -0.28, 0, Math.PI * 2);
    context.fill();
    context.globalAlpha = 1;

    drawInfoBox(layerLabel(), "Subsolo 3D: volumes sob a superficie");
    drawLegend("subsolo / alvo");
  }

  drawSurfaceView();
}

function formatStatus(status) {
  const labels = {
    confirmado: "confirmado",
    rejeitado: "rejeitado",
    pendente: "pendente",
  };
  return labels[status] || status;
}

function renderTargets() {
  targetRows.innerHTML = "";
  targets
    .sort((left, right) => right.score - left.score)
    .forEach((target, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><strong>${target.id}</strong></td>
        <td>${target.region}</td>
        <td><strong>${target.score}%</strong></td>
        <td><div class="factor-list">${target.factors.map((factor) => `<span>${factor}</span>`).join("")}</div></td>
        <td><span class="status-badge ${target.status}">${formatStatus(target.status)}</span></td>
        <td>
          <div class="row-actions">
            <button class="icon-action" type="button" aria-label="Confirmar ${target.id}" data-action="confirmar" data-index="${index}">
              <i data-lucide="check"></i>
            </button>
            <button class="icon-action" type="button" aria-label="Rejeitar ${target.id}" data-action="rejeitar" data-index="${index}">
              <i data-lucide="x"></i>
            </button>
            <button class="icon-action" type="button" aria-label="Marcar ${target.id} como pendente" data-action="pendente" data-index="${index}">
              <i data-lucide="clock-3"></i>
            </button>
          </div>
        </td>
      `;
      targetRows.appendChild(row);
    });
  updateReviewedCount();
  drawTerrainHeatmap();
  refreshIcons();
}

function updateReviewedCount() {
  const reviewed = targets.filter((target) => target.status !== "pendente").length;
  reviewedCount.textContent = `${reviewed} / ${targets.length}`;
}

function updateDatasetUI() {
  datasetName.textContent = `Dataset: ${datasetState.name}`;
  datasetSummary.textContent = `${datasetState.samples} amostras · ${datasetState.variables} variáveis · coordenadas válidas`;
  document.querySelector("#integrityScore").textContent = `${datasetState.integrity}%`;
  document.querySelector("#outlierCount").textContent = String(datasetState.outliers);
}

function updatePipelineState(state) {
  document.querySelectorAll(".pipeline-step").forEach((step) => {
    step.classList.remove("active", "done");
  });

  const upload = document.querySelector('[data-step="upload"]');
  const analysis = document.querySelector('[data-step="analysis"]');
  const report = document.querySelector('[data-step="report"]');

  if (state === "uploaded") {
    upload.classList.add("done");
    analysis.classList.add("active");
    return;
  }

  if (state === "report") {
    upload.classList.add("done");
    analysis.classList.add("done");
    report.classList.add("active");
    return;
  }

  upload.classList.add("done");
  analysis.classList.add("active");
}

function updateScenario(nextScenario) {
  activeScenario = nextScenario;
  const data = scenarios[nextScenario];
  document.querySelector("#targetCount").textContent = String(data.targets);
  document.querySelector("#strongCount").textContent = String(data.strong);
  document.querySelector("#confidenceRange").textContent = data.confidence;
  drawProspectivityChart();
}

function parseCsvProfile(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return null;
  }

  const separator = lines[0].includes(";") ? ";" : ",";
  const columns = lines[0].split(separator).map((column) => column.trim()).filter(Boolean);
  return {
    samples: Math.max(1, lines.length - 1),
    variables: Math.max(1, columns.length),
  };
}

function parseJsonProfile(text) {
  const parsed = JSON.parse(text);
  const rows = Array.isArray(parsed) ? parsed : Array.isArray(parsed.samples) ? parsed.samples : [];
  const firstRow = rows.find((row) => row && typeof row === "object");
  return {
    samples: rows.length || 1,
    variables: firstRow ? Object.keys(firstRow).length : 1,
  };
}

function deriveDatasetQuality(profile) {
  const variableBonus = Math.min(6, Math.floor(profile.variables / 3));
  const samplePenalty = profile.samples < 30 ? 9 : profile.samples < 80 ? 4 : 0;
  const integrity = Math.max(78, Math.min(98, 90 + variableBonus - samplePenalty));
  const outliers = Math.max(3, Math.round(profile.samples * 0.11));
  return { integrity, outliers };
}

async function handleFileUpload(file) {
  const text = await file.text();
  const profile = file.name.toLowerCase().endsWith(".json") ? parseJsonProfile(text) : parseCsvProfile(text);

  if (!profile) {
    showToast("Arquivo sem linhas suficientes para a demo.");
    return;
  }

  const quality = deriveDatasetQuality(profile);
  datasetState = {
    name: file.name,
    samples: profile.samples,
    variables: profile.variables,
    integrity: quality.integrity,
    outliers: quality.outliers,
  };

  const simulatedTargets = Math.max(8, Math.round(profile.samples * 0.18));
  const simulatedStrong = Math.max(3, Math.round(simulatedTargets * 0.3));
  scenarios.base.targets = simulatedTargets;
  scenarios.base.strong = simulatedStrong;

  updateDatasetUI();
  updateScenario(activeScenario);
  updatePipelineState("uploaded");
  reportCard.textContent = "Dataset carregado. A pré-validação encontrou estrutura compatível com amostras, coordenadas e variáveis geoquímicas.";
  showToast(`${file.name} importado para a simulação.`);
}

function runAnalysis() {
  analysisRuns += 1;
  runAnalysisButton.disabled = true;
  runAnalysisButton.innerHTML = '<i data-lucide="loader-circle"></i> Analisando';
  refreshIcons();
  showToast("MAPDA cruzando geoquímica, relevo e consistência espacial.");

  window.setTimeout(() => {
    const data = scenarios[activeScenario];
    data.trend = data.trend.map((value, index) => Math.min(96, value + (index > 4 ? 1 : 0)));
    targets.forEach((target, index) => {
      target.score = Math.min(96, target.score + (index < 3 ? 1 : 0));
    });
    updateScenario(activeScenario);
    renderTargets();
    updatePipelineState("report");
    reportCard.textContent = `Rodada ${analysisRuns} concluída: ${data.targets} alvos priorizados, ${data.strong} anomalias fortes e ${data.confidence} de confiança estimada.`;
    runAnalysisButton.disabled = false;
    runAnalysisButton.innerHTML = '<i data-lucide="sparkles"></i> Rodar análise';
    refreshIcons();
    showToast("Análise simulada concluída. Relatório pronto para revisão.");
  }, 900);
}

function buildReportText() {
  const data = scenarios[activeScenario];
  const confirmed = targets.filter((target) => target.status === "confirmado").length;
  const rejected = targets.filter((target) => target.status === "rejeitado").length;
  const pending = targets.filter((target) => target.status === "pendente").length;
  const topTarget = [...targets].sort((left, right) => right.score - left.score)[0];

  return [
    "OrenAI MAPDA Brief",
    "",
    `Dataset: ${datasetState.name}`,
    `Amostras: ${datasetState.samples}`,
    `Variáveis: ${datasetState.variables}`,
    `Integridade estimada: ${datasetState.integrity}%`,
    "",
    `Alvos priorizados: ${data.targets}`,
    `Anomalias fortes: ${data.strong}`,
    `Confiança MAPDA: ${data.confidence}`,
    `Principal alvo: ${topTarget.id} (${topTarget.region}) com score ${topTarget.score}%`,
    "",
    `Revisão humana: ${confirmed} confirmados, ${rejected} rejeitados, ${pending} pendentes.`,
    "Conclusão: demo simulada para apresentar como a OrenAI transforma dados geológicos dispersos em priorização de alvos com score, confiança e revisão técnica.",
  ].join("\n");
}

function populateReportDialog() {
  const data = scenarios[activeScenario];
  const topTargets = [...targets].sort((left, right) => right.score - left.score).slice(0, 3);
  const confirmed = targets.filter((target) => target.status === "confirmado").length;

  reportSummary.innerHTML = `
    <article>
      <span>Resumo</span>
      <p>${data.targets} alvos priorizados, ${data.strong} anomalias fortes e confiança estimada em ${data.confidence}. A tela usa dados simulados para demonstrar a proposta comercial.</p>
    </article>
    <article>
      <span>Top 3 alvos</span>
      <p>${topTargets.map((target) => `${target.id} (${target.region}, ${target.score}%)`).join(" · ")}</p>
    </article>
    <article>
      <span>Revisão HITL</span>
      <p>${confirmed} amostras confirmadas até agora. A decisão final continua com o geólogo, usando o modelo como apoio e não como verdade absoluta.</p>
    </article>
  `;
}

function openReport() {
  populateReportDialog();
  updatePipelineState("report");
  reportCard.textContent = "Relatório simulado aberto. Use o botão de download para mandar um resumo em texto junto com a demo.";
  if (typeof reportDialog.showModal === "function") {
    reportDialog.showModal();
  } else {
    showToast(buildReportText());
  }
  refreshIcons();
}

function downloadReport() {
  const blob = new Blob([buildReportText()], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "orenai-mapda-brief.txt";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

document.querySelectorAll(".scenario-option").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".scenario-option").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    updateScenario(button.dataset.scenario);
    showToast(`Cenário "${button.querySelector("span").textContent}" aplicado.`);
  });
});

document.querySelectorAll("[data-map-view]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-map-view]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    activeMapView = button.dataset.mapView;
    drawTerrainHeatmap();
    showToast(activeMapView === "subsurface" ? "Subsolo 3D aberto." : "Superficie 2D aplicada.");
  });
});

document.querySelectorAll("[data-layer]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-layer]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    activeLayer = button.dataset.layer;
    drawTerrainHeatmap();
  });
});

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    if (button.dataset.view === "upload") {
      fileInput.click();
    } else if (button.dataset.view === "review") {
      document.querySelector("#review").scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (button.dataset.view === "report") {
      openReport();
    } else {
      document.querySelector(".page-header").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

targetRows.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const sortedTargets = [...targets].sort((left, right) => right.score - left.score);
  const target = sortedTargets[Number(button.dataset.index)];
  const statusByAction = {
    confirmar: "confirmado",
    rejeitar: "rejeitado",
    pendente: "pendente",
  };
  target.status = statusByAction[button.dataset.action];
  renderTargets();
  showToast(`${target.id} marcado como ${target.status}.`);
});

document.querySelector("#uploadButton").addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  handleFileUpload(file).catch(() => {
    showToast("Não consegui ler esse arquivo. Use CSV ou JSON simples.");
  });
});

document.querySelector("#dropZone").addEventListener("click", () => {
  fileInput.click();
});

runAnalysisButton.addEventListener("click", runAnalysis);
document.querySelector("#reportButton").addEventListener("click", openReport);
downloadReportButton.addEventListener("click", downloadReport);

document.querySelector("#resetButton").addEventListener("click", () => {
  targets.forEach((target) => {
    target.status = target.id === "AM-018" ? "confirmado" : target.id === "AM-007" ? "rejeitado" : "pendente";
  });
  renderTargets();
  updatePipelineState("uploaded");
  showToast("Revisão voltou ao estado inicial.");
});

window.addEventListener("resize", resizeCanvases);
window.addEventListener("orenai:subsurface-ready", syncSubsurfaceScene);

updateDatasetUI();
updateScenario(activeScenario);
renderTargets();
refreshIcons();
resizeCanvases();

if (window.location.hash === "#report") {
  window.setTimeout(openReport, 0);
} else if (window.location.hash === "#subsurface") {
  activeMapView = "subsurface";
  document.querySelectorAll("[data-map-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.mapView === activeMapView);
  });
  document.querySelector("#heatmap").scrollIntoView({ block: "start" });
  drawTerrainHeatmap();
} else if (window.location.hash === "#heatmap") {
  document.querySelector("#heatmap").scrollIntoView({ block: "start" });
}
