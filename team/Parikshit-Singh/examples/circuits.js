export function buildAndExample(circuit) {
  const switchA = circuit.add("switch", 250, 230, { value: 1 });
  const switchB = circuit.add("switch", 250, 390, { value: 1 });
  const gate = circuit.add("and", 520, 310);
  const led = circuit.add("led", 820, 310);
  circuit.connect(switchA.id, 0, gate.id, 0);
  circuit.connect(switchB.id, 0, gate.id, 1);
  circuit.connect(gate.id, 0, led.id, 0);
  return { selectedId: gate.id, name: "AND gate example" };
}