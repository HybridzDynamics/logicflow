const addSwitch = (circuit, name, x, y, value = 0) => {
  const component = circuit.add("switch", x, y, { value });
  component.name = name;
  return component;
};

const addLed = (circuit, name, x, y) => {
  const component = circuit.add("led", x, y);
  component.name = name;
  return component;
};

function buildAnd(circuit) {
  const a = addSwitch(circuit, "A", 150, 220, 1);
  const b = addSwitch(circuit, "B", 150, 370, 1);
  const gate = circuit.add("and", 470, 290);
  const led = addLed(circuit, "AND output", 780, 290);
  circuit.connect(a.id, 0, gate.id, 0); circuit.connect(b.id, 0, gate.id, 1); circuit.connect(gate.id, 0, led.id, 0);
  return { selectedId: gate.id };
}

function buildSingleGate(circuit, type, values) {
  const a = addSwitch(circuit, "A", 150, 220, values[0]);
  const b = addSwitch(circuit, "B", 150, 370, values[1]);
  const gate = circuit.add(type, 470, 290);
  const led = addLed(circuit, `${type.toUpperCase()} output`, 780, 290);
  circuit.connect(a.id, 0, gate.id, 0); circuit.connect(b.id, 0, gate.id, 1); circuit.connect(gate.id, 0, led.id, 0);
  return { selectedId: gate.id };
}

function buildHalfAdder(circuit) {
  const a = addSwitch(circuit, "A", 120, 210, 1);
  const b = addSwitch(circuit, "B", 120, 390, 1);
  const xor = circuit.add("xor", 410, 210);
  const and = circuit.add("and", 410, 390);
  const sum = addLed(circuit, "SUM", 760, 210);
  const carry = addLed(circuit, "CARRY", 760, 390);
  circuit.connect(a.id, 0, xor.id, 0); circuit.connect(b.id, 0, xor.id, 1);
  circuit.connect(a.id, 0, and.id, 0); circuit.connect(b.id, 0, and.id, 1);
  circuit.connect(xor.id, 0, sum.id, 0); circuit.connect(and.id, 0, carry.id, 0);
  return { selectedId: xor.id };
}

function buildHalfSubtractor(circuit) {
  const a = addSwitch(circuit, "A", 120, 230, 0);
  const b = addSwitch(circuit, "B", 120, 410, 1);
  const difference = circuit.add("xor", 420, 230);
  const invertA = circuit.add("not", 420, 410);
  const borrowGate = circuit.add("and", 650, 410);
  const differenceLed = addLed(circuit, "DIFFERENCE", 900, 230);
  const borrowLed = addLed(circuit, "BORROW", 900, 410);
  circuit.connect(a.id, 0, difference.id, 0); circuit.connect(b.id, 0, difference.id, 1);
  circuit.connect(a.id, 0, invertA.id, 0); circuit.connect(invertA.id, 0, borrowGate.id, 0); circuit.connect(b.id, 0, borrowGate.id, 1);
  circuit.connect(difference.id, 0, differenceLed.id, 0); circuit.connect(borrowGate.id, 0, borrowLed.id, 0);
  return { selectedId: difference.id };
}

function buildFullAdder(circuit) {
  const a = addSwitch(circuit, "A", 100, 170, 1);
  const b = addSwitch(circuit, "B", 100, 330, 0);
  const cin = addSwitch(circuit, "Cin", 100, 490, 1);
  const xor1 = circuit.add("xor", 380, 210);
  const xor2 = circuit.add("xor", 650, 170);
  const and1 = circuit.add("and", 380, 390);
  const and2 = circuit.add("and", 650, 390);
  const or = circuit.add("or", 900, 350);
  const sum = addLed(circuit, "SUM", 1130, 190);
  const carry = addLed(circuit, "CARRY", 1130, 410);
  circuit.connect(a.id, 0, xor1.id, 0); circuit.connect(b.id, 0, xor1.id, 1);
  circuit.connect(a.id, 0, and1.id, 0); circuit.connect(b.id, 0, and1.id, 1);
  circuit.connect(xor1.id, 0, xor2.id, 0); circuit.connect(cin.id, 0, xor2.id, 1);
  circuit.connect(xor1.id, 0, and2.id, 0); circuit.connect(cin.id, 0, and2.id, 1);
  circuit.connect(and1.id, 0, or.id, 0); circuit.connect(and2.id, 0, or.id, 1);
  circuit.connect(xor2.id, 0, sum.id, 0); circuit.connect(or.id, 0, carry.id, 0);
  return { selectedId: xor2.id };
}

