import { registerComponent } from "../../../shared/components/registry.js";

function parity(values) { return values.reduce((result, value) => result ^ Number(Boolean(value)), 0); }

export function evaluateParity(type, values) {
  switch (type) {
    case "evenParity": return [parity(values)];
    case "oddParity": return [1 - parity(values)];
    case "evenParityCheck": return [Number(parity(values.slice(0, -1)) === values.at(-1))];
    case "oddParityCheck": return [Number(parity(values.slice(0, -1)) !== values.at(-1))];
    default: return null;
  }
}

for (const type of ["evenParity", "oddParity", "evenParityCheck", "oddParityCheck"]) {
  registerComponent({ type, evaluate: (component) => evaluateParity(type, component.inputs.map((pin) => Number(Boolean(pin.value)))) });
}