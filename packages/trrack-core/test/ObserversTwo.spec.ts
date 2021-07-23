import { createAction, initProvenance } from '../src';

type DemoState = {
  fake: {
    viewList: number[];
  };

  focusView: number;
};

const demoInitialState: DemoState = {
  fake: {
      viewList: []
  },
  focusView: 0,
};

export type OrdinoEvents = 'Create View' | 'Remove View' | 'Change View' | 'Change Focus View';

let viewListChanged: number = 0;
let focusViewChanged: number = 0;


function resetCounters() {
  viewListChanged = 0;
  focusViewChanged = 0;
}

function setup() {
  resetCounters();
  const provenance = initProvenance<DemoState, OrdinoEvents>(demoInitialState, {
    loadFromUrl: false,
  });

  const createViewAction = createAction<DemoState, [number], OrdinoEvents>(
    (state: DemoState, newViewName: number) => {
      state.fake.viewList.push(newViewName);
      state.focusView = state.fake.viewList.length - 1;
    },
  )
    .setLabel('dummy label')
    .setEventType('Create View');

  const focusViewAction = createAction<DemoState, [number], OrdinoEvents>(
    (state: DemoState, newIndex: number) => {
      console.log('in focus action');
      state.focusView = newIndex;
    },
  )
    .setLabel('dummy label')
    .setEventType('Change Focus View');

  provenance.addObserver(
    (state) => state.fake.viewList,
    () => {
      viewListChanged += 1;
    },
  );

    provenance.addObserver(
        (state) => state.focusView,
        () => {
        focusViewChanged += 1;
        },
    );

  provenance.done();

  return {
    provenance,
    createViewAction,
    focusViewAction,
  };
}

describe('addObserver secondary tests', () => {
  it('observers dont call unless their state was changed', () => {
    const { provenance, createViewAction, focusViewAction } = setup();

    provenance.apply(createViewAction(1));
    provenance.apply(createViewAction(2));

    provenance.apply(focusViewAction(1));
    provenance.apply(focusViewAction(2));
    provenance.apply(focusViewAction(1));

    expect(viewListChanged).toEqual(2);
    expect(focusViewChanged).toEqual(3);
  });
});
