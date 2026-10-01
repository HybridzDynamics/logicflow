export class SimulationClock {
  constructor(onStep, frequency = 1.5) {
    this.onStep = onStep;
    this.frequency = frequency;
    this.timer = null;
  }

  get running() { return this.timer !== null; }

  setFrequency(frequency) {
    const value = Number(frequency);
    if (!Number.isFinite(value) || value < 0.1 || value > 20) throw new Error("Clock frequency must be between 0.1 and 20 Hz.");
    const wasRunning = this.running;
    this.pause();
    this.frequency = value;
    if (wasRunning) this.start();
  }

  start() {
    if (this.running) return;
    this.timer = window.setInterval(() => this.step(), 1000 / this.frequency);
  }

  pause() {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
  }

  stop() { this.pause(); }

  step() { this.onStep(); }
}