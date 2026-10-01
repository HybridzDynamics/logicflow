const counterTypes = new Set(["counter4", "syncCounter4", "rippleCounter4", "ringCounter4", "johnsonCounter4", "moduloCounter4"]);

export function isCounter(type) { return counterTypes.has(type); }

export function advanceCounter(component) {
  if (!isCounter(component.type)) return false;
  const state = component.state;
  switch (component.type) {
    case "ringCounter4": state.value = ((state.value << 1) & 15) | ((state.value >> 3) & 1); break;
    case "johnsonCounter4": state.value = ((state.value << 1) & 15) | (1 - ((state.value >> 3) & 1)); break;
    case "moduloCounter4": state.value = (state.value + 1) % Math.max(1, state.modulo); break;
    default: state.value = (state.value + 1) & 15;
  }
  return true;
}

export function counterOutputs(component) {
  return component.outputs.map((_, bit) => (component.state.value >> bit) & 1);
}