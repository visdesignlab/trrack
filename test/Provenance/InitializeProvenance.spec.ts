import { ActionFunction, initProvenance } from '../../src';
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
  user: {
    name: string;
    totalTask: number;
  };
  todos: Todos;
}

function setupApp(loadFromUrl: boolean = false) {
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

  const observerStatus = {
    global: 0,
    todos: 0,
    user: 0,
    user_total: 0
  };

  const provenance = initProvenance(state, loadFromUrl);

  provenance.addGlobalObserver(() => {
    observerStatus.global += 1;
  });

  provenance.addObserver(['todos'], () => {
    observerStatus.todos += 1;
  });

  provenance.addObserver(['user'], (state?: ToDoListState) => {
    observerStatus.user += 1;
  });

  provenance.addObserver(['user', 'totalTask'], (state?: ToDoListState) => {
    observerStatus.user_total += 1;
  });

  provenance.done();

  const addTask: ActionFunction<ToDoListState> = (state: ToDoListState, task: TodoItem) => {
    state.todos.push(task);
    state.user.totalTask = state.todos.length;
    return state;
  };

  const changeNameToHello: ActionFunction<ToDoListState> = (state: ToDoListState) => {
    state.user.name = 'Hello';
    return state;
  };

  return { state, provenance, addTask, observerStatus, changeNameToHello };
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

function addOneTask() {
  const app = setupApp();

  const { provenance, addTask } = app;

  const newTask: TodoItem = {
    createdOn: new Date().toISOString(),
    task: 'To check for coverage changes',
    status: TodoStatus.ONGOING,
    completedOn: ''
  };

  provenance.applyAction('Adding new task', addTask, [newTask]);

  return { ...app, label: 'Adding new task' };
}

function addNoArgTask() {
  const app = setupApp();

  const { provenance, changeNameToHello } = app;

  provenance.applyAction('Change name to hello', changeNameToHello);

  return { ...app, label: 'Change name to hello' };
}

describe('applying an action', () => {
  let { provenance, label } = addOneTask();

  test('if some new node has added', () => {
    const { nodes } = provenance.graph();
    const nodeIds = Object.keys(nodes);
    expect(nodeIds.length).toBe(2);
  });

  test('if new node has proper label', () => {
    const { nodes, current } = provenance.graph();
    const currentNode = nodes[current];
    expect(currentNode.label).toBe(label);
  });

  test('if state stored matches the added task', () => {
    const { nodes, current } = provenance.graph();
    const currentState = nodes[current].state;
    const addedTodo = currentState.todos[1];

    expect(addedTodo).toMatchInlineSnapshot(
      {
        createdOn: expect.any(String),
        task: 'To check for coverage changes',
        status: TodoStatus.ONGOING,
        completedOn: expect.any(String)
      },
      `
      Object {
        "completedOn": Any<String>,
        "createdOn": Any<String>,
        "status": "ONGOING",
        "task": "To check for coverage changes",
      }
    `
    );
  });

  test('if action with no arguments executes', () => {
    let { provenance, label } = addNoArgTask();

    const { nodes, current } = provenance.graph();
    const currentNode = nodes[current];
    expect(currentNode.label).toBe(label);
  });
});

describe('isStateNode function', () => {
  const { provenance } = addOneTask();

  test('test if isStateNode function works', () => {
    let parentId = '';
    const currNode = provenance.current();
    if (isStateNode(currNode)) {
      parentId = currNode.parent;
    }

    expect(provenance.graph().root).toBe(parentId);
  });
});

describe('current and root function', () => {
  test('current function returns current node', () => {
    const { provenance } = setupApp();
    const { nodes, current } = provenance.graph();
    const currentNode = nodes[current];

    expect(provenance.current()).toStrictEqual(currentNode);
  });

  test('root function returns root node', () => {
    const { provenance } = setupApp();
    const { nodes, root } = provenance.graph();
    const rootNode = nodes[root];

    expect(provenance.root()).toStrictEqual(rootNode);
  });
});

describe('test go to node', () => {
  const { provenance, addTask } = addOneTask();
  const newTask: TodoItem = {
    createdOn: new Date().toISOString(),
    completedOn: '',
    task: 'Write Code',
    status: TodoStatus.FUTURE
  };

  provenance.applyAction('Adding 3rd task', addTask, [newTask]);

  test('if root is not current', () => {
    const { root, current } = provenance.graph();
    expect(root).not.toBe(current);
  });

  test('if goToNode goes to root after adding 2 tasks', () => {
    provenance.goToNode(provenance.root().id);

    const root = provenance.root().id;
    const current = provenance.current().id;

    expect(root).toBe(current);
  });

  test('if goToNode throws error on wrong id', () => {
    const errFunc = () => provenance.goToNode('');
    expect(errFunc).toThrowError();
  });
});

describe('reset function', () => {
  const { provenance, addTask } = addOneTask();
  const newTask: TodoItem = {
    createdOn: new Date().toISOString(),
    completedOn: '',
    task: 'Write Code',
    status: TodoStatus.FUTURE
  };

  provenance.applyAction('Adding 3rd task', addTask, [newTask]);

  test('if root is not current', () => {
    const { root, current } = provenance.graph();
    expect(root).not.toBe(current);
  });

  test('check if reset function goes back to root', () => {
    provenance.reset();

    const root = provenance.root().id;
    const current = provenance.current().id;

    expect(root).toBe(current);
  });
});

function threeTasks() {
  const app = addOneTask();
  const { provenance, addTask } = app;
  const newTask: TodoItem = {
    createdOn: new Date().toISOString(),
    completedOn: '',
    task: 'Write Code',
    status: TodoStatus.FUTURE
  };

  provenance.applyAction('Adding 3rd task', addTask, [newTask]);

  return { ...app };
}

describe('goBackOneStep function', () => {
  test('goBackOneStep goes to parent node', () => {
    const { provenance } = threeTasks();
    const currentNode = provenance.current();
    let parentId = '';
    if (isStateNode(currentNode)) {
      parentId = currentNode.parent;
    }

    provenance.goBackOneStep();
    const newCurrentNodeId = provenance.current().id;
    expect(newCurrentNodeId).toBe(parentId);
  });

  test('goBackOneStep throws error on root', () => {
    const { provenance } = threeTasks();
    provenance.reset();
    const err = () => provenance.goBackOneStep();

    expect(err).toThrowError();
  });
});

describe('goBackNSteps function', () => {
  test('goBackNSteps goes to root node after 2 steps', () => {
    const { provenance } = threeTasks();
    const { root } = provenance.graph();

    provenance.goBackNSteps(2);
    const newCurrentNodeId = provenance.current().id;

    expect(newCurrentNodeId).toBe(root);
  });

  test('goBackNSteps throws error on more than 2 steps', () => {
    const { provenance } = threeTasks();
    const err = () => provenance.goBackNSteps(10);
    expect(err).toThrowError();
  });
});

describe('goForwardOneStep function', () => {
  test('goForwardOneStep goes to child node', () => {
    const { provenance } = threeTasks();
    provenance.goBackOneStep();
    const childId = provenance.current().children[0];
    provenance.goForwardOneStep();
    const currentId = provenance.graph().current;

    expect(childId).toBe(currentId);
  });

  test('goForwardOneStep throws error when no children', () => {
    const { provenance } = threeTasks();
    const err = () => provenance.goForwardOneStep();
    expect(err).toThrowError();
  });
});

describe('Export state function', () => {
  test('export full state returns a string', () => {
    const { provenance } = threeTasks();
    const exportedString = provenance.exportState();
    expect(typeof exportedString).toBe('string');
  });

  test('export partial state returns a string', () => {
    const { provenance } = threeTasks();
    const exportedString = provenance.exportState(true);
    expect(typeof exportedString).toBe('string');
  });
});

describe('Import state function', () => {
  test('import full state loads current state', () => {
    const { provenance } = threeTasks();
    const currentState = provenance.current().state;
    const exportedString = provenance.exportState();

    const { provenance: prov2 } = setupApp();
    prov2.importState(exportedString);
    const currentState2 = prov2.current().state;

    expect(currentState).toStrictEqual(currentState2);
  });

  test('import partial state loads current state', () => {
    const { provenance } = threeTasks();
    const currentState = provenance.current().state;
    const exportedString = provenance.exportState(true);

    const { provenance: prov2 } = setupApp();
    prov2.importState(exportedString);
    const currentState2 = prov2.current().state;

    expect(currentState).toStrictEqual(currentState2);
  });
});

// describe('goBack and goForward functions', () => {

//   test('goBackOneStep', () => {
//   const { provenance } = threeTasks();
//     const { root, current } = provenance.graph();
//     expect(root).not.toBe(current);
//   });

// });
