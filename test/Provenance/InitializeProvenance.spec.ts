import { StateNode } from '../../src/Interfaces/NodeInterfaces';
import initProvenance, { createAction } from '../../src/Provenance/InitializeProvenance';

describe('Testing', () => {
  it('should be true', () => {
    const state = {
      hello: 'World',
      world: {
        msg: 'Best',
        msg2: 'Test',
      },
    };

    type State = typeof state;

    let test = initProvenance<State, any, any>(state);

    // test.addGlobalObserver((graph) => console.log(graph.current, graph.root));
    test.addObserver('world.msg', (data) => {
      console.log('From World', data);
    });
    test.addObserver('world.msg2', (data) => {
      console.log('From World 2', data);
    });
    test.addObserver('world', (data) => {
      console.log('From World Over', data);
    });

    const action = createAction((state: State, val: string) => {
      state.world.msg2 = val;
      return state;
    })
      .addLabel('Updating msg2')
      .addArgs(['ASDASDASD']);

    const action2 = createAction((state: State, value: string) => {
      state.world.msg = value;
      return state;
    })
      .addLabel('Update msg')
      .addArgs(['Blah Blah']);
    console.log('11111111111111111111111111');
    test.apply(action);
    console.log('222222222222222222222222222222222222222');
    test.apply(action2);
    console.log('33333333333333333333333333333333');
    test.goToNode(test.root.id);

    expect(true).toBeTruthy();
  });
});
