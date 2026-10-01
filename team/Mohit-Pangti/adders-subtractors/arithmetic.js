import { registerComponent } from "../../../shared/components/registry.js";

export function evaluateArithmetic(type, values) {
  const [a, b, carry] = values;
  switch (type) {
    case "halfAdder": return [a ^ b, a & b];
    case "fullAdder": return [a ^ b ^ carry, (a & b) | (a & carry) | (b & carry)];
    case "halfSubtractor": return [a ^ b, (1 - a) & b];
    case "fullSubtractor": return [a ^ b ^ carry, ((1 - a) & b) | ((1 - (a ^ b)) & carry)];
    default: return null;
  }
}

for (const type of ["halfAdder", "fullAdder", "halfSubtractor", "fullSubtractor"]) {
  registerComponent({ type, evaluate: (component) => evaluateArithmetic(type, component.inputs.map((pin) => Number(Boolean(pin.value)))) });
}