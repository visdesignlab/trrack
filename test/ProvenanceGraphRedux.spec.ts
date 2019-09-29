import { Calculator, resetStore, CalcActionEnum } from "./CalculatorTestApp";
import { initProvenanceRedux } from "../src/provenance-core/ProvenanceRedux";
import { recordableReduxActionCreator } from "../src/provenance-core/ActionHelpers/RecordableReduxActions";

console.log("######################################################");
console.log("Redux Testing");
console.log("");
console.log("");
let app = Calculator();

const provenance = initProvenanceRedux(app, (s: any) => {
  app = resetStore(s);
});

console.log("Hello", provenance.graph().root);

console.log(app.getState());

const addAction = recordableReduxActionCreator(
  "Add 1",
  CalcActionEnum.ADD,
  232
);

provenance.apply(addAction);

provenance.importState();

provenance.exportState();

provenance.apply(addAction);

console.log(provenance.graph());

provenance.exportPartialState();

const addAction2 = recordableReduxActionCreator(
  "Add 1",
  CalcActionEnum.SUB,
  200
);

//provenance.importPartialStateFromFile();
provenance.apply(addAction2);
console.log(app.getState());
//provenance.reset();
//console.log(app.getState());

console.log("");
console.log("");
console.log("");
