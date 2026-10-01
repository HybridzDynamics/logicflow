import { registerComponent } from "../../../shared/components/registry.js";

export function evaluateRouting(type, values) {
  const muxSize = Number(type.match(/^mux(\d+)$/)?.[1]);
  if (muxSize) {
    const select = values.slice(muxSize).reduce((value, bit, index) => value | (bit << index), 0);
    return [values[Math.min(select, muxSize - 1)]];
  }
  const demuxSize = Number(type.match(/^demux(\d+)$/)?.[1]);
  if (demuxSize) {
    const select = values.slice(1).reduce((value, bit, index) => value | (bit << index), 0);
    return Array.from({ length: demuxSize }, (_, index) => Number(index === select) & values[0]);
  }
  return null;
}

for (const type of ["mux2", "mux4", "mux8", "mux16", "demux2", "demux4", "demux8", "demux16"]) {
  registerComponent({ type, evaluate: (component) => evaluateRouting(type, component.inputs.map((pin) => Number(Boolean(pin.value)))) });
}