import { createStore, combineReducers } from "redux";

export enum CalcActionEnum {
  ADD = "ADD",
  SUB = "SUB",
  DO_ADD = ADD,
  UNDO_ADD = SUB,
  DO_SUB = SUB,
  UNDO_SUB = ADD
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

export const Calculator = () =>
  createStore(
    combineReducers({
      count: calcReducer
    })
  );
