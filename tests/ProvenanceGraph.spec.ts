import { Provenance } from "../src/provenance";
import {
  ActionTemplate,
  RegisterActionTemplate
} from "../src/provenance-core/Actions";
let a = Provenance();

let b = a.graph();

class Counter {
  count: number = 0;

  add() {
    this.count++;
  }

  sub() {
    this.count--;
  }

  print() {
    console.log(this.count);
  }
}

let ct = new Counter();
ct.print();

let addAction: RegisterActionTemplate = {
  name: "add",
  do: {
    func: ct.add,
    thisArgs: ct
  },
  undo: {
    func: ct.sub,
    thisArgs: ct
  }
};

a.register(addAction);

a.apply({
  name: "add",
  doArgs: [],
  undoArgs: []
}).then(done => {
  ct.print();

  a.goTo(a.graph().root.id).then(done => {
    ct.print();
  });
});
