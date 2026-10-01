export class History {
  constructor(circuit) { this.circuit = circuit; this.undoStack = []; this.redoStack = []; }
  checkpoint() {
    this.undoStack.push(this.circuit.serialize());
    if (this.undoStack.length > 100) this.undoStack.shift();
    this.redoStack.length = 0;
  }
  undo() {
    if (!this.undoStack.length) return false;
    this.redoStack.push(this.circuit.serialize());
    this.circuit.load(this.undoStack.pop());
    return true;
  }
  redo() {
    if (!this.redoStack.length) return false;
    this.undoStack.push(this.circuit.serialize());
    this.circuit.load(this.redoStack.pop());
    return true;
  }
}