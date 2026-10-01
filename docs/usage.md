# Usage

## Start LogicFlow

Serve the repository root using any static HTTP server. For example, with Python installed, run `python -m http.server 8000` and open `http://localhost:8000/`. ES modules are used, so opening `index.html` directly through `file://` is not supported.

## Build a Circuit

Choose a component from the searchable palette to add it, or drag a palette item onto the workspace. Drag a component body to move it. Click an output pin and then a destination input pin to connect a wire. Select a wire and press Delete to remove it. Use the switch's HIGH/LOW label or its inspector control to toggle its input.

Run starts periodic clock steps; Step advances one clock pulse. Pause stops periodic stepping, Stop halts it, and Reset restores switch and sequential initial state. The Hz field adjusts the clock from 0.1 to 20 Hz. Zoom buttons or the mouse wheel change scale; middle-button drag or Shift+left-drag on empty workspace pans the circuit. The Grid control toggles the background grid. Shift-click components to select a group. Use Ctrl+A/C/V to select all, copy, and paste; Delete removes the current selection.

## Save and Transfer

Save stores the current circuit in browser localStorage under a name. Open lists saved circuits and provides open, rename, and delete actions. Export downloads a versioned `.logicflow` file; Import accepts `.logicflow` and legacy circuit `.json` files. Imported files are treated as data and are never executed. Browser storage can be unavailable in private or restricted browsing modes. See [file-format.md](file-format.md) for the native file contract.

The application currently lacks circuit rename/delete management, binary bus inputs/outputs and configurable multi-bit buses, component rotation, and full state-table views.