import { wirePath } from "../../../shared/renderer/wire-path.js";

const NS = "http://www.w3.org/2000/svg";

function element(name, attributes = {}, text = "") {
  const node = document.createElementNS(NS, name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  if (text) node.textContent = text;
  return node;
}

export function pinPosition(component, direction, index) {
  const count = direction === "output" ? component.outputs.length : component.inputs.length;
  const height = Math.max(82, 48 + count * 22);
  const offsetY = height / (count + 1) * (index + 1);
  return { x: component.x + (direction === "output" ? 156 : 0), y: component.y + offsetY };
}

export function updateWirePreview(svg, preview) {
  const path = svg.querySelector(".wire-preview");
  if (path) path.setAttribute("d", wirePath(preview.start, preview.end));
}

export function renderDiagram(svg, circuit, selectedId, selectedWireId, preview, selectedIds = new Set()) {
  const defs = element("defs");
  const pattern = element("pattern", { id: "grid-pattern", width: 22, height: 22, patternUnits: "userSpaceOnUse" });
  pattern.append(element("path", { d: "M 22 0 L 0 0 0 22", fill: "none", stroke: "#dce5df", "stroke-width": "0.7" }));
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
    wireLayer.append(element("path", { class: "wire-hit", d: path, "data-wire-id": wire.id }));
  }
  if (preview) wireLayer.append(element("path", { class: "wire-preview", d: wirePath(preview.start, preview.end) }));

  for (const component of circuit.components.values()) {
    const height = Math.max(82, 48 + Math.max(component.inputs.length, component.outputs.length) * 22);
    const group = element("g", { class: `node ${component.id === selectedId || selectedIds.has(component.id) ? "selected" : ""}`, transform: `translate(${component.x} ${component.y})`, "data-component-id": component.id, tabindex: 0, role: "group", "aria-label": `${component.name}, component ${component.id}` });
    group.append(element("rect", { class: "node-body", width: 156, height }));
    group.append(element("text", { class: "node-title", x: 14, y: 24 }, component.name));
    group.append(element("text", { class: "node-subtitle", x: 14, y: 40 }, component.id.toUpperCase()));
    if (["led", "output"].includes(component.type)) {
      const isOn = Boolean(component.inputs[0]?.value);
      group.append(element("circle", { class: `led-core ${isOn ? "on" : ""}`, cx: 128, cy: 24, r: 8 }));
      group.append(element("text", { class: "state-label", x: 111, y: 55 }, isOn ? "HIGH" : "LOW"));
    }
    if (["switch", "clock", "const0", "const1"].includes(component.type)) {
      const value = component.outputs[0]?.value ?? 0;
      group.append(element("text", { class: "state-label", x: 112, y: 30, ...(component.type === "switch" ? { "data-switch-toggle": component.id, tabindex: 0, role: "button", "aria-label": `Toggle switch, currently ${value ? "high" : "low"}` } : {}) }, value ? "HIGH" : "LOW"));
    }
    component.inputs.forEach((pin, index) => {
      const point = pinPosition(component, "input", index);
      group.append(element("circle", { class: `pin input ${pin.value ? "signal-high" : "signal-low"}`, cx: 0, cy: point.y - component.y, r: 5, "data-pin-kind": "input", "data-component-id": component.id, "data-port-index": index, tabindex: 0, role: "button", "aria-label": `${pin.name} input, ${pin.value ? "high" : "low"}` }));
      group.append(element("text", { class: "pin-label", x: 9, y: point.y - component.y + 3 }, `${pin.name} ${pin.value ? 1 : 0}`));
    });
    component.outputs.forEach((pin, index) => {
      const point = pinPosition(component, "output", index);
      group.append(element("circle", { class: `pin output ${pin.value ? "signal-high" : "signal-low"}`, cx: 156, cy: point.y - component.y, r: 5, "data-pin-kind": "output", "data-component-id": component.id, "data-port-index": index, tabindex: 0, role: "button", "aria-label": `${pin.name} output, ${pin.value ? "high" : "low"}` }));
      group.append(element("text", { class: "pin-label", x: 110, y: point.y - component.y - 7 }, `${pin.name} ${pin.value ? 1 : 0}`));
    });
    nodeLayer.append(group);
  }
}