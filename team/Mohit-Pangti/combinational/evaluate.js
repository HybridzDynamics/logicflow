import "../logic-gates/gates.js";
import "../adders-subtractors/arithmetic.js";
import "../multiplexers/routing.js";
import "../decoders-encoders/addressing.js";
import "../parity/parity.js";
import { definitions } from "../../../shared/components/registry.js";

const bit = (value) => Number(Boolean(value));

export function evaluateCombinational(component) {
  const v = component.inputs.map((pin) => bit(pin.value));
  const c = component.configuration;
  const registeredEvaluator = definitions[component.type]?.evaluate;
  if (registeredEvaluator) return registeredEvaluator(component);
  switch (component.type) {
    case "switch": return [bit(c.value)];
    case "clock": return [bit(c.value)];
    case "const0": return [0];
    case "const1": return [1];
    default: return component.outputs.map((pin) => bit(pin.value));
  }
}

export function outputValue(component, outputIndex) {
  if (["led", "output"].includes(component.type)) return component.inputs[0]?.value ?? 0;
  return component.outputs[outputIndex]?.value ?? 0;
}