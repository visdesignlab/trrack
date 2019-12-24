// Import here Polyfills if needed. Recommended core-js (npm i -D core-js)
// import "core-js/fn/array.find"
// ...

import produce from 'immer';

export interface State {
  count: number;
  message: string;
  complex: {
    count: number;
    payload: {
      arg1: string;
      arg2: any;
    };
  };
}

export default function doSomething() {
  const baseState: State = {
    count: 0,
    message: 'Initial',
    complex: {
      count: -1,
      payload: {
        arg1: 'Inital payload arg1',
        arg2: {
          message: 'I can be anything'
        }
      }
    }
  };

  const nextState = produce(baseState, draftState => {
    draftState.count = 2;
  });
}
