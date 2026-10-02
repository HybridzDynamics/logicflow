import { Circuit } from "../team/Mohammad-Arsh/circuit-model/circuit.js";
import { Simulation } from "../team/Mohammad-Arsh/simulation-engine/simulation.js";
import { definitions, categoryFor, initialState } from "../shared/components/registry.js";
import { History } from "../shared/history/history.js";
import { listCircuits, loadCircuit, saveCircuit } from "../shared/storage/storage.js";
import { renameCircuit, deleteCircuit } from "../shared/storage/storage.js";
import { evaluateCombinational } from "../team/Mohit-Pangti/combinational/evaluate.js";
import { renderDiagram, pinPosition, updateWirePreview, componentHeight } from "../team/Gunish-Singh/workspace/renderer.js";
import { createPalette } from "../team/Gunish-Singh/component-palette/palette.js";
import { SimulationClock } from "../team/Mohammad-Arsh/clock-system/clock.js";
import { buildExample, exampleCatalog } from "../team/Parikshit-Singh/examples/circuits.js";
import { createStatusNotifier } from "../team/Gunish-Singh/ui/status.js";
import { exportCircuit, LOGICFLOW_MIME_TYPE, LOGICFLOW_FILE_EXTENSION, parseCircuitFile } from "../shared/import-export/circuit-file.js";

const svg = document.querySelector("#diagram");
const list = document.querySelector("#component-list");
const inspector = document.querySelector("#inspector-content");
const toast = document.querySelector("#toast");
const state = { circuit: new Circuit(), simulation: null, history: null, clockController: null, selectedId: null, selectedIds: new Set(), selectedWireId: null, clipboard: null, pasteOffset: 44, wireStart: null, preview: null, moving: null, pan: null, zoom: 1, grid: true, running: false, circuitName: "Untitled circuit", clockHigh: false };
state.simulation = new Simulation(state.circuit);
state.history = new History(state.circuit);
state.clockController = new SimulationClock(advanceClock);

const get = (selector) => document.querySelector(selector);
const showMessage = createStatusNotifier(get("#message"), toast);
const workspace = get("#workspace");

function setPanelCollapsed(panel, collapsed) {
  workspace.classList.toggle(`${panel}-collapsed`, collapsed);
  const button = get(`[data-action="toggle-${panel}"]`);
  const label = panel === "palette" ? "component palette" : "inspector";
  button.setAttribute("aria-pressed", String(!collapsed));
  button.setAttribute("aria-label", `${collapsed ? "Show" : "Hide"} ${label}`);
  button.title = `${collapsed ? "Show" : "Hide"} ${label}`;
}

function togglePanel(panel) {
  setPanelCollapsed(panel, !workspace.classList.contains(`${panel}-collapsed`));
}

function safeRun() {
  if (!state.simulation.propagate()) showMessage("Circuit did not stabilize. Check for a feedback loop.");
  render();
}

function toggleSwitch(componentId) {
  const component = state.circuit.components.get(componentId);
  if (!component || component.type !== "switch") return;
  state.history.checkpoint();
  component.configuration.value = 1 - component.configuration.value;
  state.selectedId = component.id; state.selectedIds = new Set([component.id]); state.selectedWireId = null;
  safeRun(); showMessage(`Switch ${component.configuration.value ? "HIGH" : "LOW"}`);
}

function addComponent(type, x, y) {
  try {
    state.history.checkpoint();
    const placement = state.circuit.components.size;
    const positionX = x ?? 150 + (placement % 4) * 230;
    const positionY = y ?? 150 + Math.floor(placement / 4) * 130;
    const component = state.circuit.add(type, Math.round(positionX / 22) * 22, Math.round(positionY / 22) * 22);
    state.selectedId = component.id; state.selectedIds = new Set([component.id]); state.selectedWireId = null;
    safeRun();
    showMessage(`${component.name} added`);
  } catch (error) { showMessage(error.message); }
}

function truthRows(component) {
  return Array.from({ length: 1 << component.inputs.length }, (_, combination) => {
    const inputs = component.inputs.map((pin, index) => ({ ...pin, value: (combination >> (component.inputs.length - index - 1)) & 1 }));
    return { inputs, outputs: evaluateCombinational({ ...component, inputs }).map(Number) };
  });
}

function renderTruthTable(component, rows) {
  const table = document.createElement("table"); table.className = "truth-table";
  const head = document.createElement("thead"); const headerRow = document.createElement("tr");
  [...component.inputs.map((pin) => pin.name), ...component.outputs.map((pin) => pin.name)].forEach((name) => {
    const th = document.createElement("th"); th.textContent = name; headerRow.append(th);
  });
  head.append(headerRow);
  const body = document.createElement("tbody");
  for (const { inputs, outputs } of rows) {
    const row = document.createElement("tr");
    [...inputs.map((pin) => pin.value), ...outputs].forEach((value) => { const cell = document.createElement("td"); cell.textContent = String(value); row.append(cell); });
    body.append(row);
  }
  table.append(head, body); return table;
}

