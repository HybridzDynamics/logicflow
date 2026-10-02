import { evaluateCombinational } from "../../Mohit-Pangti/combinational/evaluate.js";
import { sequentialOutputs } from "../sequential-logic/dispatch.js";

export class Simulation {
  constructor(circuit) { this.circuit = circuit; this.maxPasses = 100; }

  propagate() {
    for (const component of this.circuit.components.values()) {
      component.inputs.forEach((pin) => { pin.value = 0; });
    }
    let stable = false;
    for (let pass = 0; pass < this.maxPasses && !stable; pass += 1) {
      for (const wire of this.circuit.wires.values()) {
        const from = this.circuit.components.get(wire.sourceId);
        const to = this.circuit.components.get(wire.targetId);
        if (from && to) to.inputs[wire.targetPort].value = from.outputs[wire.sourcePort]?.value ?? 0;
      }
      stable = true;
      for (const component of this.circuit.components.values()) {
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