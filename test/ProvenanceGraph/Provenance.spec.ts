import initProvenance from '../../src/Provenance/InitializeProvenance';
import { isStateNode } from '../../src/Interfaces/NodeInterfaces';

describe('Initiailize Provenance Graph', () => {
  interface State {
    count: number;
    message: {
      hi: string;
    };
  }

  const initialState: State = {
    count: 0,
    message: {
      hi: 'how are you?'
    }
  };

  const provenance = initProvenance(initialState, true);

  const actionFunction = (state: State, arg1: any, arg2: any) => {
    state.count += arg1;
    return state;
  };

  const actionFunction2 = (state: State, arg1: any) => {
    state.message.hi = 'Changed';
    return state;
  };

  provenance.addObserver(['message'], (state?: State) => {
    console.log('Yay Partial');
  });

  provenance.addObserver(['message', 'hi'], (state?: State) => {
    console.log('Yay');
  });

  provenance.addObserver(['count'], (state?: State) => {
    console.log('Hello', state);
  });

  provenance.applyAction('Add 2 to count', actionFunction, [2]);

  provenance.goBackOneStep();

  provenance.applyAction('Add 3 to count', actionFunction, [3]);
  // console.log(JSON.stringify(provenance.current(), null, 4));

  provenance.goBackOneStep();
  // console.log(JSON.stringify(provenance.current(), null, 4));

  provenance.applyAction('Changed message', actionFunction2);
  provenance.goBackOneStep();

  provenance.goForwardOneStep();

  const exportedState = provenance.exportState();

  const windowLoc = JSON.stringify(window.location);
  delete window.location;
  Object.defineProperty(window, 'location', {
    value: JSON.parse(windowLoc)
  });

  window.location.href += exportedState;

  provenance.done();

  test('Hello', () => {
    expect(true).toBeTruthy();
  });
});
