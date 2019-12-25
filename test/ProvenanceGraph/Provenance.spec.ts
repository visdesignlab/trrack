import initProvenance from '../../src/Provenance/InitializeProvenance';
import { ProvenanceGraph } from '../../src/Interfaces/ProvenanceGraph';
import { isStateNode } from '../../src/Interfaces/NodeInterfaces';

enum TodoStatus {
  DONE = 'DONE',
  ONGOING = 'ONGOING',
  FUTURE = 'FUTURE'
}

interface TodoItem {
  task: string;
  createdOn: string;
  status: TodoStatus;
  completedOn: string;
}

type Todos = TodoItem[];

interface ToDoListState {
  todos: Todos;
}

const state: ToDoListState = {
  todos: [
    {
      task: 'Add unit tests',
      createdOn: new Date().toISOString(),
      status: TodoStatus.ONGOING,
      completedOn: ''
    }
  ]
};

const provenance = initProvenance(state, false);

describe('Initialization', () => {
  it('provenance is a valid Provenance object', () => {
    const functionProperties = [
      'graph',
      'current',
      'root',
      'applyAction',
      'addObserver',
      'addGlobalObserver',
      'goToNode',
      'goBackNSteps',
      'goBackOneStep',
      'goForwardOneStep',
      'reset',
      'done',
      'exportState',
      'importState',
      'exportProvenanceGraph',
      'importProvenanceGraph'
    ];

    functionProperties.forEach(property => {
      expect(provenance).toHaveProperty(property);
    });
  });
});

describe('provenance.graph returns a valid provenance object', () => {
  it('has valid keys', () => {
    expect(provenance.graph()).toMatchSnapshot({
      current: expect.any(String),
      root: expect.any(String),
      nodes: expect.any(Object)
    });
  });

  const { nodes, current, root } = provenance.graph();

  it('has default task added', () => {
    expect(Object.keys(nodes).length).toBe(1);

    const defaultTaskId = Object.keys(nodes)[0];

    expect(nodes[defaultTaskId].state.todos.length).toBe(1);
  });

  test('default task matches the snapshot', () => {
    const defaultTaskId = Object.keys(nodes)[0];

    const defaultTask = nodes[defaultTaskId].state.todos[0];

    expect(defaultTask).toMatchInlineSnapshot(
      {
        task: 'Add unit tests',
        createdOn: expect.any(String),
        status: TodoStatus.ONGOING,
        completedOn: expect.any(String)
      },
      `
      Object {
        "completedOn": Any<String>,
        "createdOn": Any<String>,
        "status": "ONGOING",
        "task": "Add unit tests",
      }
    `
    );
  });
});
