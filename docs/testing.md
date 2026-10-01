# Testing

No package manager or test dependency is required. Start a static server from the repository root, for example:

```bash
python -m http.server 8000
```

Open `http://localhost:8000/team/Madhav-Gupta/testing/test-runner.html`. The browser test page checks the seven basic gates, arithmetic devices, mux/demux sizes, decoder outputs, encoders, parity, selected sequential transitions, native/legacy circuit files, circuit serialization, and storage operations. At the current baseline it passes 278 checks.

Also open `http://localhost:8000/` and manually check the editable AND example, switch propagation, wiring, component movement, reset, JSON export/import, local save/open/rename/delete, undo/redo, multi-select and clipboard actions, theme, zoom, pan, and responsive layout. Storage and UI workflows have not yet received the same automated coverage as logic equations. Mention any manually tested paths and known limits in pull requests.