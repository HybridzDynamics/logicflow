import { advanceCounter, counterOutputs, isCounter } from "../counters/counters.js";
import { evaluateRegister, isRegister, registerOutputs } from "../registers/registers.js";
import { registerComponent } from "../../../shared/components/registry.js";

export function evaluateSequential(component, clockStep = false) {
  const input = (index) => Number(Boolean(component.inputs[index]?.value));
  const state = component.state;
  const clockIndex = component.inputs.findIndex((pin) => pin.name === "CLK");
  const resetIndex = component.inputs.findIndex((pin) => pin.name === "RESET");
  const previousClock = state.lastClock || 0;
  const currentClock = input(clockIndex);
  const rising = clockStep && !previousClock && currentClock;
  state.lastClock = currentClock;
  if (component.type === "masterSlave") {
    if (!currentClock) state.master = input(0);
    if (rising) state.q = state.master;
    return;
  }
  if (!rising) return;
  if (resetIndex >= 0 && input(resetIndex)) {
    state.value = 0; state.q = 0; state.serialOut = 0; return;
  }
  if (advanceCounter(component)) return;
  if (evaluateRegister(component, input)) return;

  switch (component.type) {
    case "sr":
      if (input(0) && input(1)) state.invalid = true;
      else {
        state.invalid = false;
        if (input(0)) state.q = 1;
        else if (input(1)) state.q = 0;
      }
      break;
    case "dff": state.q = input(0); break;
    case "jkff":
      if (input(0) && input(1)) state.q = 1 - state.q;
      else if (input(0)) state.q = 1;
      else if (input(1)) state.q = 0;
      break;
    case "tff": if (input(0)) state.q = 1 - state.q; break;
  }
}

export function sequentialOutputs(component) {
  if (isCounter(component.type)) return counterOutputs(component);
  if (isRegister(component.type)) return registerOutputs(component);
  const q = Number(Boolean(component.state.q));
  return [q, 1 - q];
}