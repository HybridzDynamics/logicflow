const unary = ["A"];
const binary = ["A", "B"];
const gate = (label, inputs, evaluate, extra = {}) => ({ label, inputs, outputs: ["Y"], evaluate, ...extra });

export const definitions = {
  switch: { label: "Switch", inputs: [], outputs: ["Y"], configuration: { value: 0 } },
  clock: { label: "Clock", inputs: [], outputs: ["Y"], configuration: { value: 0 } },
  led: { label: "LED", inputs: ["A"], outputs: [] },
  output: { label: "Output", inputs: ["A"], outputs: [] },
  const0: { label: "Constant 0", inputs: [], outputs: ["Y"] },
  const1: { label: "Constant 1", inputs: [], outputs: ["Y"] },
  and: gate("AND", binary, (v) => v.every(Boolean)),
  or: gate("OR", binary, (v) => v.some(Boolean)),
  not: gate("NOT", unary, (v) => !v[0]),
  nand: gate("NAND", binary, (v) => !v.every(Boolean)),
  nor: gate("NOR", binary, (v) => !v.some(Boolean)),
  xor: gate("XOR", binary, (v) => v.reduce((a, b) => a !== Boolean(b), false)),
  xnor: gate("XNOR", binary, (v) => v.reduce((a, b) => a !== Boolean(b), false) === false),
  halfAdder: { label: "Half Adder", inputs: binary, outputs: ["Sum", "Carry"] },
  fullAdder: { label: "Full Adder", inputs: ["A", "B", "Cin"], outputs: ["Sum", "Cout"] },
  halfSubtractor: { label: "Half Subtractor", inputs: binary, outputs: ["Difference", "Borrow"] },
  fullSubtractor: { label: "Full Subtractor", inputs: ["A", "B", "Bin"], outputs: ["Difference", "Bout"] },
  mux2: { label: "2:1 MUX", inputs: ["D0", "D1", "S0"], outputs: ["Y"] },
  mux4: { label: "4:1 MUX", inputs: ["D0", "D1", "D2", "D3", "S0", "S1"], outputs: ["Y"] },
  mux8: { label: "8:1 MUX", inputs: [...Array.from({ length: 8 }, (_, i) => `D${i}`), "S0", "S1", "S2"], outputs: ["Y"] },
  mux16: { label: "16:1 MUX", inputs: [...Array.from({ length: 16 }, (_, i) => `D${i}`), "S0", "S1", "S2", "S3"], outputs: ["Y"] },
  demux2: { label: "1:2 DEMUX", inputs: ["D", "S0"], outputs: ["Y0", "Y1"] },
  demux4: { label: "1:4 DEMUX", inputs: ["D", "S0", "S1"], outputs: ["Y0", "Y1", "Y2", "Y3"] },
  demux8: { label: "1:8 DEMUX", inputs: ["D", "S0", "S1", "S2"], outputs: Array.from({ length: 8 }, (_, i) => `Y${i}`) },
  demux16: { label: "1:16 DEMUX", inputs: ["D", "S0", "S1", "S2", "S3"], outputs: Array.from({ length: 16 }, (_, i) => `Y${i}`) },
  decoder2: { label: "2:4 Decoder", inputs: ["A0", "A1", "EN"], outputs: ["Y0", "Y1", "Y2", "Y3"] },
  decoder3: { label: "3:8 Decoder", inputs: ["A0", "A1", "A2", "EN"], outputs: Array.from({ length: 8 }, (_, i) => `Y${i}`) },
  decoder4: { label: "4:16 Decoder", inputs: ["A0", "A1", "A2", "A3", "EN"], outputs: Array.from({ length: 16 }, (_, i) => `Y${i}`) },
  encoder4: { label: "4:2 Encoder", inputs: ["D0", "D1", "D2", "D3"], outputs: ["B0", "B1", "Valid"] },
  priorityEncoder4: { label: "4:2 Priority Encoder", inputs: ["D0", "D1", "D2", "D3"], outputs: ["B0", "B1", "Valid"] },
  encoder8: { label: "8:3 Encoder", inputs: Array.from({ length: 8 }, (_, i) => `D${i}`), outputs: ["B0", "B1", "B2", "Valid"] },
  priorityEncoder8: { label: "8:3 Priority Encoder", inputs: Array.from({ length: 8 }, (_, i) => `D${i}`), outputs: ["B0", "B1", "B2", "Valid"] },
  evenParity: { label: "Even Parity Generator", inputs: ["A", "B", "C", "D"], outputs: ["P"] },
  oddParity: { label: "Odd Parity Generator", inputs: ["A", "B", "C", "D"], outputs: ["P"] },
  evenParityCheck: { label: "Even Parity Checker", inputs: ["A", "B", "C", "D", "P"], outputs: ["PASS"] },
  oddParityCheck: { label: "Odd Parity Checker", inputs: ["A", "B", "C", "D", "P"], outputs: ["PASS"] },
  sr: { label: "SR Flip-Flop", inputs: ["S", "R", "CLK"], outputs: ["Q", "Q̅"], sequential: true },
  dff: { label: "D Flip-Flop", inputs: ["D", "CLK"], outputs: ["Q", "Q̅"], sequential: true },
  jkff: { label: "JK Flip-Flop", inputs: ["J", "K", "CLK"], outputs: ["Q", "Q̅"], sequential: true },
  tff: { label: "T Flip-Flop", inputs: ["T", "CLK"], outputs: ["Q", "Q̅"], sequential: true },
  masterSlave: { label: "Master-Slave D Flip-Flop", inputs: ["D", "CLK"], outputs: ["Q", "Q̅"], sequential: true },
  siso4: { label: "4-bit SISO Register", inputs: ["SI", "CLK", "RESET"], outputs: ["SO"], sequential: true },
  sipo4: { label: "4-bit SIPO Register", inputs: ["SI", "CLK", "RESET"], outputs: ["Q0", "Q1", "Q2", "Q3"], sequential: true },
  piso4: { label: "4-bit PISO Register", inputs: ["P0", "P1", "P2", "P3", "LOAD", "CLK", "RESET"], outputs: ["SO"], sequential: true },
  pipo4: { label: "4-bit PIPO Register", inputs: ["D0", "D1", "D2", "D3", "LOAD", "CLK", "RESET"], outputs: ["Q0", "Q1", "Q2", "Q3"], sequential: true },
  counter4: { label: "4-bit Synchronous Counter", inputs: ["CLK", "RESET"], outputs: ["Q0", "Q1", "Q2", "Q3"], sequential: true, configuration: { modulo: 16 } },
  syncCounter4: { label: "4-bit Synchronous Counter", inputs: ["CLK", "RESET"], outputs: ["Q0", "Q1", "Q2", "Q3"], sequential: true },
  ringCounter4: { label: "4-bit Ring Counter", inputs: ["CLK", "RESET"], outputs: ["Q0", "Q1", "Q2", "Q3"], sequential: true },
  johnsonCounter4: { label: "4-bit Johnson Counter", inputs: ["CLK", "RESET"], outputs: ["Q0", "Q1", "Q2", "Q3"], sequential: true },
  rippleCounter4: { label: "4-bit Ripple Counter", inputs: ["CLK", "RESET"], outputs: ["Q0", "Q1", "Q2", "Q3"], sequential: true },
  moduloCounter4: { label: "Modulo-N Counter", inputs: ["CLK", "RESET"], outputs: ["Q0", "Q1", "Q2", "Q3"], sequential: true, configuration: { modulo: 10 } }
};

