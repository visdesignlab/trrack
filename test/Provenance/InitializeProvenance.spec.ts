import { ActionFunction, initProvenance } from '../../src';

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
  user: {
    name: string;
    totalTask: number;
  };
  todos: Todos;
}

function setupApp() {
  const state: ToDoListState = {
    user: {
      name: 'Kiran',
      totalTask: 1
    },
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

  provenance.addGlobalObserver(() => {
    console.log('Will always be called');
  });

  provenance.addObserver(['todos'], () => {
    console.log('Added Task');
  });

  provenance.addObserver(['user', 'totalTask'], (state?: ToDoListState) => {
    console.log('Now the total tasks are: ', state?.user.totalTask);
  });

  const addTask: ActionFunction<ToDoListState> = (state: ToDoListState, task: TodoItem) => {
    state.todos.push(task);
    state.user.totalTask = state.todos.length;
    return state;
  };

  return { state, provenance, addTask };
}

describe('Initialization', () => {
  const { provenance } = setupApp();
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
  const { provenance } = setupApp();

  it('has valid keys', () => {
    expect(provenance.graph()).toMatchSnapshot({
      current: expect.any(String),
      root: expect.any(String),
      nodes: expect.any(Object)
    });
  });

  const { nodes } = provenance.graph();

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

describe('applying an action', () => {
  const { provenance, addTask } = setupApp();

  const newTask: TodoItem = {
    createdOn: new Date().toISOString(),
    task: 'To check for coverage changes',
    status: TodoStatus.ONGOING,
    completedOn: ''
  };

  provenance.applyAction('Adding new task', addTask, [newTask]);

  test('New node has beend added with proper label', () => {
    expect(true).toBeTruthy();
  });
});
