# Logic Gates

The basic gates are implemented in `team/Mohit-Pangti/logic-gates/gates.js`. Each gate uses binary inputs and one output. The simulator's gate evaluator is also used by the inspector's truth-table generator.

| Gate | Output |
| --- | --- |
| AND | 1 only if every input is 1 |
| OR | 1 if any input is 1 |
| NOT | Inverts the input |
| NAND | Inverts AND |
| NOR | Inverts OR |
| XOR | 1 when an odd number of inputs is 1; for two inputs, when they differ |
| XNOR | Inverts XOR; for two inputs, 1 when inputs match |

The current palette exposes two-input AND/OR/NAND/NOR/XOR/XNOR and one-input NOT. Gate formulas are checked by the browser test suite in `team/Madhav-Gupta/testing/test-runner.html`.