function buildFullSubtractor(circuit) {
  const a = addSwitch(circuit, "A", 100, 150, 0);
  const b = addSwitch(circuit, "B", 100, 320, 1);
  const bin = addSwitch(circuit, "Bin", 100, 490, 1);
  const xorAB = circuit.add("xor", 370, 200);
  const xorDifference = circuit.add("xor", 620, 160);
  const invertA = circuit.add("not", 370, 430);
  const borrowA = circuit.add("and", 620, 390);
  const invertXor = circuit.add("not", 620, 510);
  const borrowBin = circuit.add("and", 850, 480);
  const borrowOr = circuit.add("or", 1080, 400);
  const differenceLed = addLed(circuit, "DIFFERENCE", 1320, 170);
  const borrowLed = addLed(circuit, "BORROW", 1320, 430);
  circuit.connect(a.id, 0, xorAB.id, 0); circuit.connect(b.id, 0, xorAB.id, 1);
  circuit.connect(xorAB.id, 0, xorDifference.id, 0); circuit.connect(bin.id, 0, xorDifference.id, 1);
  circuit.connect(a.id, 0, invertA.id, 0); circuit.connect(invertA.id, 0, borrowA.id, 0); circuit.connect(b.id, 0, borrowA.id, 1);
  circuit.connect(xorAB.id, 0, invertXor.id, 0); circuit.connect(invertXor.id, 0, borrowBin.id, 0); circuit.connect(bin.id, 0, borrowBin.id, 1);
  circuit.connect(borrowA.id, 0, borrowOr.id, 0); circuit.connect(borrowBin.id, 0, borrowOr.id, 1);
  circuit.connect(xorDifference.id, 0, differenceLed.id, 0); circuit.connect(borrowOr.id, 0, borrowLed.id, 0);
  return { selectedId: xorDifference.id };
}

function buildMux(circuit) {
  const a = addSwitch(circuit, "D0", 120, 180, 1);
  const b = addSwitch(circuit, "D1", 120, 350, 0);
  const select = addSwitch(circuit, "S", 120, 520, 0);
  const invert = circuit.add("not", 390, 500);
  const and0 = circuit.add("and", 560, 220);
  const and1 = circuit.add("and", 560, 410);
  const or = circuit.add("or", 830, 310);
  const led = addLed(circuit, "MUX output", 1080, 310);
  circuit.connect(select.id, 0, invert.id, 0);
  circuit.connect(a.id, 0, and0.id, 0); circuit.connect(invert.id, 0, and0.id, 1);
  circuit.connect(b.id, 0, and1.id, 0); circuit.connect(select.id, 0, and1.id, 1);
  circuit.connect(and0.id, 0, or.id, 0); circuit.connect(and1.id, 0, or.id, 1); circuit.connect(or.id, 0, led.id, 0);
  return { selectedId: or.id };
}

function buildMux4(circuit) {
  const values = [1, 0, 1, 0];
  const inputs = values.map((value, index) => addSwitch(circuit, `D${index}`, 100, 150 + index * 105, value));
  const select0 = addSwitch(circuit, "S0", 100, 590, 0);
  const select1 = addSwitch(circuit, "S1", 100, 690, 1);
  const mux = circuit.add("mux4", 470, 350);
  const led = addLed(circuit, "MUX output", 850, 350);
  inputs.forEach((input, index) => circuit.connect(input.id, 0, mux.id, index));
  circuit.connect(select0.id, 0, mux.id, 4); circuit.connect(select1.id, 0, mux.id, 5); circuit.connect(mux.id, 0, led.id, 0);
  return { selectedId: mux.id };
}

function buildDecoder(circuit) {
  const a0 = addSwitch(circuit, "A0", 120, 190, 1);
  const a1 = addSwitch(circuit, "A1", 120, 340, 0);
  const enable = circuit.add("const1", 120, 490);
  const decoder = circuit.add("decoder2", 470, 310);
  circuit.connect(a0.id, 0, decoder.id, 0); circuit.connect(a1.id, 0, decoder.id, 1); circuit.connect(enable.id, 0, decoder.id, 2);
  decoder.outputs.forEach((pin, index) => {
    const led = addLed(circuit, `Y${index}`, 820, 190 + index * 110);
    circuit.connect(decoder.id, index, led.id, 0);
  });
  return { selectedId: decoder.id };
}

