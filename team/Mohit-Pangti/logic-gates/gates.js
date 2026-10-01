import { registerComponent } from "../../../shared/components/registry.js";

export function evaluateGate(type, values) {
  switch (type) {
    case "and": return [Number(values.every(Boolean))];
    case "or": return [Number(values.some(Boolean))];
    case "not": return [1 - values[0]];
    case "nand": return [Number(!values.every(Boolean))];
    case "nor": return [Number(!values.some(Boolean))];
    case "xor": return [values.reduce((result, value) => result ^ value, 0)];
    case "xnor": return [1 - values.reduce((result, value) => result ^ value, 0)];
    default: return null;
  }
}

for (const type of ["and", "or", "not", "nand", "nor", "xor", "xnor"]) {
  registerComponent({ type, evaluate: (component) => evaluateGate(type, component.inputs.map((pin) => Number(Boolean(pin.value)))) });
}