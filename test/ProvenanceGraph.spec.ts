import { Provenance } from "../src";

import * as util from "util";

// import { Calculator, CalcActionEnum } from "./CalculatorTestApp";
import {
  ReversibleAction,
  ReversibleActionCreator
} from "../src/provenance-core/ProvenanceActions";
import {
  initCalcState,
  Calculator,
  CalcState
} from "./CalculatorNonReduxTextApp";

console.clear();

const provenance = Provenance(initCalcState);

const app = Calculator(provenance);

provenance.addObserver("count.count2.count4", () => {
  console.log("I should be called Multiple times");
});

provenance.addObserver("count.count2.count4", (state: CalcState) => {
  console.log("Only once", state.count);
});

provenance.applyAction({
  label: "Add val",
  action: (val: number) => {
    const test = (app.currentState() as any) as CalcState;
    test.count.count2.count3 += val;
    return test;
  },
  args: [12]
});

provenance.applyAction({
  label: "Add val",
  action: (val: number) => {
    const test = (app.currentState() as any) as CalcState;
    test.count.count2.count4 += val;
    return test;
  },
  args: [12]
});

// const app = Calculator();

// const provenance = Provenance(app);

// const createReversibleAddAction = (
//   toAdd: number
// ): ReversibleAction<number, number> => {
//   return ReversibleActionCreator(CalcActionEnum.ADD, toAdd, toAdd);
// };

// const act = createReversibleAddAction(3);

// console.log(
//   "#####################################################################################"
// );
// console.log(app.getState());

// provenance.apply(act);
// provenance.apply(act);
// provenance.apply(act);
// provenance.apply(act);

// console.log(
//   "#####################################################################################"
// );
// console.log(app.getState());
// console.log(
//   "#####################################################################################"
// );
// // provenance.goToNode((provenance.graph().current as StateNode).parent);
// provenance.goBackNSteps(0);
// console.log(util.inspect(provenance.graph(), false, 10, true));
// console.log(
//   "#####################################################################################"
// );
// console.log(app.getState());
// console.log(
//   "#####################################################################################"
// );
