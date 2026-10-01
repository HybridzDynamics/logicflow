# Combinational Components

Combinational components calculate outputs from their current inputs. Their evaluators live in separate folders under `team/Mohit-Pangti/` and are registered through `shared/components/registry.js`.

## Arithmetic

- Half adder: `Sum = A XOR B`, `Carry = A AND B`.
- Full adder: `Sum = A XOR B XOR Cin`; `Cout` is 1 when at least two inputs are 1.
- Half subtractor: `Difference = A XOR B`, `Borrow = NOT A AND B`.
- Full subtractor: `Difference = A XOR B XOR Bin`; borrow is the standard full-subtractor borrow function.

## Data Routing

MUX inputs are ordered `D0...Dn`, followed by select pins `S0...`; `S0` is the least significant select bit. Implemented sizes are 2:1, 4:1, 8:1, and 16:1. DEMUX has `D` first, then least-significant-first select pins; exactly the selected output receives `D`.

## Encoders and Decoders

The 2-, 3-, and 4-bit decoders have active-high `EN` and one-hot active-high outputs. The 4:2 and 8:3 encoders produce a binary index and `Valid`. If multiple inputs are active, the current encoder selects the highest-numbered active input; the priority encoder uses the same documented highest-index rule.

## Parity

The even-parity generator emits the XOR of the data bits; the odd-parity generator emits its inverse. Checkers output `PASS=1` when the received parity bit makes the total parity match the selected convention.

The current inspector shows truth tables only for components with at most four input pins. Larger devices are checked by exhaustive cases in the browser validation suite rather than a full inspector table.