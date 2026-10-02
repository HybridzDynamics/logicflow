import { Circuit } from "../../Mohammad-Arsh/circuit-model/circuit.js";
import { Simulation } from "../../Mohammad-Arsh/simulation-engine/simulation.js";
import { evaluateCombinational } from "../../Mohit-Pangti/combinational/evaluate.js";
import { buildExample, exampleCatalog } from "../../Parikshit-Singh/examples/circuits.js";
import { evaluateSequential } from "../flip-flops/sequential.js";
import { loadCircuit, saveCircuit, renameCircuit, deleteCircuit } from "../../../shared/storage/storage.js";
import { exportCircuit, parseCircuitFile, LOGICFLOW_FILE_EXTENSION } from "../../../shared/import-export/circuit-file.js";

export function runLogicTests() {
  const failures = [];
  let checks = 0;
  const assert = (name, actual, expected) => {
    checks += 1;
    if (JSON.stringify(actual) !== JSON.stringify(expected)) failures.push(`${name}: got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
  };
  const evaluate = (type, values) => evaluateCombinational({ type, configuration: {}, inputs: values.map((value) => ({ value })), outputs: [] });
  const gateFunctions = {
    and: (a, b) => a & b,
    or: (a, b) => a | b,
    nand: (a, b) => 1 - (a & b),
    nor: (a, b) => 1 - (a | b),
    xor: (a, b) => a ^ b,
    xnor: (a, b) => 1 - (a ^ b)
  };
  for (const [type, fn] of Object.entries(gateFunctions)) {
    for (let a = 0; a <= 1; a += 1) for (let b = 0; b <= 1; b += 1) assert(`${type} ${a}${b}`, evaluate(type, [a, b]), [fn(a, b)]);
  }
  for (let a = 0; a <= 1; a += 1) assert(`not ${a}`, evaluate("not", [a]), [1 - a]);

  for (let a = 0; a <= 1; a += 1) for (let b = 0; b <= 1; b += 1) {
    assert(`half adder ${a}${b}`, evaluate("halfAdder", [a, b]), [a ^ b, a & b]);
    assert(`half subtractor ${a}${b}`, evaluate("halfSubtractor", [a, b]), [a ^ b, (1 - a) & b]);
    for (let carry = 0; carry <= 1; carry += 1) {
      assert(`full adder ${a}${b}${carry}`, evaluate("fullAdder", [a, b, carry]), [a ^ b ^ carry, (a & b) | (a & carry) | (b & carry)]);
      assert(`full subtractor ${a}${b}${carry}`, evaluate("fullSubtractor", [a, b, carry]), [a ^ b ^ carry, ((1 - a) & b) | ((1 - (a ^ b)) & carry)]);
    }
  }

  for (const size of [2, 4, 8, 16]) {
    const selectBits = Math.log2(size);
    for (let selected = 0; selected < size; selected += 1) {
      const data = Array(size).fill(0); data[selected] = 1;
      const select = Array.from({ length: selectBits }, (_, bit) => (selected >> bit) & 1);
      assert(`mux ${size} select ${selected}`, evaluate(`mux${size}`, [...data, ...select]), [1]);
      assert(`demux ${size} select ${selected}`, evaluate(`demux${size}`, [1, ...select]), data);
    }
  }
  for (const bits of [2, 3, 4]) {
    for (let address = 0; address < 1 << bits; address += 1) {
      const value = Array.from({ length: bits }, (_, bit) => (address >> bit) & 1);
      assert(`decoder ${bits} address ${address}`, evaluate(`decoder${bits}`, [...value, 1]), Array.from({ length: 1 << bits }, (_, index) => Number(index === address)));
      assert(`decoder ${bits} disabled`, evaluate(`decoder${bits}`, [...value, 0]), Array(1 << bits).fill(0));
    }
  }
  for (const size of [4, 8]) {
    for (let active = 0; active < size; active += 1) {
      const values = Array.from({ length: size }, (_, index) => Number(index === active));
      const expected = [...Array.from({ length: Math.log2(size) }, (_, bit) => (active >> bit) & 1), 1];
      assert(`encoder ${size} input ${active}`, evaluate(`encoder${size}`, values), expected);
      assert(`priority encoder ${size} input ${active}`, evaluate(`priorityEncoder${size}`, values), expected);
    }
  }
  for (let data = 0; data < 16; data += 1) {
    const bits = Array.from({ length: 4 }, (_, bit) => (data >> bit) & 1);
    const even = bits.reduce((result, value) => result ^ value, 0);
    assert(`even parity ${data}`, evaluate("evenParity", bits), [even]);
    assert(`odd parity ${data}`, evaluate("oddParity", bits), [1 - even]);
    assert(`even parity check ${data}`, evaluate("evenParityCheck", [...bits, even]), [1]);
    assert(`odd parity check ${data}`, evaluate("oddParityCheck", [...bits, 1 - even]), [1]);
  }

  const make = (type) => new Circuit().add(type);
  const tick = (component, clockIndex) => {
    component.inputs[clockIndex].value = 0; evaluateSequential(component, true);
    component.inputs[clockIndex].value = 1; evaluateSequential(component, true);
  };
  const dff = make("dff"); dff.inputs[0].value = 1; tick(dff, 1); assert("D flip-flop captures one", [dff.state.q], [1]);
  dff.inputs[0].value = 0; tick(dff, 1); assert("D flip-flop captures zero", [dff.state.q], [0]);
  const jk = make("jkff"); jk.inputs[0].value = 1; jk.inputs[1].value = 1; tick(jk, 2); assert("JK toggles set", [jk.state.q], [1]); tick(jk, 2); assert("JK toggles reset", [jk.state.q], [0]);
  const tff = make("tff"); tff.inputs[0].value = 1; tick(tff, 1); tick(tff, 1); assert("T toggles twice", [tff.state.q], [0]);
  const sr = make("sr"); sr.inputs[0].value = 1; tick(sr, 2); assert("SR sets", [sr.state.q], [1]);
  sr.inputs[0].value = 1; sr.inputs[1].value = 1; tick(sr, 2); assert("SR invalid state reported", [Number(sr.state.invalid)], [1]);
  const masterSlave = make("masterSlave"); masterSlave.inputs[0].value = 1; masterSlave.inputs[1].value = 0; evaluateSequential(masterSlave, true); masterSlave.inputs[1].value = 1; evaluateSequential(masterSlave, true); assert("master-slave transfers master on rising edge", [masterSlave.state.q], [1]);
  const modulo = make("moduloCounter4"); for (let cycle = 0; cycle < 11; cycle += 1) tick(modulo, 0); assert("modulo-10 counter wraps", [modulo.state.value], [1]);
  const ring = make("ringCounter4"); tick(ring, 0); assert("ring counter rotates bit", [ring.state.value], [2]);
  const johnson = make("johnsonCounter4"); tick(johnson, 0); assert("Johnson counter feeds complemented bit", [johnson.state.value], [1]);
  const sipo = make("sipo4"); sipo.inputs[0].value = 1; tick(sipo, 1); assert("SIPO shifts serial input", [sipo.state.value], [1]);

  const saved = new Circuit();
  const source = saved.add("switch", 110, 150, { value: 1 });
  const sink = saved.add("led", 330, 150);
  saved.connect(source.id, 0, sink.id, 0);
  const restored = new Circuit(saved.serialize());
  assert("circuit JSON round-trip components", [restored.components.size], [2]);
  assert("circuit JSON round-trip wires", [restored.wires.size], [1]);
  const nativeFile = exportCircuit("Native file test", saved);
  const nativeData = JSON.parse(nativeFile);
  assert("native format marker", [nativeData.format, nativeData.formatVersion], ["logicflow-circuit", 1]);
  assert("native file extension", [LOGICFLOW_FILE_EXTENSION], [".logicflow"]);
  const nativeCircuit = new Circuit(parseCircuitFile(nativeFile));
  assert("native file circuit round-trip", [nativeCircuit.components.size, nativeCircuit.wires.size], [2, 1]);
  assert("legacy JSON circuit import", [new Circuit(parseCircuitFile(JSON.stringify(saved.serialize()))).components.size], [2]);
  let unsupportedFileVersionRejected = false;
  try { parseCircuitFile(JSON.stringify({ ...nativeData, formatVersion: 99 })); } catch { unsupportedFileVersionRejected = true; }
  assert("unsupported native file version rejected", [Number(unsupportedFileVersionRejected)], [1]);
  let invalidDocumentRejected = false;
  try { new Circuit({ version: 9, components: [], wires: [] }); } catch { invalidDocumentRejected = true; }
  assert("unsupported circuit version rejected", [Number(invalidDocumentRejected)], [1]);

  const exampleLedOutputs = {
    and: [1], or: [1], xor: [1], "half-adder": [0, 1], "half-subtractor": [1, 1],
    "full-adder": [0, 1], "full-subtractor": [0, 1], mux: [1], mux4: [1], decoder: [0, 1, 0, 0],
    encoder: [0, 1, 1], parity: [1], "d-flip-flop": [0, 1], counter: [0, 0, 0, 0], "pipo-register": [0, 0, 0, 0], "traffic-light": [1, 0, 0], "parity-checker": [1], "ripple-adder": [0],
    "ripple-subtractor": [0], "equality-comparator": [1], "seven-segment": []
  };
  for (const example of exampleCatalog) {
    const circuit = new Circuit();
    buildExample(circuit, example.id);
    assert(`${example.id} example stabilizes`, [Number(new Simulation(circuit).propagate())], [1]);
    assert(`${example.id} example has components`, [Number(circuit.components.size > 0)], [1]);
    const ledOutputs = [...circuit.components.values()].filter((component) => component.type === "led").map((component) => component.inputs[0].value);
    assert(`${example.id} example outputs`, ledOutputs, exampleLedOutputs[example.id]);
  }
  const rippleExample = new Circuit();
  buildExample(rippleExample, "ripple-adder");
  new Simulation(rippleExample).propagate();
  const rippleDisplay = [...rippleExample.components.values()].find((component) => component.type === "binaryDisplay");
  assert("ripple adder example calculates 5 + 3", [rippleDisplay.inputs.map((pin) => pin.value).join("")], ["1000"]);
  const subtractorExample = new Circuit();
  buildExample(subtractorExample, "ripple-subtractor");
  new Simulation(subtractorExample).propagate();
  const subtractorDisplay = [...subtractorExample.components.values()].find((component) => component.type === "binaryDisplay");
  assert("ripple subtractor example calculates 9 - 5", [subtractorDisplay.inputs.map((pin) => pin.value).join("")], ["0100"]);
  const segmentExample = new Circuit();
  buildExample(segmentExample, "seven-segment");
  new Simulation(segmentExample).propagate();
  const segmentDisplay = [...segmentExample.components.values()].find((component) => component.type === "sevenSegment");
  assert("seven-segment example receives hex A", [segmentDisplay.inputs.map((pin) => pin.value).join("")], ["1010"]);
  const counterExample = new Circuit();
  buildExample(counterExample, "counter");
  const counterSimulation = new Simulation(counterExample);
  counterSimulation.propagate();
  [...counterExample.components.values()].find((component) => component.type === "clock").configuration.value = 1;
  counterSimulation.stepClock();
  const counterBits = [...counterExample.components.values()].filter((component) => component.type === "led").map((component) => component.inputs[0].value);
  assert("counter example advances on clock step", counterBits, [1, 0, 0, 0]);
  const registerExample = new Circuit();
  buildExample(registerExample, "pipo-register");
  const registerSimulation = new Simulation(registerExample);
  registerSimulation.propagate();
  [...registerExample.components.values()].find((component) => component.type === "clock").configuration.value = 1;
  registerSimulation.stepClock();
  const registerBits = [...registerExample.components.values()].filter((component) => component.type === "led").map((component) => component.inputs[0].value);
  assert("PIPO example loads data on clock edge", registerBits, [0, 1, 0, 1]);
  const trafficExample = new Circuit();
  buildExample(trafficExample, "traffic-light");
  const trafficSimulation = new Simulation(trafficExample);
  trafficSimulation.propagate();
  const trafficClock = [...trafficExample.components.values()].find((component) => component.type === "clock");
  const trafficLights = () => [...trafficExample.components.values()].filter((component) => component.type === "led").map((component) => component.inputs[0].value);
  assert("traffic light starts green", trafficLights(), [1, 0, 0]);
  trafficClock.configuration.value = 1; trafficSimulation.stepClock();
  assert("traffic light advances to yellow", trafficLights(), [0, 1, 0]);
  trafficClock.configuration.value = 0; trafficSimulation.stepClock(); trafficClock.configuration.value = 1; trafficSimulation.stepClock();
  assert("traffic light advances to red", trafficLights(), [0, 0, 1]);
  trafficClock.configuration.value = 0; trafficSimulation.stepClock(); trafficClock.configuration.value = 1; trafficSimulation.stepClock();
  assert("traffic light returns to green", trafficLights(), [1, 0, 0]);

  const storageKey = "logicflow.circuits.v1";
  const previousStorage = localStorage.getItem(storageKey);
  try {
    localStorage.removeItem(storageKey);
    saveCircuit("logicflow-test", saved);
    assert("save/load circuit", [loadCircuit("logicflow-test")?.components.length], [2]);
    renameCircuit("logicflow-test", "logicflow-renamed-test");
    assert("rename saved circuit", [Number(Boolean(loadCircuit("logicflow-renamed-test")))], [1]);
    assert("rename removes prior key", [Number(Boolean(loadCircuit("logicflow-test")))], [0]);
    deleteCircuit("logicflow-renamed-test");
    assert("delete saved circuit", [Number(Boolean(loadCircuit("logicflow-renamed-test")))], [0]);
  } catch (error) { failures.push(`storage operations: ${error.message}`); checks += 1; }
  finally {
    if (previousStorage === null) localStorage.removeItem(storageKey);
    else localStorage.setItem(storageKey, previousStorage);
  }

  return { checks, failures };
}