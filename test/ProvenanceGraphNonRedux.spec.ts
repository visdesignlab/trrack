import { initProvenance } from "../src/provenance-core/Provenance";
import {
  initCalcState,
  Calculator,
  CalcState
} from "./CalculatorNonReduxTextApp";

console.log("######################################################");
console.log("Non Redux Testing");
console.log("");
console.log("");

const provenance = initProvenance(initCalcState);
const app = Calculator(provenance);

provenance.addObserver("count.count2", () => {
  console.log("I should be called Multiple times");
});

provenance.addObserver("count.count2.count4", (state: CalcState) => {
  console.log("Only once", state.count);
});
console.log(app.currentState());

provenance.applyAction({
  label: "Add val",
  action: (val: number) => {
    const test = (app.currentState() as any) as CalcState;
    test.count.count2.count3 += val;
    return test;
  },
  args: [12]
});
console.log(app.currentState());

provenance.applyAction({
  label: "Add val",
  action: (val: number) => {
    const test = (app.currentState() as any) as CalcState;
    test.count.count2.count4 += val;
    return test;
  },
  args: [12]
});
console.log(app.currentState());

provenance.reset();
console.log(app.currentState());

console.log("");
console.log("");
console.log("");
