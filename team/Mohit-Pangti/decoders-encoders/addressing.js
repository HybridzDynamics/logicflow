import { registerComponent } from "../../../shared/components/registry.js";

export function evaluateAddressing(type, values) {
  const decoderBits = Number(type.match(/^decoder(\d+)$/)?.[1]);
  if (decoderBits) {
    const address = values.slice(0, decoderBits).reduce((value, bit, index) => value | (bit << index), 0);
    return Array.from({ length: 1 << decoderBits }, (_, index) => Number(Boolean(values[decoderBits]) && address === index));
  }
  const encoderSize = Number(type.match(/^(?:priority)?encoder(\d+)$/i)?.[1]);
  if (encoderSize) {
    const selected = values.findLastIndex(Boolean);
    return [...Array.from({ length: Math.log2(encoderSize) }, (_, index) => selected < 0 ? 0 : (selected >> index) & 1), Number(selected >= 0)];
  }
  return null;
}

for (const type of ["decoder2", "decoder3", "decoder4", "encoder4", "priorityEncoder4", "encoder8", "priorityEncoder8"]) {
  registerComponent({ type, evaluate: (component) => evaluateAddressing(type, component.inputs.map((pin) => Number(Boolean(pin.value)))) });
}