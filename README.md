# LogicFlow — Digital Logic Circuit Simulator

LogicFlow is a static, browser-based digital logic circuit workbench for constructing circuits and observing signal propagation. It is an academic project for BCA Digital Logics at Jaypee Institute of Information Technology, built with HTML5, CSS3, and vanilla JavaScript.

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Status: Early functional baseline](https://img.shields.io/badge/status-early%20functional%20baseline-orange.svg)

> **Development status:** The repository has a working early simulator baseline, but it is not yet the complete digital logic laboratory in the project specification. This README separates implemented behavior from unfinished work.

## Features

Implemented in the current baseline:

- Searchable component palette; add components by click or drag them to the SVG workspace.
- Select and move components, connect output pins to input pins, select and delete wires, and delete components.
- Switches, LEDs, constants, seven basic gates, half/full adders and subtractors.
- 2/4/8/16:1 multiplexers, 1/2/4/8/16 demultiplexers, 2-to-4/3-to-8/4-to-16 decoders, 4/8-input encoders, priority encoders, and even/odd parity generation/checking.
- D, SR, JK, T, and master-slave flip-flops; 4-bit SISO/SIPO/PISO/PIPO registers; 4-bit synchronous, ring, Johnson, ripple-sequence, and modulo-N counters.
- Iterative graph signal propagation, visual HIGH/LOW states, an editable AND example, combinational truth tables, run/pause/stop/step controls, reset, zoom, grid toggle, dark theme, and local save/open plus JSON import/export.
- Multi-select, group movement, copy/paste with internal wires preserved, duplicate, bulk delete, middle-button/Shift-drag pan, and basic undo/redo for component and wire edits.
- Adjustable clock frequency from 0.1 to 20 Hz.

Not implemented or not yet complete:

- Multi-bit buses and configurable register/counter widths.
- Binary input/output components with formatted multi-bit values.
- Component rotation and a larger built-in example library beyond the editable AND example.
- Complete state-table inspection, every requested example circuit, and comprehensive end-to-end tests for all UI actions.
- A delay-accurate ripple counter model; its current four-bit implementation produces the binary ripple-counter sequence without modeling intermediate stage delays.

See [docs/testing.md](docs/testing.md) and [docs/usage.md](docs/usage.md) for verification and usage details.

## Circuit File Format

Export produces a versioned `.logicflow` file using the `application/vnd.logicflow.circuit+json` MIME type. Import accepts native `.logicflow` files and legacy raw circuit `.json` files. See [docs/file-format.md](docs/file-format.md) for the schema and versioning rules.

## Technologies

- HTML5 for document structure
- CSS3 for presentation
- JavaScript ES modules for circuit data, simulation, component logic, storage, and UI integration
- SVG for interactive circuit rendering

No frontend framework, runtime dependency, backend, or external API is used.

## How the Simulator Works

The workspace stores components and wires as a graph separate from the SVG view. Each component has typed input/output pins and a registered evaluator. The simulation engine propagates pin values through wires and repeatedly evaluates combinational components until outputs stabilize or the pass limit is reached. Sequential components keep state and update on a rising clock edge. The inspector builds truth tables from the same combinational evaluator used by the simulator.

## Project Objectives

- Support learning and demonstration of digital logic concepts.
- Make gate-level circuit behavior easier to observe visually.
- Provide a way to compare circuit outputs with expected truth tables.
- Build the project using browser-native web technologies.

## Project Structure

```text
LogicFlow/
├── assets/
│   ├── icons/
│   └── images/
├── app/
│   ├── app.js          # application integration and UI events
│   └── bootstrap.js    # static application entry point
├── docs/               # architecture, behavior, file format, testing, and team docs
├── shared/
│   ├── components/     # component definitions and registry
│   ├── history/        # undo/redo snapshots
│   ├── import-export/  # JSON circuit documents
│   ├── renderer/       # shared SVG geometry
│   ├── storage/        # localStorage persistence
│   └── utilities/      # numeric validation
├── team/
│   ├── Gunish-Singh/   # UI, palette, workspace, styling
│   ├── Madhav-Gupta/   # sequential logic, tables, tests
│   ├── Mohammad-Arsh/  # circuit model, simulation, clock
│   ├── Mohit-Pangti/   # gates and combinational logic
│   └── Parikshit-Singh/# integration, examples, coordination
├── .gitignore
├── CONTRIBUTING.md
├── index.html
├── LICENSE
├── README.md
└── SECURITY.md
```

The folders are ownership boundaries for one integrated application, not separate applications. See [docs/team-structure.md](docs/team-structure.md) for interfaces and branch ownership.

## Team

| Member | Enrollment | Role | Responsibility |
| --- | --- | --- | --- |
| Parikshit Singh | BCG26143 | Group Leader | Integration, examples, documentation, coordination |
| Gunish Singh | BCG26041 | Member | UI, palette, workspace, styling, accessibility |
| Mohammad Arsh | BCG26260 | Member | Circuit model, simulation, clock, integration interfaces |
| Mohit Pangti | BCG26186 | Member | Gates and combinational circuits |
| Madhav Gupta | BCG26204 | Member | Sequential circuits, tables, and testing |


## Current Development Status

The application is an early functional baseline with editable graph circuits, interactive SVG wiring, real combinational evaluation, selected sequential components, persistence, JSON transfer, multi-selection, clipboard operations, pan, saved-circuit rename/delete, and a 273-check browser logic suite. It does not yet meet every item in the full project specification. The implemented ripple counter does not model stage delays, and multi-bit buses, binary I/O, full history coverage, component rotation, and the complete example library remain unfinished.

## Future Improvements

Planned improvements include multi-bit buses, configurable register widths, delay-aware ripple simulation, full history coverage, component rotation, binary I/O, complete state-table inspectors, the remaining example circuits, and broader UI/import/storage regression tests.

## Installation and Local Usage

1. Clone or download the `logicflow` repository.
2. Open the project directory in a terminal.
3. Start any static web server in that directory. For example, if Python is installed:

	```bash
	python -m http.server 8000
	```

4. Visit `http://localhost:8000` in a browser.

The application is currently a functional early build. It uses browser ES modules, so open it through a local static server rather than directly as a `file://` URL.

## Browser Requirements

Use a current browser with support for ES modules, SVG, Pointer Events, the HTML dialog element, and localStorage. No external browser dependencies are required.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow, branch and commit conventions, testing expectations, and pull request guidance.
