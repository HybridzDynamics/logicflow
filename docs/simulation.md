# Simulation Model

The simulation engine is independent of SVG rendering. It resets derived input values, transfers source output values over wires, evaluates combinational components, and repeats until outputs stop changing or the pass limit is reached. The limit prevents an endless evaluation loop; a circuit that does not settle is reported as unstable.

Sequential components are not recalculated as stateless gates. They hold state on the component object and update through the sequential dispatch only when a clock step produces a rising edge. The clock controller supports start, pause, stop, a 0.1-20 Hz frequency control, and deterministic manual steps. The toolbar exposes Run, Pause, Stop, and Step.

The signal model is currently binary and single-bit. It does not implement tri-state/high-impedance signals, multiple drivers, bus widths, propagation delays, or event-accurate ripple behavior.