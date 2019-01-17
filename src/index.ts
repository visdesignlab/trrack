export {
  Provenance,
  DoFunctionTemplate,
  UndoFunctionTemplate,
  DoFunction,
  UndoFunction
} from "./provenance";

// let a = Provenance();

// let b = 0;

// let add: DoFunctionTemplate = {
//   name: "add",
//   func: () => {
//     b = b + 1;
//     console.log(b);
//   },
//   thisArgs: null
// };

// let sub: UndoFunctionTemplate = {
//   name: "add",
//   func: () => {
//     b = b - 1;
//     console.log(b);
//   },
//   thisArgs: null
// };

// a.register(add, sub);

// let res = a.apply(
//   {
//     name: "add",
//     args: []
//   },
//   {
//     name: "add",
//     args: []
//   }
// );

// res.then(r => {
//   let temp = a.goTo(r.parent.id);
// });
