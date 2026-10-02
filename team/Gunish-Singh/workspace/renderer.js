import { wirePath } from "../../../shared/renderer/wire-path.js";

const NS = "http://www.w3.org/2000/svg";
const NODE_WIDTH = 156;
const PIN_TOP = 52;
const PIN_GAP = 22;
const animatedComponents = new WeakSet();

export function componentHeight(component) {
  const pinCount = Math.max(component.inputs.length, component.outputs.length);
  return Math.max(82, PIN_TOP + Math.max(1, pinCount) * PIN_GAP + 10);
}

function element(name, attributes = {}, text = "") {
  const node = document.createElementNS(NS, name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  if (text) node.textContent = text;
  return node;
}

const gateTypes = new Set(["and", "or", "not", "nand", "nor", "xor", "xnor"]);
const symbolLabels = { logicProbe: "PROBE", binaryDisplay: "BIN", decimalDisplay: "DEC", hexDisplay: "HEX", sevenSegment: "7SEG", halfAdder: "HA", fullAdder: "FA", halfSubtractor: "HS", fullSubtractor: "FS", mux2: "2:1", mux4: "4:1", mux8: "8:1", mux16: "16:1", demux2: "1:2", demux4: "1:4", decoder2: "2:4", decoder3: "3:8", decoder4: "4:16", dff: "DFF", jkff: "JK", sr: "SR", tff: "T", masterSlave: "MS", counter4: "CTR", syncCounter4: "CTR", rippleCounter4: "RIP", ringCounter4: "RING", johnsonCounter4: "JHN", moduloCounter4: "MOD", siso4: "SISO", sipo4: "SIPO", piso4: "PISO", pipo4: "PIPO" };

function displayValue(component) {
  return component.inputs.reduce((value, pin) => (value << 1) | Number(Boolean(pin.value)), 0);
}

function appendComponentSymbol(group, component) {
  if (gateTypes.has(component.type)) {
    const symbol = element("g", { class: "gate-symbol", transform: "translate(111 8) scale(.55)", "aria-hidden": "true" });
    const type = component.type;
    if (type === "not" || type === "xnor") {
      symbol.append(element("path", { class: "symbol-wire", d: type === "not" ? "M0 22 H10 M49 22 H60" : "M0 12 H8 M0 32 H8 M52 22 H60" }));
      symbol.append(element("path", { class: "gate-shape", d: type === "not" ? "M10 4 L44 22 L10 40 Z" : "M8 4 Q24 22 8 40 M13 4 Q24 22 45 22 Q24 22 13 40" }));
      if (type === "xnor") symbol.append(element("path", { class: "gate-shape", d: "M13 4 Q27 22 13 40 M18 4 Q29 4 45 22 Q29 40 18 40" }));
      symbol.append(element("circle", { class: "gate-bubble", cx: type === "not" ? 48 : 49, cy: 22, r: 3 }));
    } else if (type === "or" || type === "nor" || type === "xor") {
      symbol.append(element("path", { class: "symbol-wire", d: "M0 12 H12 M0 32 H12 M52 22 H60" }));
      symbol.append(element("path", { class: "gate-shape", d: "M10 4 Q23 22 10 40 Q28 40 47 22 Q28 4 10 4 Z" }));
      if (type === "xor") symbol.append(element("path", { class: "gate-shape gate-extra", d: "M3 4 Q16 22 3 40" }));
      if (type === "nor") symbol.append(element("circle", { class: "gate-bubble", cx: 50, cy: 22, r: 3 }));
    } else {
      symbol.append(element("path", { class: "symbol-wire", d: "M0 12 H12 M0 32 H12 M52 22 H60" }));
      symbol.append(element("path", { class: "gate-shape", d: "M12 4 H27 A18 18 0 0 1 27 40 H12 Z" }));
      if (type === "nand") symbol.append(element("circle", { class: "gate-bubble", cx: 50, cy: 22, r: 3 }));
    }
    group.append(symbol);
    return;
  }

  if (["switch", "clock", "const0", "const1"].includes(component.type)) {
    const symbol = element("g", { class: "io-symbol", "aria-hidden": "true" });
    if (component.type === "switch") {
      symbol.append(element("rect", { class: "symbol-chip", x: 113, y: 13, width: 32, height: 15, rx: 7 }));
      symbol.append(element("circle", { class: "switch-knob", cx: component.configuration.value ? 137 : 121, cy: 20.5, r: 5 }));
    } else if (component.type === "clock") {
      symbol.append(element("path", { class: "io-wave", d: "M112 24 H118 V13 H128 V24 H138 V13 H146 V24 H151" }));
    } else {
      symbol.append(element("circle", { class: "symbol-chip", cx: 129, cy: 21, r: 11 }));
      symbol.append(element("text", { class: "symbol-text", x: 129, y: 25, "text-anchor": "middle" }, component.type === "const1" ? "1" : "0"));
    }
    group.append(symbol);
    return;
  }

  if (component.type === "led") return;
  if (component.type === "output") {
    const symbol = element("g", { class: "io-symbol", "aria-hidden": "true" });
    symbol.append(element("path", { class: "io-wave", d: "M112 21 H121 M135 21 H146" }));
    symbol.append(element("circle", { class: `output-indicator ${component.inputs[0]?.value ? "on" : ""}`, cx: 128, cy: 21, r: 7 }));
    group.append(symbol);
    return;
  }
  const badge = element("g", { class: "component-symbol", "aria-hidden": "true" });
  badge.append(element("rect", { class: "symbol-chip", x: 111, y: 9, width: 34, height: 25, rx: 4 }));
  badge.append(element("text", { class: "symbol-text", x: 128, y: 25, "text-anchor": "middle" }, symbolLabels[component.type] || component.type.slice(0, 3).toUpperCase()));
  group.append(badge);
}

export function pinPosition(component, direction, index) {
  const count = direction === "output" ? component.outputs.length : component.inputs.length;
  const height = componentHeight(component);
  const availableHeight = height - PIN_TOP - 10;
  const offsetY = count === 1 ? PIN_TOP + availableHeight / 2 : PIN_TOP + index * Math.min(PIN_GAP, availableHeight / (count - 1));
  return { x: component.x + (direction === "output" ? NODE_WIDTH : 0), y: component.y + offsetY };
}

export function updateWirePreview(svg, preview) {
  const path = svg.querySelector(".wire-preview");
  if (path) path.setAttribute("d", wirePath(preview.start, preview.end));
}

export function renderDiagram(svg, circuit, selectedId, selectedWireId, preview, selectedIds = new Set()) {
  const defs = element("defs");
  const pattern = element("pattern", { id: "grid-pattern", width: 22, height: 22, patternUnits: "userSpaceOnUse" });
  pattern.append(element("path", { class: "grid-lines", d: "M 22 0 L 0 0 0 22", fill: "none", "stroke-width": "0.7" }));
  defs.append(pattern);
  const background = element("rect", { class: "grid-bg", x: 0, y: 0, width: 1200, height: 760, "data-grid": "true" });
  const wireLayer = element("g", { "aria-label": "Circuit wires" });
  const nodeLayer = element("g", { "aria-label": "Circuit components" });
  svg.replaceChildren(defs, background, wireLayer, nodeLayer);

  for (const wire of circuit.wires.values()) {
    const source = circuit.components.get(wire.sourceId);
    const target = circuit.components.get(wire.targetId);
    if (!source || !target) continue;
    const start = pinPosition(source, "output", wire.sourcePort);
    const end = pinPosition(target, "input", wire.targetPort);
    const value = source.outputs[wire.sourcePort]?.value;
    const path = wirePath(start, end);
    wireLayer.append(element("path", { class: `wire ${value ? "signal-high" : "signal-low"} ${selectedWireId === wire.id ? "selected" : ""}`, d: path, "data-wire-id": wire.id, "aria-label": `${source.name} output ${value ? "high" : "low"}` }));
    if (value) wireLayer.append(element("path", { class: "wire-flow", d: path, "aria-hidden": "true" }));
    wireLayer.append(element("path", { class: "wire-hit", d: path, "data-wire-id": wire.id }));
  }
  if (preview) wireLayer.append(element("path", { class: "wire-preview", d: wirePath(preview.start, preview.end) }));

  for (const component of circuit.components.values()) {
    const height = componentHeight(component);
    const isNew = !animatedComponents.has(component);
    animatedComponents.add(component);
    const group = element("g", { class: `node ${component.id === selectedId || selectedIds.has(component.id) ? "selected" : ""} ${isNew ? "node-enter" : ""}`, transform: `translate(${component.x} ${component.y})`, "data-component-id": component.id, tabindex: 0, role: "group", "aria-label": `${component.name}, component ${component.id}` });
    group.append(element("rect", { class: "node-body", width: NODE_WIDTH, height }));
    group.append(element("text", { class: "node-title", x: 14, y: 24 }, component.name));
    group.append(element("text", { class: "node-subtitle", x: 14, y: 40 }, component.id.toUpperCase()));
    appendComponentSymbol(group, component);
    if (["led", "output"].includes(component.type)) {
      const isOn = Boolean(component.inputs[0]?.value);
      if (component.type === "led") group.append(element("circle", { class: `led-core ${isOn ? "on" : ""}`, cx: 128, cy: 24, r: 8 }));
      group.append(element("text", { class: "state-label", x: 111, y: 55 }, isOn ? "HIGH" : "LOW"));
    }
    if (["binaryDisplay", "decimalDisplay", "hexDisplay"].includes(component.type)) {
      const value = displayValue(component);
      const readout = component.type === "binaryDisplay" ? component.inputs.map((pin) => Number(Boolean(pin.value))).join("") : component.type === "hexDisplay" ? value.toString(16).toUpperCase() : String(value);
      group.append(element("rect", { class: "display-frame", x: 42, y: 62, width: 102, height: 42, rx: 4 }));
      group.append(element("text", { class: `display-readout ${component.type === "binaryDisplay" ? "binary-readout" : ""}`, x: 93, y: 89, "text-anchor": "middle" }, readout));
    }
    if (component.type === "logicProbe") {
      const value = Number(Boolean(component.inputs[0]?.value));
      group.append(element("rect", { class: "display-frame probe-frame", x: 48, y: 53, width: 92, height: 25, rx: 4 }));
      group.append(element("circle", { class: `probe-lamp ${value ? "on" : ""}`, cx: 61, cy: 65.5, r: 4 }));
      group.append(element("text", { class: "probe-readout", x: 94, y: 69, "text-anchor": "middle" }, value ? "HIGH  1" : "LOW  0"));
    }
    if (component.type === "sevenSegment") {
      const segmentsByDigit = [[1, 1, 1, 1, 1, 1, 0], [0, 1, 1, 0, 0, 0, 0], [1, 1, 0, 1, 1, 0, 1], [1, 1, 1, 1, 0, 0, 1], [0, 1, 1, 0, 0, 1, 1], [1, 0, 1, 1, 0, 1, 1], [1, 0, 1, 1, 1, 1, 1], [1, 1, 1, 0, 0, 0, 0], [1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 0, 1, 1], [1, 1, 1, 0, 1, 1, 1], [0, 0, 1, 1, 1, 1, 1], [1, 0, 0, 1, 1, 1, 0], [0, 1, 1, 1, 1, 0, 1], [1, 0, 0, 1, 1, 1, 1], [1, 0, 0, 0, 1, 1, 1]][displayValue(component)];
      const segmentPaths = ["M91 61 H109 L106 65 H94 Z", "M110 63 L114 66 V79 L110 81 L108 78 V67 Z", "M110 84 L114 86 V99 L110 102 L108 98 V88 Z", "M91 100 H109 L106 104 H94 Z", "M86 84 L90 87 V98 L86 102 L82 99 V87 Z", "M86 63 L90 67 V78 L86 81 L82 78 V66 Z", "M91 80 H109 L106 84 H94 Z"];
      segmentPaths.forEach((path, index) => group.append(element("path", { class: `display-segment ${segmentsByDigit[index] ? "on" : ""}`, d: path })));
    }
    if (["switch", "clock", "const0", "const1"].includes(component.type)) {
      const value = component.outputs[0]?.value ?? 0;
      group.append(element("text", { class: "state-label", x: 112, y: 47, ...(component.type === "switch" ? { "data-switch-toggle": component.id, tabindex: 0, role: "button", "aria-label": `Toggle switch, currently ${value ? "high" : "low"}` } : {}) }, value ? "HIGH" : "LOW"));
    }
    component.inputs.forEach((pin, index) => {
      const point = pinPosition(component, "input", index);
      group.append(element("circle", { class: `pin input ${pin.value ? "signal-high" : "signal-low"}`, cx: 0, cy: point.y - component.y, r: 5, "data-pin-kind": "input", "data-component-id": component.id, "data-port-index": index, tabindex: 0, role: "button", "aria-label": `${pin.name} input, ${pin.value ? "high" : "low"}` }));
      group.append(element("text", { class: "pin-label", x: 9, y: point.y - component.y + 3 }, `${pin.name} ${pin.value ? 1 : 0}`));
    });
    component.outputs.forEach((pin, index) => {
      const point = pinPosition(component, "output", index);
      group.append(element("circle", { class: `pin output ${pin.value ? "signal-high" : "signal-low"}`, cx: NODE_WIDTH, cy: point.y - component.y, r: 5, "data-pin-kind": "output", "data-component-id": component.id, "data-port-index": index, tabindex: 0, role: "button", "aria-label": `${pin.name} output, ${pin.value ? "high" : "low"}` }));
      group.append(element("text", { class: "pin-label output-label", x: NODE_WIDTH - 10, y: point.y - component.y + 3, "text-anchor": "end" }, `${pin.name} ${pin.value ? 1 : 0}`));
    });
    nodeLayer.append(group);
  }
}