function buildParity(circuit) {
  const values = [1, 0, 1, 1];
  const inputs = values.map((value, index) => addSwitch(circuit, String.fromCharCode(65 + index), 120, 180 + index * 125, value));
  const parity = circuit.add("evenParity", 490, 330);
  const led = addLed(circuit, "EVEN PARITY", 850, 330);
  inputs.forEach((input, index) => circuit.connect(input.id, 0, parity.id, index));
  circuit.connect(parity.id, 0, led.id, 0);
  return { selectedId: parity.id };
}

function buildEncoder(circuit) {
  const values = [0, 0, 1, 0];
  const inputs = values.map((value, index) => addSwitch(circuit, `D${index}`, 120, 180 + index * 125, value));
  const encoder = circuit.add("encoder4", 490, 330);
  inputs.forEach((input, index) => circuit.connect(input.id, 0, encoder.id, index));
  encoder.outputs.forEach((pin, index) => {
    const led = addLed(circuit, pin.name, 850, 250 + index * 110);
    circuit.connect(encoder.id, index, led.id, 0);
  });
  return { selectedId: encoder.id };
}

function buildDFlipFlop(circuit) {
  const data = addSwitch(circuit, "D", 150, 220, 1);
  const clock = circuit.add("clock", 150, 400);
  const flipFlop = circuit.add("dff", 500, 300);
  const q = addLed(circuit, "Q", 850, 260);
  const qBar = addLed(circuit, "Q bar", 850, 390);
  circuit.connect(data.id, 0, flipFlop.id, 0); circuit.connect(clock.id, 0, flipFlop.id, 1);
  circuit.connect(flipFlop.id, 0, q.id, 0); circuit.connect(flipFlop.id, 1, qBar.id, 0);
  return { selectedId: flipFlop.id };
}

function buildCounter(circuit) {
  const clock = circuit.add("clock", 120, 220);
  const reset = addSwitch(circuit, "RESET", 120, 390, 0);
  const counter = circuit.add("counter4", 490, 300);
  circuit.connect(clock.id, 0, counter.id, 0); circuit.connect(reset.id, 0, counter.id, 1);
  counter.outputs.forEach((pin, index) => {
    const led = addLed(circuit, pin.name, 850, 210 + index * 105);
    circuit.connect(counter.id, index, led.id, 0);
  });
  return { selectedId: counter.id };
}

function buildPipoRegister(circuit) {
  const bits = [0, 1, 0, 1];
  const data = bits.map((value, index) => addSwitch(circuit, `D${index}`, 110, 120 + index * 110, value));
  const load = addSwitch(circuit, "LOAD", 110, 590, 1);
  const reset = addSwitch(circuit, "RESET", 110, 660, 0);
  const clock = circuit.add("clock", 110, 730);
  const register = circuit.add("pipo4", 470, 330);
  data.forEach((input, index) => circuit.connect(input.id, 0, register.id, index));
  circuit.connect(load.id, 0, register.id, 4); circuit.connect(clock.id, 0, register.id, 5); circuit.connect(reset.id, 0, register.id, 6);
  register.outputs.forEach((pin, index) => {
    const led = addLed(circuit, pin.name, 850, 220 + index * 105);
    circuit.connect(register.id, index, led.id, 0);
  });
  return { selectedId: register.id };
}

function buildTrafficLight(circuit) {
  const clock = circuit.add("clock", 110, 230);
  const reset = addSwitch(circuit, "RESET", 110, 390, 0);
  const counter = circuit.add("moduloCounter4", 430, 320, { modulo: 3 });
  const greenGate = circuit.add("nor", 700, 190);
  const invertQ1 = circuit.add("not", 690, 350);
  const yellowGate = circuit.add("and", 900, 320);
  const invertQ0 = circuit.add("not", 690, 500);
  const redGate = circuit.add("and", 900, 490);
  const green = addLed(circuit, "GREEN", 1160, 190);
  const yellow = addLed(circuit, "YELLOW", 1160, 340);
  const red = addLed(circuit, "RED", 1160, 490);
  circuit.connect(clock.id, 0, counter.id, 0); circuit.connect(reset.id, 0, counter.id, 1);
  circuit.connect(counter.id, 0, greenGate.id, 0); circuit.connect(counter.id, 1, greenGate.id, 1);
  circuit.connect(greenGate.id, 0, green.id, 0);
  circuit.connect(counter.id, 1, invertQ1.id, 0); circuit.connect(invertQ1.id, 0, yellowGate.id, 0); circuit.connect(counter.id, 0, yellowGate.id, 1);
  circuit.connect(yellowGate.id, 0, yellow.id, 0);
  circuit.connect(counter.id, 0, invertQ0.id, 0); circuit.connect(counter.id, 1, redGate.id, 0); circuit.connect(invertQ0.id, 0, redGate.id, 1);
  circuit.connect(redGate.id, 0, red.id, 0);
  return { selectedId: counter.id };
}

