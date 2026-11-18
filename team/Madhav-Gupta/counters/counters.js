const counterTypes = new Set(["counter4", "syncCounter4", "rippleCounter4", "ringCounter4", "johnsonCounter4", "moduloCounter4"]);

export function isCounter(type) { return counterTypes.has(type); }

export function advanceCounter(component) {
  if (!isCounter(component.type)) return false;
  const state = component.state;
  const raw = Number(state.value);
  const value = ((Number.isFinite(raw) ? Math.floor(raw) : 0) % 16 + 16) % 16;
  switch (component.type) {
    case "ringCounter4": state.value = ((value << 1) & 15) | ((value >> 3) & 1); break;
    case "johnsonCounter4": state.value = ((value << 1) & 15) | (1 - ((value >> 3) & 1)); break;
    case "moduloCounter4": {
      const requested = Number(state.modulo);
      const modulo = Number.isInteger(requested) && requested >= 1 ? Math.min(16, requested) : 16;
      state.value = (value + 1) % modulo;
      break;
    }
    default: state.value = (value + 1) & 15;
  }
  return true;
}

export function counterOutputs(component) {
  return component.outputs.map((_, bit) => (component.state.value >> bit) & 1);
}
