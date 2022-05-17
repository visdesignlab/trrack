export type ActionFunctionRegistry = {
  [key: string]: {
    thisArg?: any;
    doableAction: Function;
    undoableAction: Function;
  };
};