function buildParityChecker(circuit) {
  const bits = [1, 0, 1, 1, 1];
  const names = ["A", "B", "C", "D", "P"];
  const inputs = bits.map((value, index) => addSwitch(circuit, names[index], 110, 130 + index * 115, value));
  const checker = circuit.add("evenParityCheck", 500, 340);
  const pass = addLed(circuit, "PASS", 870, 340);
  inputs.forEach((input, index) => circuit.connect(input.id, 0, checker.id, index));
  circuit.connect(checker.id, 0, pass.id, 0);
  return { selectedId: checker.id };
}

function buildRippleAdder(circuit) {
  const valueA = 5;
  const valueB = 3;
  const switchesA = [];
  const switchesB = [];
  for (let bit = 0; bit < 4; bit += 1) {
    switchesA.push(addSwitch(circuit, `A${bit}`, 100, 110 + bit * 130, (valueA >> bit) & 1));
    switchesB.push(addSwitch(circuit, `B${bit}`, 100, 170 + bit * 130, (valueB >> bit) & 1));
  }
  const carryIn = circuit.add("const0", 100, 640);
  const adders = Array.from({ length: 4 }, (_, bit) => circuit.add("fullAdder", 430, 90 + bit * 145));
  const sumDisplay = circuit.add("binaryDisplay", 850, 330);
  const carryLed = addLed(circuit, "Cout", 850, 540);
  adders.forEach((adder, bit) => {
    circuit.connect(switchesA[bit].id, 0, adder.id, 0);
    circuit.connect(switchesB[bit].id, 0, adder.id, 1);
    circuit.connect(bit ? adders[bit - 1].id : carryIn.id, bit ? 1 : 0, adder.id, 2);
    circuit.connect(adder.id, 0, sumDisplay.id, 3 - bit);
  });
  circuit.connect(adders[3].id, 1, carryLed.id, 0);
  return { selectedId: adders[0].id };
}

function buildRippleSubtractor(circuit) {
  const valueA = 9;
  const valueB = 5;
  const inputsA = [];
  const inputsB = [];
  for (let bit = 0; bit < 4; bit += 1) {
    inputsA.push(addSwitch(circuit, `A${bit}`, 100, 110 + bit * 130, (valueA >> bit) & 1));
    inputsB.push(addSwitch(circuit, `B${bit}`, 100, 170 + bit * 130, (valueB >> bit) & 1));
  }
  const borrowIn = circuit.add("const0", 100, 640);
  const subtractors = Array.from({ length: 4 }, (_, bit) => circuit.add("fullSubtractor", 430, 90 + bit * 145));
  const difference = circuit.add("binaryDisplay", 850, 330);
  const borrowOut = addLed(circuit, "BORROW", 850, 540);
  subtractors.forEach((subtractor, bit) => {
    circuit.connect(inputsA[bit].id, 0, subtractor.id, 0);
    circuit.connect(inputsB[bit].id, 0, subtractor.id, 1);
    circuit.connect(bit ? subtractors[bit - 1].id : borrowIn.id, bit ? 1 : 0, subtractor.id, 2);
    circuit.connect(subtractor.id, 0, difference.id, 3 - bit);
  });
  circuit.connect(subtractors[3].id, 1, borrowOut.id, 0);
  return { selectedId: subtractors[0].id };
}

function buildEqualityComparator(circuit) {
  const a1 = addSwitch(circuit, "A1", 100, 160, 1);
  const a0 = addSwitch(circuit, "A0", 100, 300, 0);
  const b1 = addSwitch(circuit, "B1", 100, 440, 1);
  const b0 = addSwitch(circuit, "B0", 100, 580, 0);
  const matchHigh = circuit.add("xnor", 400, 210);
  const matchLow = circuit.add("xnor", 400, 450);
  const bothMatch = circuit.add("and", 700, 330);
  const led = addLed(circuit, "A EQUALS B", 980, 330);
  circuit.connect(a1.id, 0, matchHigh.id, 0); circuit.connect(b1.id, 0, matchHigh.id, 1);
  circuit.connect(a0.id, 0, matchLow.id, 0); circuit.connect(b0.id, 0, matchLow.id, 1);
  circuit.connect(matchHigh.id, 0, bothMatch.id, 0); circuit.connect(matchLow.id, 0, bothMatch.id, 1);
  circuit.connect(bothMatch.id, 0, led.id, 0);
  return { selectedId: bothMatch.id };
}

