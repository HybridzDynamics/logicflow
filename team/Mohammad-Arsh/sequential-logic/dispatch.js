import { registerComponent } from "../../../shared/components/registry.js";

export { evaluateSequential, sequentialOutputs } from "../../Madhav-Gupta/flip-flops/sequential.js";

import { evaluateSequential } from "../../Madhav-Gupta/flip-flops/sequential.js";

for (const type of ["sr", "dff", "jkff", "tff", "masterSlave", "siso4", "sipo4", "piso4", "pipo4", "counter4", "syncCounter4", "ringCounter4", "johnsonCounter4", "rippleCounter4", "moduloCounter4"]) {
	registerComponent({ type, evaluateState: evaluateSequential });
}