function minimizeSop(rows, inputNames, outputIndex) {
  const variableCount = inputNames.length;
  const onSet = rows.filter((row) => row.outputs[outputIndex]).map((row) => Number.parseInt(row.inputs.map((pin) => pin.value).join(""), 2));
  if (!onSet.length) return "0";
  if (onSet.length === 1 << variableCount) return "1";
  const validPatterns = new Set();
  const visit = (prefix) => {
    if (prefix.length === variableCount) {
      const covered = Array.from({ length: 1 << variableCount }, (_, value) => value).filter((value) => prefix.split("").every((bit, index) => bit === "-" || bit === String((value >> (variableCount - index - 1)) & 1)));
      if (covered.every((value) => onSet.includes(value))) validPatterns.add(prefix);
      return;
    }
    for (const bit of ["0", "1", "-"]) visit(prefix + bit);
  };
  visit("");
  const primes = [...validPatterns].filter((pattern) => !pattern.split("").some((bit, index) => {
    if (bit === "-") return false;
    const broader = `${pattern.slice(0, index)}-${pattern.slice(index + 1)}`;
    return validPatterns.has(broader);
  }));
  let best = null;
  for (let selection = 1; selection < (1 << primes.length); selection += 1) {
    const terms = primes.filter((_, index) => selection & (1 << index));
    if (best && terms.length > best.length) continue;
    const covered = new Set();
    terms.forEach((term) => onSet.forEach((value) => {
      if (term.split("").every((bit, index) => bit === "-" || bit === String((value >> (variableCount - index - 1)) & 1))) covered.add(value);
    }));
    if (covered.size !== onSet.length) continue;
    const literals = terms.reduce((count, term) => count + [...term].filter((bit) => bit !== "-").length, 0);
    const bestLiterals = best?.reduce((count, term) => count + [...term].filter((bit) => bit !== "-").length, Infinity) ?? Infinity;
    if (!best || terms.length < best.length || (terms.length === best.length && literals < bestLiterals)) best = terms;
  }
  return (best || []).map((term) => {
    const literals = [...term].flatMap((bit, index) => bit === "-" ? [] : [`${bit === "0" ? "!" : ""}${inputNames[index]}`]);
    return literals.length ? literals.join(" & ") : "1";
  }).join(" | ") || "0";
}

function renderKarnaughMaps(component, rows) {
  const container = document.createElement("div");
  const variableCount = component.inputs.length;
  const rowBits = Math.floor(variableCount / 2);
  const columnBits = variableCount - rowBits;
  const rowCount = 1 << rowBits;
  const columnCount = 1 << columnBits;
  const rowCodes = Array.from({ length: rowCount }, (_, index) => index ^ (index >> 1));
  const columnCodes = Array.from({ length: columnCount }, (_, index) => index ^ (index >> 1));
  const values = new Map(rows.map((row) => [row.inputs.map((pin) => pin.value).join(""), row.outputs]));

  component.outputs.forEach((output, outputIndex) => {
    const heading = document.createElement("h4"); heading.className = "kmap-output-title"; heading.textContent = `${output.name} = ${minimizeSop(rows, component.inputs.map((pin) => pin.name), outputIndex)}`;
    const table = document.createElement("table"); table.className = "kmap-table"; table.setAttribute("aria-label", `Karnaugh map for ${output.name}`);
    const head = document.createElement("thead"); const headerRow = document.createElement("tr");
    const corner = document.createElement("th"); corner.textContent = `${component.inputs.slice(0, rowBits).map((pin) => pin.name).join("")}\\${component.inputs.slice(rowBits).map((pin) => pin.name).join("")}`; headerRow.append(corner);
    columnCodes.forEach((code) => { const cell = document.createElement("th"); cell.textContent = code.toString(2).padStart(columnBits, "0"); headerRow.append(cell); });
    head.append(headerRow); const body = document.createElement("tbody");
    rowCodes.forEach((rowCode) => {
      const row = document.createElement("tr"); const label = document.createElement("th"); label.textContent = rowBits ? rowCode.toString(2).padStart(rowBits, "0") : "-"; row.append(label);
      columnCodes.forEach((columnCode) => {
        const assignment = `${rowBits ? rowCode.toString(2).padStart(rowBits, "0") : ""}${columnCode.toString(2).padStart(columnBits, "0")}`;
        const cell = document.createElement("td"); const value = values.get(assignment)?.[outputIndex] ?? 0;
        cell.textContent = String(value); if (value) cell.className = "kmap-one"; row.append(cell);
      });
      body.append(row);
    });
    table.append(head, body); container.append(heading, table);
  });
  return container;
}

function inspectorSection(title, content) {
  const section = document.createElement("section"); section.className = "inspector-section";
  const heading = document.createElement("h3"); heading.textContent = title;
  section.append(heading, content); return section;
}

function inspectorAction(label, callback) {
  const button = document.createElement("button"); button.type = "button"; button.className = "inspector-action"; button.textContent = label; button.addEventListener("click", callback); return button;
}

