const STORAGE_KEY = "logicflow.circuits.v1";
const MAX_NAME_LENGTH = 80;
function hasControlChars(text) {
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if (code < 32 || code === 127) return true;
  }
  return false;
}

function normalizeName(name) {
  const trimmed = String(name ?? "").trim();
  if (!trimmed) throw new Error("Circuit name cannot be empty.");
  if (trimmed.length > MAX_NAME_LENGTH) throw new Error(`Circuit name must be ${MAX_NAME_LENGTH} characters or fewer.`);
  if (hasControlChars(trimmed)) throw new Error("Circuit name contains invalid characters.");
  return trimmed;
}

function readStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return Object.create(null);
    const store = Object.create(null);
    for (const [key, value] of Object.entries(parsed)) store[key] = value;
    return store;
  } catch {
    return Object.create(null);
  }
}

function writeStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    throw new Error("Could not save the circuit. Browser storage may be full or unavailable.");
  }
}

export function listCircuits() {
  return readStore();
}

export function saveCircuit(name, circuit) {
  const key = normalizeName(name);
  const circuits = readStore();
  circuits[key] = circuit.serialize();
  writeStore(circuits);
  return key;
}

export function loadCircuit(name) {
  return readStore()[String(name ?? "")] || null;
}

export function renameCircuit(oldName, newName) {
  const name = normalizeName(newName);
  const previous = String(oldName ?? "");
  const circuits = readStore();
  if (!Object.hasOwn(circuits, previous)) throw new Error("Saved circuit no longer exists.");
  if (name !== previous && Object.hasOwn(circuits, name)) throw new Error("A circuit with that name already exists.");
  circuits[name] = circuits[previous];
  delete circuits[previous];
  writeStore(circuits);
  return name;
}

export function deleteCircuit(name) {
  const circuits = readStore();
  const key = String(name ?? "");
  if (!Object.hasOwn(circuits, key)) return false;
  delete circuits[key];
  writeStore(circuits);
  return true;
}