export function registerComponent(registration) {
  if (!registration || typeof registration.type !== "string" || !registration.type) throw new Error("A component registration needs a type.");
  const existing = definitions[registration.type];
  if (!existing && (!registration.label || !Array.isArray(registration.inputs) || !Array.isArray(registration.outputs))) throw new Error(`Component ${registration.type} needs a label and pin definitions.`);
  if (registration.evaluate !== undefined && typeof registration.evaluate !== "function") throw new Error("Component evaluators must be functions.");
  if (registration.evaluateState !== undefined && typeof registration.evaluateState !== "function") throw new Error("State evaluators must be functions.");
  definitions[registration.type] = { ...existing, ...registration };
  return definitions[registration.type];
}

export function initialState(type, configuration = {}) {
  if (type.toLowerCase().includes("counter")) return { value: type === "ringCounter4" ? 1 : 0, lastClock: 0, modulo: Number(configuration.modulo) || (type === "moduloCounter4" ? 10 : 16) };
  if (["siso4", "sipo4", "piso4", "pipo4"].includes(type)) return { value: 0, lastClock: 0, width: Number(configuration.width) || 4 };
  return { q: 0, lastClock: 0, master: 0 };
}

export function categoryFor(type) {
  if (["switch", "clock", "led", "output", "const0", "const1"].includes(type)) return "Inputs / outputs";
  if (["and", "or", "not", "nand", "nor", "xor", "xnor"].includes(type)) return "Basic logic";
  if (["halfAdder", "fullAdder", "halfSubtractor", "fullSubtractor"].includes(type)) return "Arithmetic";
  if (type.startsWith("mux") || type.startsWith("demux")) return "Data routing";
  if (type.startsWith("decoder") || type.startsWith("encoder") || type.startsWith("priority")) return "Encoders / decoders";
  if (type.toLowerCase().includes("parity")) return "Parity";
  if (["siso4", "sipo4", "piso4", "pipo4"].includes(type)) return "Registers";
  return "Sequential";
}