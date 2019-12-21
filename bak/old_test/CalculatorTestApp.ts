import { createStore, combineReducers } from "redux";

export enum CalcActionEnum {
  ADD = "ADD",
  DO_ADD = ADD,
  UNDO_SUB = ADD,
  SUB = "SUB",
  UNDO_ADD = SUB,
  DO_SUB = SUB
}

interface CalcAction {
  type: CalcActionEnum;
  args: number;
}

export const createAddAction = (toAdd: number): CalcAction => ({
  type: CalcActionEnum.ADD,
  args: toAdd
});

export const createSubAction = (toSub: number): CalcAction => ({
  type: CalcActionEnum.SUB,
  args: toSub
});

const calcReducer = (count: number = 0, action: CalcAction) => {
  switch (CalcActionEnum[action.type]) {
    case CalcActionEnum.ADD:
      return count + action.args;
    case CalcActionEnum.SUB:
      return count - action.args;
    default:
      return count;
  }
};

const calcConstantReducer = (value: string = "unchanged", action: CalcAction) => {
  switch (CalcActionEnum[action.type]) {
    case CalcActionEnum.ADD:
      return value;
    case CalcActionEnum.SUB:
      return value;
    default:
      return value;
  }
};
export const Calculator = () =>
  createStore(
    combineReducers({
      count1: calcReducer,
      count2: calcReducer,
      count3: calcConstantReducer
    })
  );

export function resetStore(newState: any) {
  return createStore(
    combineReducers({
      count1: calcReducer,
      count2: calcReducer,
      count3: calcConstantReducer
    }),
    newState
  );
}