function copySelection() {
  const ids = state.selectedIds.size ? [...state.selectedIds] : state.selectedId ? [state.selectedId] : [];
  if (!ids.length) return;
  state.clipboard = state.circuit.copyComponents(ids);
  showMessage(`${ids.length} component${ids.length === 1 ? "" : "s"} copied`);
}

function pasteSelection() {
  if (!state.clipboard?.components.length) { showMessage("Clipboard is empty"); return; }
  try {
    state.history.checkpoint();
    const ids = state.circuit.pasteComponents(state.clipboard, state.pasteOffset);
    state.pasteOffset = (state.pasteOffset % 176) + 44;
    state.selectedIds = new Set(ids); state.selectedId = ids.at(-1) || null; state.selectedWireId = null;
    safeRun(); showMessage(`${ids.length} component${ids.length === 1 ? "" : "s"} pasted`);
  } catch (error) { showMessage(`Could not paste: ${error.message}`); }
}

function duplicateSelection() {
  const ids = state.selectedIds.size ? [...state.selectedIds] : state.selectedId ? [state.selectedId] : [];
  if (!ids.length) return;
  state.clipboard = state.circuit.copyComponents(ids);
  pasteSelection();
}

function renderInspector() {
  inspector.replaceChildren();
  const component = state.circuit.components.get(state.selectedId);
  const wire = state.circuit.wires.get(state.selectedWireId);
  if (state.selectedIds.size > 1) {
    const title = document.createElement("h2"); title.className = "detail-title"; title.textContent = `${state.selectedIds.size} components selected`;
    const copy = inspectorAction("Copy selection", copySelection);
    const duplicate = inspectorAction("Duplicate selection", duplicateSelection);
    inspector.append(title, inspectorSection("Selection", copy), duplicate);
    return;
  }
  if (wire) {
    const title = document.createElement("h2"); title.className = "detail-title"; title.textContent = "Wire connection";
    const id = document.createElement("div"); id.className = "detail-id"; id.textContent = wire.id;
    const endpoints = document.createElement("p"); endpoints.textContent = `${wire.sourceId} output ${wire.sourcePort + 1} → ${wire.targetId} input ${wire.targetPort + 1}`;
    inspector.append(title, id, inspectorSection("Connection", endpoints)); return;
  }
  if (!component) {
    const empty = document.createElement("div"); empty.className = "inspector-empty";
    const icon = document.createElement("span"); icon.setAttribute("aria-hidden", "true"); icon.textContent = "⌖";
    const text = document.createElement("p"); text.textContent = "Select a component or wire to inspect it.";
    empty.append(icon, text); inspector.append(empty); return;
  }
  const title = document.createElement("h2"); title.className = "detail-title"; title.textContent = component.name;
  const id = document.createElement("div"); id.className = "detail-id"; id.textContent = `${component.id} · ${categoryFor(component.type)}`;
  inspector.append(title, id);
  inspector.append(inspectorAction("Duplicate component", duplicateSelection));
  const nameInput = document.createElement("input"); nameInput.type = "text"; nameInput.value = component.name; nameInput.setAttribute("aria-label", "Component name");
  nameInput.addEventListener("change", () => { component.name = nameInput.value.trim() || definitions[component.type].label; render(); });
  inspector.append(inspectorSection("Name", nameInput));
  for (const [titleText, pins] of [["Inputs", component.inputs], ["Outputs", component.outputs]]) {
    if (!pins.length) continue;
    const rows = document.createElement("div");
    pins.forEach((pin) => { const line = document.createElement("div"); line.className = "pin-row"; line.textContent = pin.name; const value = document.createElement("span"); value.className = `pin-value ${pin.value ? "high" : ""}`; value.textContent = String(pin.value); line.append(value); rows.append(line); });
    inspector.append(inspectorSection(titleText, rows));
  }
  if (component.type === "switch") {
    const button = document.createElement("button"); button.className = "inspector-action"; button.type = "button"; button.textContent = `Switch ${component.configuration.value ? "OFF" : "ON"}`;
    button.addEventListener("click", () => toggleSwitch(component.id));
    inspector.append(inspectorSection("Control", button));
  }
  if (definitions[component.type].sequential) {
    const details = document.createElement("div");
    details.textContent = component.state.value !== undefined ? `State ${component.state.value} · binary ${component.state.value.toString(2).padStart(component.state.width || component.outputs.length, "0")}` : `Q = ${component.state.q}`;
    inspector.append(inspectorSection("Stored state", details));
  }
  if (["logicProbe", "binaryDisplay", "decimalDisplay", "hexDisplay", "sevenSegment"].includes(component.type)) {
    const bits = component.inputs.map((pin) => Number(Boolean(pin.value))).join("");
    const value = Number.parseInt(bits, 2);
    const details = document.createElement("div");
    details.className = "display-details";
    details.textContent = `Binary ${bits} · Decimal ${value} · Hex ${value.toString(16).toUpperCase()}`;
    inspector.append(inspectorSection("Display value", details));
  }
  if (component.inputs.length && component.outputs.length && component.inputs.length <= 4 && !definitions[component.type].sequential) {
    const rows = truthRows(component);
    inspector.append(inspectorSection("Truth table", renderTruthTable(component, rows)));
    inspector.append(inspectorSection("Karnaugh maps", renderKarnaughMaps(component, rows)));
  }
  const position = document.createElement("div"); position.textContent = `x ${Math.round(component.x)} · y ${Math.round(component.y)}`;
  inspector.append(inspectorSection("Position", position));
}

