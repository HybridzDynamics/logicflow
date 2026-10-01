export class Circuit {
  constructor(data) {
    this.components = new Map();
    this.wires = new Map();
    this.nextId = 1;
    if (data) this.load(data);
  }

  add(type, x = 120, y = 120, configuration = {}) {
    const definition = definitions[type];
    if (!definition) throw new Error(`Unsupported component: ${type}`);
    if (!configuration || typeof configuration !== "object" || Array.isArray(configuration)) throw new Error("Component configuration must be an object.");
    x = finiteNumber(x, null);
    y = finiteNumber(y, null);
    const id = `c${this.nextId++}`;
    const component = {
      id, type, name: definition.label, x, y, rotation: 0,
      configuration: { ...definition.configuration, ...configuration },
      inputs: definition.inputs.map((name, index) => ({ id: `i${index}`, name, value: 0 })),
      outputs: definition.outputs.map((name, index) => ({ id: `o${index}`, name, value: 0 })),
      state: definition.sequential ? initialState(type, configuration) : {}
    };
    this.components.set(id, component);
    return component;
  }

  connect(sourceId, sourcePort, targetId, targetPort) {
    const source = this.components.get(sourceId);
    const target = this.components.get(targetId);
    if (!source || !target) throw new Error("Both components must exist.");
    if (!source.outputs[sourcePort] || !target.inputs[targetPort]) throw new Error("A wire must connect an output to an input.");
    if (this.wires.has(`${targetId}:${targetPort}`)) throw new Error("That input already has a wire.");
    const id = `w${this.nextId++}`;
    this.wires.set(id, { id, sourceId, sourcePort, targetId, targetPort });
    return id;
  }

  disconnect(id) { return this.wires.delete(id); }

  remove(id) {
    if (!this.components.delete(id)) return false;
    for (const [wireId, wire] of this.wires) {
      if (wire.sourceId === id || wire.targetId === id) this.wires.delete(wireId);
    }
    return true;
  }

  copyComponents(componentIds) {
    const selected = new Set(componentIds);
    return {
      components: [...this.components.values()].filter((component) => selected.has(component.id)).map((component) => structuredClone(component)),
      wires: [...this.wires.values()].filter((wire) => selected.has(wire.sourceId) && selected.has(wire.targetId)).map((wire) => structuredClone(wire))
    };
  }

  pasteComponents(snapshot, offset = 44) {
    if (!snapshot || !Array.isArray(snapshot.components) || !Array.isArray(snapshot.wires)) throw new Error("Invalid component clipboard data.");
    const idMap = new Map();
    for (const saved of snapshot.components) {
      const component = this.add(saved.type, finiteNumber(saved.x, null) + offset, finiteNumber(saved.y, null) + offset, structuredClone(saved.configuration || {}));
      component.name = typeof saved.name === "string" ? saved.name : component.name;
      component.rotation = Number(saved.rotation) || 0;
      component.state = structuredClone(saved.state || component.state);
      component.inputs.forEach((pin, index) => { pin.value = Number(saved.inputs[index]?.value) || 0; });
      component.outputs.forEach((pin, index) => { pin.value = Number(saved.outputs[index]?.value) || 0; });
      idMap.set(saved.id, component.id);
    }
    for (const wire of snapshot.wires) {
      const sourceId = idMap.get(wire.sourceId);
      const targetId = idMap.get(wire.targetId);
      if (sourceId && targetId) this.connect(sourceId, wire.sourcePort, targetId, wire.targetPort);
    }
    return [...idMap.values()];
  }

  serialize() {
    return { version: 1, components: [...this.components.values()], wires: [...this.wires.values()] };
  }

  load(data) {
    if (!data || typeof data !== "object" || (data.version !== undefined && data.version !== 1) || !Array.isArray(data.components) || !Array.isArray(data.wires)) throw new Error("Invalid or unsupported circuit document.");
    const candidate = new Circuit();
    const ids = new Set();
    for (const saved of data.components) {
      if (!saved || typeof saved !== "object" || Array.isArray(saved)) throw new Error("Circuit contains an invalid component.");
      const componentId = String(saved.id || "");
      if (!componentId || ids.has(componentId)) throw new Error("Circuit contains a missing or duplicate component ID.");
      ids.add(componentId);
      const component = candidate.add(saved.type, finiteNumber(saved.x, null), finiteNumber(saved.y, null), saved.configuration || {});
      component.id = componentId;
      component.name = typeof saved.name === "string" ? saved.name.slice(0, 80) : component.name;
      component.rotation = Number(saved.rotation) || 0;
      if (!Array.isArray(saved.inputs) || !Array.isArray(saved.outputs) || saved.inputs.length !== component.inputs.length || saved.outputs.length !== component.outputs.length) throw new Error("A component has invalid pins.");
      for (const pin of [...saved.inputs, ...saved.outputs]) if (![0, 1].includes(Number(pin?.value))) throw new Error("Circuit pins must contain binary values.");
      component.inputs = component.inputs.map((pin, index) => ({ ...pin, value: Number(saved.inputs[index].value) }));
      component.outputs = component.outputs.map((pin, index) => ({ ...pin, value: Number(saved.outputs[index].value) }));
      component.state = saved.state && typeof saved.state === "object" ? structuredClone(saved.state) : component.state;
      candidate.components.set(component.id, component);
    }
    for (const wire of data.wires) {
      if (!wire || typeof wire !== "object" || !Number.isInteger(Number(wire.sourcePort)) || !Number.isInteger(Number(wire.targetPort))) throw new Error("Circuit contains an invalid wire.");
      candidate.connect(String(wire.sourceId), Number(wire.sourcePort), String(wire.targetId), Number(wire.targetPort));
    }
    const suffixes = [...candidate.components.keys(), ...candidate.wires.keys()].map((id) => Number(id.match(/^\w(\d+)$/)?.[1]) || 0);
    candidate.nextId = Math.max(candidate.nextId, ...suffixes.map((suffix) => suffix + 1));
    this.components = candidate.components;
    this.wires = candidate.wires;
    this.nextId = candidate.nextId;
  }
}

import { definitions, initialState } from "../../../shared/components/registry.js";
import { finiteNumber } from "../../../shared/utilities/numbers.js";