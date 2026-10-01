# LogicFlow — Digital Logic Circuit Simulator

LogicFlow is a web-based digital logic circuit simulator project for visually building circuits and exploring how logic signals propagate. It is an academic project for BCA Digital Logics at Jaypee Institute of Information Technology, developed with HTML5, CSS3, and JavaScript.

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![Status: Under development](https://img.shields.io/badge/status-under%20development-orange.svg)

> **Development status:** The project is at its initial scaffold stage. The simulator features below are planned; they are not implemented in the current project yet.

## Features

The following capabilities are planned:

- Interactive circuit workspace with drag-and-drop components
- AND, OR, NOT, NAND, NOR, XOR, and XNOR logic gates
- Input switches and output indicators / LEDs
- Wire connections between components
- Real-time signal propagation and visual circuit states
- Circuit reset
- Save and load circuit designs
- Truth-table-based validation

## Technologies

- HTML5 for document structure
- CSS3 for presentation
- JavaScript for planned circuit interaction and simulation logic
- HTML5 Canvas or SVG for planned circuit rendering

No frontend framework or backend is used by this project.

## How the Simulator Will Work

The intended workflow is to place gates and input/output components in a circuit workspace, connect them with wires, and change input switches. A simulation engine will evaluate the connected logic and update output indicators to show signal states. Truth tables will be used to validate gate and circuit behavior. These interactions are planned and are not available yet.

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
├── css/
│   └── style.css       # planned stylesheet
├── docs/               # project documentation
├── js/
│   └── app.js          # planned application entry point
├── .gitignore
├── CONTRIBUTING.md
├── index.html
├── LICENSE
├── README.md
└── SECURITY.md
```

The `css/style.css` and `js/app.js` files are referenced by the entry page but have not been added yet.

## Team

| Name | 
| --- | 
| Parikshit Singh | 
| Gunish Singh | 
| Mohammad Arsh | 
| Mohit Pangti |
| Madhav Gupta |


## Current Development Status

The repository currently contains the initial project page and documentation scaffold. The interactive workspace, gates, wiring, simulation, design save/load, and truth-table validation are planned work; no simulator functionality is currently implemented.

## Future Improvements

Planned work includes developing the circuit workspace and rendering, implementing gate and wire interactions, building the signal propagation engine, adding design save/load, and validating circuits against truth tables. The exact sequence may change as the project develops.

## Installation and Local Usage

1. Clone or download the `logicflow` repository.
2. Open the project directory in a terminal.
3. Start any static web server in that directory. For example, if Python is installed:

	```bash
	python -m http.server 8000
	```

4. Visit `http://localhost:8000` in a browser.

The current page is a development placeholder. The referenced stylesheet and JavaScript entry point are planned files and are not present yet.

## Browser Requirements

Use a current browser with support for standard HTML5, CSS3, and JavaScript. Canvas or SVG support will be needed if selected for circuit rendering. No external browser dependencies are required.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for the development workflow, branch and commit conventions, testing expectations, and pull request guidance.