function render() {
  renderDiagram(svg, state.circuit, state.selectedId, state.selectedWireId, state.preview, state.selectedIds);
  svg.querySelector(".grid-bg")?.setAttribute("visibility", state.grid ? "visible" : "hidden");
  renderInspector();
  get("#component-count").textContent = String(state.circuit.components.size);
  get("#empty-state").hidden = state.circuit.components.size > 0;
  get("#circuit-name").textContent = state.circuitName;
  get("#selected-status").textContent = state.selectedIds.size > 1 ? `${state.selectedIds.size} components` : state.circuit.components.get(state.selectedId)?.name || (state.selectedWireId ? "Wire" : "None");
  get("#zoom-level").textContent = `${Math.round(state.zoom * 100)}%`;
  get("#zoom-status").textContent = `${Math.round(state.zoom * 100)}%`;
  get("#simulation-status").textContent = state.running ? "Simulation running" : "Simulation stopped";
  get("#simulation-indicator").classList.toggle("running", state.running);
  get("#clock-state").textContent = state.clockHigh ? "HIGH" : "LOW";
}

function screenPoint(event) {
  const point = svg.createSVGPoint(); point.x = event.clientX; point.y = event.clientY;
  const transformed = point.matrixTransform(svg.getScreenCTM().inverse());
  return { x: transformed.x, y: transformed.y };
}

function selectComponent(id, multi = false) {
  if (multi) {
    const selected = new Set(state.selectedIds);
    if (selected.has(id)) selected.delete(id); else selected.add(id);
    state.selectedIds = selected;
    state.selectedId = selected.has(id) ? id : [...selected].at(-1) || null;
  } else { state.selectedId = id; state.selectedIds = new Set([id]); }
  state.selectedWireId = null; render();
}

function connectPins(target) {
  if (!state.wireStart || target?.dataset.pinKind !== "input") return false;
  const { componentId, portIndex } = target.dataset;
  try {
    state.history.checkpoint();
    state.circuit.connect(state.wireStart.componentId, state.wireStart.portIndex, componentId, Number(portIndex));
    state.selectedId = componentId; state.selectedIds = new Set([componentId]); state.selectedWireId = null; state.wireStart = null; state.preview = null;
    safeRun(); showMessage("Wire connected");
  } catch (error) { state.wireStart = null; state.preview = null; render(); showMessage(error.message); }
  return true;
}

function deleteSelection() {
  if (state.selectedWireId) {
    state.history.checkpoint(); state.circuit.disconnect(state.selectedWireId); state.selectedWireId = null; safeRun(); showMessage("Wire deleted");
  } else if (state.selectedIds.size || state.selectedId) {
    const ids = state.selectedIds.size ? [...state.selectedIds] : [state.selectedId];
    state.history.checkpoint(); ids.forEach((id) => state.circuit.remove(id)); state.selectedId = null; state.selectedIds.clear(); safeRun(); showMessage(`${ids.length} component${ids.length === 1 ? "" : "s"} deleted`);
  }
}

function updateViewBox(scale = state.zoom) {
  state.zoom = Math.min(1.8, Math.max(0.45, scale));
  const width = 1200 / state.zoom; const height = 760 / state.zoom;
  const current = svg.viewBox.baseVal;
  const centerX = current.x + current.width / 2; const centerY = current.y + current.height / 2;
  svg.setAttribute("viewBox", `${centerX - width / 2} ${centerY - height / 2} ${width} ${height}`);
  render();
}

function fitCircuit() {
  const components = [...state.circuit.components.values()];
  if (!components.length) {
    state.zoom = 1; svg.setAttribute("viewBox", "0 0 1200 760"); render(); return;
  }
  const minX = Math.min(...components.map((component) => component.x));
  const minY = Math.min(...components.map((component) => component.y));
  const maxX = Math.max(...components.map((component) => component.x + 156));
  const maxY = Math.max(...components.map((component) => component.y + componentHeight(component)));
  const padding = 64;
  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;
  svg.setAttribute("viewBox", `${minX - padding} ${minY - padding} ${width} ${height}`);
  state.zoom = Math.min(1.8, Math.max(0.45, Math.min(1200 / width, 760 / height)));
  render();
}

function advanceClock() {
  for (const component of state.circuit.components.values()) if (component.type === "clock") component.configuration.value = 0;
  state.simulation.propagate();
  for (const component of state.circuit.components.values()) {
    if (component.type === "masterSlave") definitions[component.type].evaluateState?.(component, false);
  }
  state.clockHigh = true;
  for (const component of state.circuit.components.values()) if (component.type === "clock") component.configuration.value = 1;
  const risingStable = state.simulation.stepClock();
  state.clockHigh = false;
  for (const component of state.circuit.components.values()) if (component.type === "clock") component.configuration.value = 0;
  const fallingStable = state.simulation.stepClock(); render();
  if (!risingStable || !fallingStable) showMessage("Circuit did not stabilize. Check for a feedback loop.");
}

