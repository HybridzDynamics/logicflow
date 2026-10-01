# Sequential Components

Sequential components retain state in the circuit model. The state evaluator is called on clock steps and distinguishes a rising edge from a steady signal. The current palette provides four-bit register and counter configurations; configurable widths are not yet implemented.

## Flip-Flops

- D: captures `D` on a rising edge.
- JK: holds for `J=K=0`, resets for `01`, sets for `10`, and toggles for `11`.
- T: holds for 0 and toggles for 1.
- SR: active-high set/reset; `S=R=1` is marked invalid and retains the previous output.
- Master-slave D: samples `D` during the low phase and transfers the stored master value on the rising edge. This is a discrete two-phase model, not a delay-accurate gate-level latch pair.

Each flip-flop exposes `Q` and `Q̅`. The test suite covers characteristic transitions for D, JK, T, SR, and master-slave devices.

## Registers and Counters

SISO/SIPO shift serial input toward the most-significant bit; PISO shifts its least-significant bit out; PIPO loads parallel data on `LOAD`. Ring and Johnson counters use their own feedback transitions. Synchronous counting increments on each rising edge. Modulo-N uses a configurable `modulo` value in component data, defaulting to 10. The ripple counter currently presents the correct binary count sequence but does not model internal stage timing.

State-table inspection is not yet available in the main UI. Characteristic data for SR, D, JK, and T is in `team/Madhav-Gupta/truth-tables/tables.js`.