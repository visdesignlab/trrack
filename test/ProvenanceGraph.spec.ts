import { expect } from "./expect";
import { Provenance } from "../src";

import * as util from "util";

import { Calculator, CalcActionEnum } from "./CalculatorTestApp";
import {
  ReversibleAction,
  ReversibleActionCreator
} from "../src/provenance-core/ProvenanceActions";
import { StateNode } from "../src/provenance-core/NodeInterfaces";

console.clear();

const app = Calculator();

const provenance = Provenance(app);

const createReversibleAddAction = (
  toAdd: number
): ReversibleAction<number, number> => {
  return ReversibleActionCreator(CalcActionEnum.ADD, toAdd, toAdd);
};

const act = createReversibleAddAction(3);

console.log(
  "#####################################################################################"
);
console.log(app.getState());

provenance.apply(act);
provenance.apply(act);
provenance.apply(act);
provenance.apply(act);

console.log(
  "#####################################################################################"
);
console.log(app.getState());
console.log(
  "#####################################################################################"
);
// provenance.goToNode((provenance.graph().current as StateNode).parent);
provenance.goBackNSteps(0);
console.log(util.inspect(provenance.graph(), false, 10, true));
console.log(
  "#####################################################################################"
);
console.log(app.getState());
console.log(
  "#####################################################################################"
);