function stopSimulation() {
  state.clockController.pause(); state.running = false; render();
}

function loadExample(exampleId) {
  const circuit = new Circuit();
  const example = buildExample(circuit, exampleId);
  stopSimulation();
  state.circuit = circuit; state.simulation = new Simulation(circuit); state.history = new History(circuit);
  state.circuitName = example.name; state.selectedId = example.selectedId; state.selectedIds = new Set([example.selectedId]); state.selectedWireId = null;
  state.wireStart = null; state.preview = null; state.clockHigh = false;
  safeRun(); fitCircuit(); showMessage(`${example.name} loaded`);
}

function insertExample(exampleId) {
  const sample = new Circuit();
  const example = buildExample(sample, exampleId);
  if (!state.circuit.components.size) { loadExample(exampleId); return; }

  const existing = [...state.circuit.components.values()];
  const additions = [...sample.components.values()];
  const offsetX = Math.max(...existing.map((component) => component.x + 156)) + 120 - Math.min(...additions.map((component) => component.x));
  const offsetY = Math.min(...existing.map((component) => component.y)) - Math.min(...additions.map((component) => component.y));
  state.history.checkpoint();
  const idMap = new Map();
  for (const saved of additions) {
    const component = state.circuit.add(saved.type, saved.x + offsetX, saved.y + offsetY, structuredClone(saved.configuration));
    component.name = saved.name; component.rotation = saved.rotation; component.state = structuredClone(saved.state);
    component.inputs = component.inputs.map((pin, index) => ({ ...pin, value: saved.inputs[index]?.value ?? 0 }));
    component.outputs = component.outputs.map((pin, index) => ({ ...pin, value: saved.outputs[index]?.value ?? 0 }));
    idMap.set(saved.id, component.id);
  }
  for (const wire of sample.wires.values()) state.circuit.connect(idMap.get(wire.sourceId), wire.sourcePort, idMap.get(wire.targetId), wire.targetPort);
  state.selectedId = idMap.get(example.selectedId) || null; state.selectedIds = new Set(idMap.values()); state.selectedWireId = null;
  safeRun(); fitCircuit(); showMessage(`${example.name} inserted`);
}

function showExamplesDialog() {
  const dialog = get("#examples-dialog");
  const list = get("#examples-list");
  list.replaceChildren();
  for (const example of exampleCatalog) {
    const entry = document.createElement("article"); entry.className = "example-entry";
    const copy = document.createElement("div"); copy.className = "example-copy";
    const title = document.createElement("h3"); title.textContent = example.name;
    const description = document.createElement("p"); description.textContent = example.description;
    copy.append(title, description);
    const actions = document.createElement("div"); actions.className = "example-actions";
    for (const [label, callback, primary] of [["Load", () => loadExample(example.id), true], ["Insert", () => insertExample(example.id), false]]) {
      const button = document.createElement("button"); button.type = "button"; button.className = `dialog-action ${primary ? "primary" : ""}`; button.textContent = label;
      button.addEventListener("click", () => {
        try { dialog.close(); callback(); }
        catch (error) { showMessage(`Could not add example: ${error.message}`); }
      });
      actions.append(button);
    }
    entry.append(copy, actions); list.append(entry);
  }
  dialog.showModal();
}

