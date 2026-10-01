# Integration

The static application starts at `app/bootstrap.js`, which imports `app/app.js`. The application composes the shared circuit registry, graph model, simulation, renderer, storage, history, and member-owned component modules through ES module imports. Feature modules must not start a separate application or duplicate the simulation engine.