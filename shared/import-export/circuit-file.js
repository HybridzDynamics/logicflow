export const LOGICFLOW_FILE_EXTENSION = ".logicflow";
export const LOGICFLOW_MIME_TYPE = "application/vnd.logicflow.circuit+json";

const FILE_FORMAT = "logicflow-circuit";
const FILE_VERSION = 1;
const MAX_FILE_LENGTH = 5 * 1024 * 1024;
const MAX_NAME_LENGTH = 80;

export function exportCircuit(name, circuit) {
  return JSON.stringify({
    format: FILE_FORMAT,
    formatVersion: FILE_VERSION,
    name,
    circuit: circuit.serialize()
  }, null, 2);
}

export function parseCircuitFile(source) {
  if (typeof source !== "string") throw new Error("Circuit file must contain text.");
  if (source.length > MAX_FILE_LENGTH) throw new Error("Circuit file is too large to import.");
  let data;
  try {
    data = JSON.parse(source);
  } catch {
    throw new Error("File is not valid JSON. Choose a .logicflow file or a legacy circuit .json file.");
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Circuit file must contain a JSON object.");
  if (data.format === FILE_FORMAT) {
    if (data.formatVersion !== FILE_VERSION) throw new Error(`Unsupported LogicFlow file version: ${data.formatVersion}.`);
    if (!data.circuit || typeof data.circuit !== "object" || Array.isArray(data.circuit)) throw new Error("LogicFlow file is missing its circuit data.");
    return { ...data.circuit, name: typeof data.name === "string" ? data.name.slice(0, MAX_NAME_LENGTH) : "" };
  }
  if (Array.isArray(data.components) && Array.isArray(data.wires)) return data;
  throw new Error("Unrecognized circuit file. Choose a .logicflow file or a legacy circuit .json file.");
}

export function parseCircuitJSON(source) { return parseCircuitFile(source); }