function showCircuitDialog(mode, renameFrom = "") {
  const dialog = get("#circuit-dialog");
  const body = get("#circuit-dialog-body");
  const isSave = mode === "save";
  const isRename = mode === "rename";
  body.replaceChildren();
  get("#circuit-dialog-title").textContent = isSave ? "Save circuit" : isRename ? "Rename saved circuit" : "Open saved circuit";

  if (isSave || isRename) {
    const label = document.createElement("label"); label.className = "dialog-label"; label.textContent = "Circuit name";
    const input = document.createElement("input"); input.className = "dialog-input"; input.type = "text"; input.maxLength = 80; input.value = isRename ? renameFrom : state.circuitName === "Untitled circuit" ? "My circuit" : state.circuitName; input.setAttribute("aria-label", "Circuit name");
    const submit = document.createElement("button"); submit.type = "button"; submit.className = "dialog-action primary"; submit.textContent = isRename ? "Rename" : "Save";
    submit.addEventListener("click", () => {
      const name = input.value.trim();
      if (!name) { input.focus(); showMessage("Enter a circuit name"); return; }
      try {
        if (isRename) {
          const renamed = renameCircuit(renameFrom, name);
          if (state.circuitName === renameFrom) state.circuitName = renamed;
          dialog.close(); render(); showMessage(`Renamed to ${renamed}`);
        } else {
          saveCircuit(name, state.circuit); state.circuitName = name;
          dialog.close(); render(); showMessage(`Saved ${name}`);
        }
      } catch (error) { showMessage(error.message || "Could not update the saved circuit."); }
    });
    const cancel = document.createElement("button"); cancel.type = "button"; cancel.className = "dialog-action"; cancel.textContent = "Cancel"; cancel.addEventListener("click", () => dialog.close());
    const actions = document.createElement("div"); actions.className = "dialog-actions"; actions.append(cancel, submit);
    body.append(label, input, actions);
    dialog.showModal(); input.focus();
    return;
  }

  const names = Object.keys(listCircuits());
  if (!names.length) {
    const empty = document.createElement("p"); empty.textContent = "No saved circuits yet."; body.append(empty);
  } else {
    const savedList = document.createElement("div"); savedList.className = "saved-circuit-list";
    for (const name of names) {
      const row = document.createElement("div"); row.className = "saved-circuit-row";
      const openButton = document.createElement("button"); openButton.type = "button"; openButton.className = "saved-circuit-button"; openButton.textContent = name;
      openButton.addEventListener("click", () => {
        try {
          state.circuit = new Circuit(loadCircuit(name)); state.simulation = new Simulation(state.circuit); state.history = new History(state.circuit); state.circuitName = name; state.selectedId = null; state.selectedIds.clear(); state.selectedWireId = null;
          dialog.close(); safeRun(); showMessage(`Opened ${name}`);
        } catch (error) { showMessage(`Could not open circuit: ${error.message}`); }
      });
      const renameButton = document.createElement("button"); renameButton.type = "button"; renameButton.className = "saved-circuit-tool"; renameButton.textContent = "Rename"; renameButton.addEventListener("click", () => { dialog.close(); showCircuitDialog("rename", name); });
      const deleteButton = document.createElement("button"); deleteButton.type = "button"; deleteButton.className = "saved-circuit-tool danger"; deleteButton.textContent = "Delete"; deleteButton.setAttribute("aria-label", `Delete ${name}`);
      deleteButton.addEventListener("click", () => {
        try {
          deleteCircuit(name);
          if (state.circuitName === name) state.circuitName = "Untitled circuit";
          row.remove(); render(); showMessage(`Deleted ${name}`);
          if (!savedList.children.length) { const empty = document.createElement("p"); empty.textContent = "No saved circuits yet."; body.replaceChildren(empty); }
        } catch { showMessage("Could not delete the saved circuit."); }
      });
      row.append(openButton, renameButton, deleteButton);
      savedList.append(row);
    }
    body.append(savedList);
  }
  dialog.showModal();
}

function runAction(action) {
  switch (action) {
    case "new":
      stopSimulation(); state.circuit = new Circuit(); state.simulation = new Simulation(state.circuit); state.history = new History(state.circuit); state.circuitName = "Untitled circuit"; state.selectedId = null; state.selectedIds.clear(); state.selectedWireId = null; render(); showMessage("New circuit"); break;
    case "save": showCircuitDialog("save"); break;
    case "open": showCircuitDialog("open"); break;
    case "import": get("#import-file").click(); break;
    case "export": {
      const blob = new Blob([exportCircuit(state.circuitName, state.circuit)], { type: LOGICFLOW_MIME_TYPE });
      const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `${state.circuitName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "logicflow-circuit"}${LOGICFLOW_FILE_EXTENSION}`; link.click(); URL.revokeObjectURL(link.href); showMessage("Circuit exported as a LogicFlow file"); break;
    }
    case "undo": if (state.history.undo()) { state.simulation = new Simulation(state.circuit); state.selectedId = null; state.selectedIds.clear(); safeRun(); showMessage("Undo"); } else showMessage("Nothing to undo"); break;
    case "redo": if (state.history.redo()) { state.simulation = new Simulation(state.circuit); state.selectedId = null; state.selectedIds.clear(); safeRun(); showMessage("Redo"); } else showMessage("Nothing to redo"); break;
    case "run":
      if (!state.circuit.components.size) { stopSimulation(); showMessage("Add a component before starting simulation."); break; }
      if (!state.running) { state.running = true; state.clockController.start(); safeRun(); render(); showMessage("Simulation running"); }
      break;
    case "step": advanceClock(); showMessage("Clock stepped"); break;
    case "pause": stopSimulation(); showMessage("Simulation paused"); break;
    case "stop": stopSimulation(); state.clockHigh = false; render(); showMessage("Simulation stopped"); break;
    case "reset":
      stopSimulation();
      for (const component of state.circuit.components.values()) {
        if (component.type === "switch" || component.type === "clock") component.configuration.value = 0;
        if (definitions[component.type].sequential) component.state = initialState(component.type, component.configuration);
      }
      safeRun(); showMessage("Circuit reset"); break;
    case "theme":
      document.body.classList.toggle("dark");
      try { localStorage.setItem("logicflow.theme", document.body.classList.contains("dark") ? "dark" : "light"); } catch { showMessage("Theme changed for this session"); }
      break;
    case "grid": state.grid = !state.grid; svg.querySelector(".grid-bg")?.setAttribute("visibility", state.grid ? "visible" : "hidden"); get('[data-action="grid"]').setAttribute("aria-pressed", String(state.grid)); break;
    case "fit": fitCircuit(); break;
    case "zoom-in": updateViewBox(state.zoom + 0.1); break;
    case "zoom-out": updateViewBox(state.zoom - 0.1); break;
    case "delete": deleteSelection(); break;
    case "help": get("#help-dialog").showModal(); break;
    case "examples": showExamplesDialog(); break;
    case "toggle-palette": togglePanel("palette"); break;
    case "toggle-inspector": togglePanel("inspector"); break;
  }
}

