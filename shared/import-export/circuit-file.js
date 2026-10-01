export const LOGICFLOW_FILE_EXTENSION = ".logicflow";
export const LOGICFLOW_MIME_TYPE = "application/vnd.logicflow.circuit+json";

const FILE_FORMAT = "logicflow-circuit";
const FILE_VERSION = 1;

export function exportCircuit(name, circuit) {
  return JSON.stringify({
    format: FILE_FORMAT,
    formatVersion: FILE_VERSION,
    name,
    circuit: circuit.serialize()
  }, null, 2);
}

export function parseCircuitFile(source) {
  const data = JSON.parse(source);
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Circuit file must contain a JSON object.");
  if (data.format === FILE_FORMAT) {
    if (data.formatVersion !== FILE_VERSION) throw new Error(`Unsupported LogicFlow file version: ${data.formatVersion}.`);
    if (!data.circuit || typeof data.circuit !== "object" || Array.isArray(data.circuit)) throw new Error("LogicFlow file is missing its circuit data.");
    return { ...data.circuit, name: typeof data.name === "string" ? data.name : "" };
  }
  if (Array.isArray(data.components) && Array.isArray(data.wires)) return data;
  throw new Error("Unrecognized circuit file. Choose a .logicflow file or a legacy circuit .json file.");
}

export function parseCircuitJSON(source) { return parseCircuitFile(source); }