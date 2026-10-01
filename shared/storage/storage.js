const STORAGE_KEY = "logicflow.circuits.v1";

export function listCircuits() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}

export function saveCircuit(name, circuit) {
  const circuits = listCircuits();
  circuits[name] = circuit.serialize();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(circuits));
}

export function loadCircuit(name) {
  return listCircuits()[name] || null;
}
export function renameCircuit(oldName, newName) {
  const name = String(newName).trim();
  const circuits = listCircuits();
  if (!circuits[oldName]) throw new Error("Saved circuit no longer exists.");
  if (!name) throw new Error("Circuit name cannot be empty.");
  if (name !== oldName && circuits[name]) throw new Error("A circuit with that name already exists.");
  circuits[name] = circuits[oldName];
  delete circuits[oldName];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(circuits));
  return name;
}

export function deleteCircuit(name) {
  const circuits = listCircuits();
  if (!Object.hasOwn(circuits, name)) return false;
  delete circuits[name];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(circuits));
  return true;
}