list.addEventListener("click", (event) => {
  const button = event.target.closest("[data-component-type]");
  if (button) addComponent(button.dataset.componentType);
});
list.addEventListener("dragstart", (event) => {
  const button = event.target.closest("[data-component-type]");
  if (button) { event.dataTransfer.setData("text/plain", button.dataset.componentType); event.dataTransfer.effectAllowed = "copy"; }
});
svg.addEventListener("dragover", (event) => event.preventDefault());
svg.addEventListener("drop", (event) => {
  event.preventDefault();
  const type = event.dataTransfer.getData("text/plain");
  if (definitions[type]) { const point = screenPoint(event); addComponent(type, point.x, point.y); }
});
get("#component-search").addEventListener("input", (event) => {
  const query = event.target.value.trim().toLowerCase();
  for (const button of list.querySelectorAll("[data-component-type]")) button.hidden = !button.textContent.toLowerCase().includes(query);
  for (const group of list.querySelectorAll(".component-group")) group.hidden = !group.querySelector("[data-component-type]:not([hidden])");
});
document.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", () => runAction(button.dataset.action)));
if (window.innerWidth <= 850) setPanelCollapsed("inspector", true);

for (const handle of document.querySelectorAll("[data-resize]")) {
  const panel = handle.dataset.resize;
  const property = panel === "palette" ? "--palette-width" : "--inspector-width";
  const minimum = panel === "palette" ? 150 : 170;
  const maximum = panel === "palette" ? 380 : 420;
  const defaultWidth = panel === "palette" ? 246 : 266;
  let drag = null;
  const setWidth = (width) => workspace.style.setProperty(property, `${Math.min(maximum, Math.max(minimum, width))}px`);
  handle.addEventListener("pointerdown", (event) => {
    drag = { x: event.clientX, width: (panel === "palette" ? get(".palette") : get(".inspector")).getBoundingClientRect().width };
    handle.setPointerCapture(event.pointerId); event.preventDefault();
  });
  handle.addEventListener("pointermove", (event) => {
    if (drag) setWidth(drag.width + (panel === "palette" ? event.clientX - drag.x : drag.x - event.clientX));
  });
  const stopResize = () => { drag = null; };
  handle.addEventListener("pointerup", stopResize);
  handle.addEventListener("pointercancel", stopResize);
  handle.addEventListener("dblclick", () => setWidth(defaultWidth));
  handle.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    const direction = (event.key === "ArrowRight" ? 1 : -1) * (panel === "palette" ? 1 : -1);
    setWidth((panel === "palette" ? get(".palette") : get(".inspector")).getBoundingClientRect().width + direction * 12);
    event.preventDefault();
  });
}
get("#clock-frequency").addEventListener("change", (event) => {
  try { state.clockController.setFrequency(event.target.value); showMessage(`Clock set to ${state.clockController.frequency} Hz`); }
  catch (error) { event.target.value = String(state.clockController.frequency); showMessage(error.message); }
});

