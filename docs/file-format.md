# LogicFlow Circuit Files

LogicFlow exports native circuit documents with the `.logicflow` extension. The file is UTF-8 JSON using the MIME type `application/vnd.logicflow.circuit+json`.

## Version 1 Envelope

```json
{
  "format": "logicflow-circuit",
  "formatVersion": 1,
  "name": "Example circuit",
  "circuit": {
    "version": 1,
    "components": [],
    "wires": []
  }
}
```

`formatVersion` versions the outer file envelope. `circuit.version` versions the graph data model. Components retain their type, ID, name, position, rotation, configuration, pins, and sequential state. Wires retain their source/target component IDs and pin indexes.

## Import Compatibility and Validation

The import control accepts `.logicflow` files and legacy `.json` files containing a raw circuit object with `components` and `wires` arrays. Native files must use the supported format marker and version. The circuit model then validates component types, IDs, pins, coordinates, and wire endpoints. Unsupported or malformed documents are rejected with a user-facing message.

Imported files are parsed as data only. LogicFlow does not execute scripts or expressions from a circuit file. When adding a future format version, retain a clear migration or rejection path rather than silently interpreting unknown fields.