import { evaluateCombinational } from "../../Mohit-Pangti/combinational/evaluate.js";
import { sequentialOutputs } from "../sequential-logic/dispatch.js";

export class Simulation {
  constructor(circuit) { this.circuit = circuit; this.maxPasses = 100; }

  propagate() {
    const maxPasses = Math.max(this.maxPasses, this.circuit.components.size * 4);
    const incoming = new Map();
    for (const wire of this.circuit.wires.values()) {
      const list = incoming.get(wire.targetId);
      if (list) list.push(wire); else incoming.set(wire.targetId, [wire]);
    }
    for (const component of this.circuit.components.values()) {
      component.inputs.forEach((pin) => { pin.value = 0; });
    }
    let stable = false;
    for (let pass = 0; pass < maxPasses && !stable; pass += 1) {
      stable = true;
      for (const component of this.circuit.components.values()) {
        for (const wire of incoming.get(component.id) || []) {
          const from = this.circuit.components.get(wire.sourceId);
          if (from) component.inputs[wire.targetPort].value = from.outputs[wire.sourcePort]?.value ?? 0;
        }
        if (definitions[component.type].sequential) {
          const next = sequentialOutputs(component);
          next.forEach((value, index) => {
            if (component.outputs[index] && component.outputs[index].value !== value) stable = false;
            if (component.outputs[index]) component.outputs[index].value = value;
          });
          continue;
        }
        const next = evaluateCombinational(component);
        next.forEach((value, index) => {
          if (component.outputs[index] && component.outputs[index].value !== value) stable = false;
          if (component.outputs[index]) component.outputs[index].value = value;
        });
      }
    }
    this.unstable = !stable;
    return !this.unstable;
  }

  stepClock() {
    this.propagate();
    for (const component of this.circuit.components.values()) {
      if (definitions[component.type].sequential) definitions[component.type].evaluateState?.(component, true);
    }
    return this.propagate();
  }
}

import { definitions } from "../../../shared/components/registry.js";