svg.addEventListener("pointerdown", (event) => {
  if (event.button === 1 || (event.button === 0 && event.shiftKey && (event.target === svg || event.target.dataset.grid))) {
    const view = svg.viewBox.baseVal;
    state.pan = { clientX: event.clientX, clientY: event.clientY, x: view.x, y: view.y, width: view.width, height: view.height };
    svg.setPointerCapture(event.pointerId); event.preventDefault(); return;
  }
  if (event.target.closest("[data-switch-toggle]")) { event.preventDefault(); event.stopPropagation(); return; }
  const pin = event.target.closest("[data-pin-kind]");
  if (pin?.dataset.pinKind === "input" && state.wireStart) { connectPins(pin); event.preventDefault(); return; }
  if (pin) return;
  const node = event.target.closest("[data-component-id]");
  if (node) {
    const component = state.circuit.components.get(node.dataset.componentId);
    if (!component) return;
    if (event.shiftKey) { event.preventDefault(); return; }
    if (state.selectedIds.size <= 1 || !state.selectedIds.has(component.id)) selectComponent(component.id);
    else { state.selectedId = component.id; render(); }
    const ids = state.selectedIds.size > 1 ? [...state.selectedIds] : [component.id];
    const originals = new Map(ids.map((id) => { const item = state.circuit.components.get(id); return [id, { x: item.x, y: item.y }]; }));
    state.moving = { ids, point: screenPoint(event), originals, changed: false };
    svg.setPointerCapture(event.pointerId); event.preventDefault(); return;
  }
  const wire = event.target.closest("[data-wire-id]");
  if (wire) { state.selectedWireId = wire.dataset.wireId; state.selectedId = null; state.selectedIds.clear(); render(); return; }
  if (event.target === svg || event.target.dataset.grid) { state.selectedId = null; state.selectedIds.clear(); state.selectedWireId = null; render(); }
});
svg.addEventListener("pointermove", (event) => {
  if (state.pan) {
    const dx = (event.clientX - state.pan.clientX) * state.pan.width / svg.clientWidth;
    const dy = (event.clientY - state.pan.clientY) * state.pan.height / svg.clientHeight;
    svg.setAttribute("viewBox", `${state.pan.x - dx} ${state.pan.y - dy} ${state.pan.width} ${state.pan.height}`);
    return;
  }
  const point = screenPoint(event);
  if (state.wireStart) { state.preview = { start: state.wireStart.start, end: point }; updateWirePreview(svg, state.preview); }
  if (state.moving) {
    const dx = point.x - state.moving.point.x; const dy = point.y - state.moving.point.y;
    if (Math.abs(dx) + Math.abs(dy) > 2 && !state.moving.changed) { state.history.checkpoint(); state.moving.changed = true; }
    for (const id of state.moving.ids) {
      const component = state.circuit.components.get(id); const original = state.moving.originals.get(id);
      if (component) { component.x = Math.max(10, original.x + dx); component.y = Math.max(10, original.y + dy); }
    }
    render();
  }
});
svg.addEventListener("pointerup", (event) => {
  if (state.pan) { state.pan = null; return; }
  if (state.moving) {
    for (const id of state.moving.ids) {
      const component = state.circuit.components.get(id);
      if (component) { component.x = Math.round(component.x / 22) * 22; component.y = Math.round(component.y / 22) * 22; }
    }
    if (state.moving.changed) { state.simulation.propagate(); render(); }
    state.moving = null;
  }
});
svg.addEventListener("click", (event) => {
  const switchControl = event.target.closest("[data-switch-toggle]");
  if (switchControl) { toggleSwitch(switchControl.dataset.switchToggle); event.preventDefault(); event.stopPropagation(); return; }
  const pin = event.target.closest("[data-pin-kind]");
  if (pin?.dataset.pinKind === "output") {
    const component = state.circuit.components.get(pin.dataset.componentId);
    state.wireStart = { componentId: component.id, portIndex: Number(pin.dataset.portIndex), start: pinPosition(component, "output", Number(pin.dataset.portIndex)) };
    state.preview = { start: state.wireStart.start, end: state.wireStart.start };
    render(); showMessage(`Wire from ${component.name}: choose an input pin`); return;
  }
  if (pin?.dataset.pinKind === "input" && state.wireStart) { connectPins(pin); return; }
  const wire = event.target.closest("[data-wire-id]");
  if (wire) { state.selectedWireId = wire.dataset.wireId; state.selectedId = null; state.selectedIds.clear(); render(); return; }
  const node = event.target.closest("[data-component-id]");
  if (node) { selectComponent(node.dataset.componentId, event.shiftKey); return; }
  if (state.wireStart) { state.wireStart = null; state.preview = null; render(); }
});
svg.addEventListener("wheel", (event) => { event.preventDefault(); updateViewBox(state.zoom + (event.deltaY < 0 ? 0.08 : -0.08)); }, { passive: false });

get("#import-file").addEventListener("change", async (event) => {
  const file = event.target.files[0]; if (!file) return;
  try {
    const data = parseCircuitFile(await file.text());
    const circuit = new Circuit(data);
    state.circuit = circuit; state.simulation = new Simulation(circuit); state.history = new History(circuit); state.circuitName = String(data.name || file.name.replace(/\.json$/i, "")); state.selectedId = null; safeRun(); showMessage("Circuit imported");
  } catch (error) { showMessage(`Import rejected: ${error.message}`); }
  event.target.value = "";
});

document.addEventListener("keydown", (event) => {
  if (event.target.matches("[data-switch-toggle]") && ["Enter", " "].includes(event.key)) {
    toggleSwitch(event.target.dataset.switchToggle); event.preventDefault(); return;
  }
  if (event.target.matches("input, textarea")) return;
  if (event.key === "Delete" || event.key === "Backspace") { deleteSelection(); event.preventDefault(); }
  else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") { runAction(event.shiftKey ? "redo" : "undo"); event.preventDefault(); }
  else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") { runAction("redo"); event.preventDefault(); }
  else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") { runAction("save"); event.preventDefault(); }
  else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "o") { runAction("import"); event.preventDefault(); }
  else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") { state.selectedIds = new Set(state.circuit.components.keys()); state.selectedId = [...state.selectedIds].at(-1) || null; state.selectedWireId = null; render(); event.preventDefault(); }
  else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c") { copySelection(); event.preventDefault(); }
  else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v") { pasteSelection(); event.preventDefault(); }
  else if (event.key === "Escape") { state.wireStart = null; state.preview = null; render(); }
  else if (event.key === " ") { runAction(state.running ? "pause" : "run"); event.preventDefault(); }
});

window.addEventListener("beforeunload", () => state.clockController.stop());
try { if (localStorage.getItem("logicflow.theme") === "dark") document.body.classList.add("dark"); } catch { /* storage may be disabled */ }
createPalette(list, definitions, categoryFor); render();