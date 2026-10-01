const registerTypes = new Set(["siso4", "sipo4", "piso4", "pipo4"]);

export function isRegister(type) { return registerTypes.has(type); }

export function evaluateRegister(component, input) {
  if (!isRegister(component.type)) return false;
  const state = component.state;
  const width = state.width || 4;
  const mask = (1 << width) - 1;
  if (["siso4", "sipo4"].includes(component.type)) {
    state.serialOut = (state.value >> (width - 1)) & 1;
    state.value = ((state.value << 1) | input(0)) & mask;
  } else if (component.type === "piso4") {
    if (input(width)) state.value = component.inputs.slice(0, width).reduce((value, pin, index) => value | (Number(Boolean(pin.value)) << index), 0);
    else { state.serialOut = state.value & 1; state.value >>= 1; }
  } else if (input(width)) {
    state.value = component.inputs.slice(0, width).reduce((value, pin, index) => value | (Number(Boolean(pin.value)) << index), 0);
  }
  return true;
}

export function registerOutputs(component) {
  if (["siso4", "piso4"].includes(component.type)) return [Number(Boolean(component.state.serialOut))];
  return component.outputs.map((_, bit) => (component.state.value >> bit) & 1);
}