function buildSevenSegment(circuit) {
  const bits = [1, 0, 1, 0];
  const inputs = bits.map((value, index) => addSwitch(circuit, `D${3 - index}`, 120, 170 + index * 125, value));
  const display = circuit.add("sevenSegment", 500, 320);
  inputs.forEach((input, index) => circuit.connect(input.id, 0, display.id, index));
  return { selectedId: display.id };
}

export const exampleCatalog = [
  { id: "and", name: "AND gate", description: "Two switches drive an AND gate and LED.", builder: buildAnd },
  { id: "or", name: "OR gate", description: "See OR behavior with two interactive inputs.", builder: (circuit) => buildSingleGate(circuit, "or", [1, 0]) },
  { id: "xor", name: "XOR gate", description: "A parity-style XOR gate with switch inputs.", builder: (circuit) => buildSingleGate(circuit, "xor", [1, 0]) },
  { id: "half-adder", name: "Gate-level Half Adder", description: "Build SUM with XOR and CARRY with AND.", builder: buildHalfAdder },
  { id: "half-subtractor", name: "Gate-level Half Subtractor", description: "XOR builds the difference; NOT and AND build borrow.", builder: buildHalfSubtractor },
  { id: "full-adder", name: "Gate-level Full Adder", description: "Two XOR, two AND, and one OR drive SUM and CARRY.", builder: buildFullAdder },
  { id: "full-subtractor", name: "Gate-level Full Subtractor", description: "XOR, NOT, AND, and OR gates build difference and borrow.", builder: buildFullSubtractor },
  { id: "mux", name: "Gate-level 2:1 MUX", description: "NOT, AND, AND, OR implement the select function.", builder: buildMux },
  { id: "mux4", name: "4:1 Multiplexer", description: "Four data switches and two select switches drive one output.", builder: buildMux4 },
  { id: "decoder", name: "2-to-4 Decoder", description: "Two address switches select one of four LEDs.", builder: buildDecoder },
  { id: "encoder", name: "4:2 Encoder", description: "One active input is encoded into two bits and a valid signal.", builder: buildEncoder },
  { id: "parity", name: "Even Parity Generator", description: "Four switches feed an even-parity output.", builder: buildParity },
  { id: "d-flip-flop", name: "D Flip-Flop", description: "Toggle D, then use Step for a clock edge.", builder: buildDFlipFlop },
  { id: "counter", name: "4-bit Counter", description: "Use Step to advance the counter; reset with the switch.", builder: buildCounter },
  { id: "pipo-register", name: "4-bit PIPO Register", description: "Set four data bits, then pulse the clock with LOAD enabled.", builder: buildPipoRegister },
  { id: "traffic-light", name: "Traffic-Light Sequence", description: "Step through a modulo-3 clocked green, yellow, red cycle.", builder: buildTrafficLight },
  { id: "parity-checker", name: "Even Parity Checker", description: "Verify four data bits and their parity bit.", builder: buildParityChecker },
  { id: "ripple-adder", name: "4-bit Ripple-Carry Adder", description: "Four Full Adders propagate carry into a binary display.", builder: buildRippleAdder },
  { id: "ripple-subtractor", name: "4-bit Ripple-Borrow Subtractor", description: "Four Full Subtractors propagate borrow into a binary display.", builder: buildRippleSubtractor },
  { id: "equality-comparator", name: "2-bit Equality Comparator", description: "XNOR gates compare each bit; an AND reports equality.", builder: buildEqualityComparator },
  { id: "seven-segment", name: "Seven-Segment Hex Display", description: "Four switches drive a live hexadecimal digit display.", builder: buildSevenSegment }
];

export function buildExample(circuit, exampleId) {
  const example = exampleCatalog.find((item) => item.id === exampleId);
  if (!example) throw new Error(`Unknown example circuit: ${exampleId}`);
  return { ...example.builder(circuit), name: example.name };
}

export function buildAndExample(circuit) {
  return buildExample(circuit, "and");
}