# Architecture

LogicFlow is a static ES-module application. `index.html` loads `app/bootstrap.js`, which imports `app/app.js`; the application connects the view to the graph, simulation, registry, clock, storage, and history modules.

## Circuit Model

`Circuit` stores components and wires in maps. A component contains an ID, type, display name, position, rotation, configuration, input/output pin arrays, and optional state. A wire refers to a source component/output index and target component/input index. Each input accepts at most one wire. The current signal model is binary and single-width; bus widths are not implemented.

## Ownership Boundaries

- `shared/components/registry.js` is the source of supported component types and pin metadata.
- `team/Mohammad-Arsh/circuit-model/` owns graph mutations and circuit serialization.
- `team/Mohit-Pangti/` owns combinational evaluators.
- `team/Madhav-Gupta/` owns stored-state transitions and sequential test logic.
- `team/Mohammad-Arsh/simulation-engine/` propagates signals and dispatches sequential evaluation.
- `team/Gunish-Singh/workspace/` renders graph state to SVG and handles view geometry.
- `shared/storage/`, `shared/history/`, and `shared/import-export/` provide cross-feature infrastructure.
- `app/` composes modules and owns top-level user actions.

No module is loaded dynamically from imported circuit data. JSON imports are parsed and validated as data; they are never evaluated as JavaScript.

## Current Boundaries and Limits

Modules use static relative ES imports; there is no plugin discovery or circular dependency. Component placement and wires are rendered from graph state. Multi-select, group movement, copy/paste, duplicate, bulk delete, middle-button pan, and saved-circuit rename/delete are implemented. Undo/redo snapshots cover graph edits, switch changes, and component naming, but not reset or every configuration action. Rotation, binary bus components, configurable widths, and the complete example library are not implemented.