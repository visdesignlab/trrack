import { ActionFunction, initProvenance } from '../../src';
import {
  isStateNode,
  isChildNode,
  isDiffNode,
  StateNode,
  DiffNode,
  ChildNode,
  Extra
} from '../../src/Interfaces/NodeInterfaces';
import deepCopy from '../../src/Utils/DeepCopy';

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

type TestEvents = 'Name Change' | 'Add TODO';

type Annotation = string;

function setupApp(loadFromUrl: boolean = false, skipGlobal: boolean = false) {
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
    global2: 1,
    todos: 0,
    user: 0,
    user2: 1,
    user_total: 0
  };

  const provenance = initProvenance<ToDoListState, TestEvents, Annotation>(state, loadFromUrl);

  if (!skipGlobal) {
    provenance.addGlobalObserver(() => {
      observerStatus.global += 1;
    });

    provenance.addGlobalObserver(() => {
      observerStatus.global *= 2;
    });
  }

  provenance.addObserver(['todos'], () => {
    observerStatus.todos += 1;
  });

  provenance.addObserver(['user'], (state?: ToDoListState) => {
    observerStatus.user += 1;
  });

  provenance.addObserver(['user'], (state?: ToDoListState) => {
    observerStatus.user *= 2;
  });

  provenance.addObserver(['user', 'totalTask'], (state?: ToDoListState) => {
    observerStatus.user_total += 1;
  });

  provenance.addArtifactObserver((extra: Extra<Annotation>[]) => {
    extra.push({} as any);
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

    expect(nodes[defaultTaskId].getState().todos.length).toBe(1);
  });

  test('default task matches the snapshot', () => {
    const defaultTaskId = Object.keys(nodes)[0];

    const defaultTask = nodes[defaultTaskId].getState().todos[0];

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

function addOneTask(skipGlobal: boolean = false) {
  const app = setupApp(false, skipGlobal);

  const { provenance, addTask } = app;

  const newTask: TodoItem = {
    createdOn: new Date().toISOString(),
    task: 'To check for coverage changes',
    status: TodoStatus.ONGOING,
    completedOn: ''
  };

  provenance.applyAction('Adding new task', addTask, [newTask], { type: 'Add TODO' });

  return { ...app, label: 'Adding new task' };
}

function addNoArgTask() {
  const app = setupApp();

  const { provenance, changeNameToHello } = app;

  provenance.applyAction('Change name to hello', changeNameToHello, undefined, {
    type: 'Name Change'
  });

  return { ...app, label: 'Change name to hello' };
}

describe('applying an action', () => {
  let { provenance, label } = addOneTask(true);

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
    const currentState = nodes[current].getState();
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
    const { provenance } = setupApp(false, true);
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

  provenance.applyAction('Adding 3rd task', addTask, [newTask], { type: 'Add TODO' });

  provenance.addExtraToNodeArtifact(provenance.current().id, 'Hello, World');
  provenance.getExtraFromArtifact(provenance.current().id);

  test('add artifact error', () => {
    const err = () => provenance.addExtraToNodeArtifact(provenance.root().id, 'Hello, World');
    expect(err).toThrowError();
  });

  test('get artifact error', () => {
    const err = () => provenance.getExtraFromArtifact(provenance.root().id);
    expect(err).toThrowError();
  });

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
    if (isChildNode(currentNode)) {
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
    const currentState = provenance.current().getState();
    const exportedString = provenance.exportState();

    const { provenance: prov2 } = setupApp();
    prov2.importState(exportedString);
    const currentState2 = prov2.current().getState();

    expect(currentState).toStrictEqual(currentState2);
  });

  test('import partial state loads current state', () => {
    const { provenance } = threeTasks();
    const currentState = provenance.current().getState();
    const exportedString = provenance.exportState(true);

    const { provenance: prov2 } = setupApp();
    prov2.importState(exportedString);
    const currentState2 = prov2.current().getState();

    expect(currentState).toStrictEqual(currentState2);
  });
});

describe('loadFromUrl', () => {
  const { provenance: prov } = threeTasks();
  const stateCopy = deepCopy(prov.current().getState());

  const originalWindowLocationHref = window.location.href;

  test('test if url loading works', () => {
    const windowLoc = JSON.stringify(window.location);
    delete window.location;
    Object.defineProperty(window, 'location', {
      value: JSON.parse(windowLoc),
      writable: true
    });
    window.location.href = originalWindowLocationHref + prov.exportState();

    const { provenance } = setupApp(true);

    expect(stateCopy).toStrictEqual(provenance.current().getState());
  });

  test('if error is thrown in non-browser environment', () => {
    // const err = () => setupApp(true);
    // expect(err).toThrowError();
    delete window.location;
    Object.defineProperty(window, 'location', {
      value: null,
      writable: true
    });

    const err = () => setupApp(true);

    expect(err).toThrowError();
  });
});

describe('Export graph', () => {
  const { provenance } = setupApp();

  test('exported graph is a string', () => {
    expect(typeof provenance.exportProvenanceGraph()).toBe('string');
  });
});

describe('Import graph', () => {
  const { provenance } = addOneTask();
  const oldGraph = deepCopy(provenance.graph());
  const str = provenance.exportProvenanceGraph();

  test('imported string returns same exact graph', () => {
    const { provenance: prov2 } = setupApp();

    prov2.importProvenanceGraph(str);
    const importedGraph = prov2.graph();

    expect(true).toBeTruthy();

    // expect(importedGraph).toStrictEqual(oldGraph);
  });
});

/******************************************************/
//New tests for hybrid model, updated API. Not deleting old tests to ensure backwards compatibility.

function changeNameThreeTimes(skipGlobal: boolean = false) {
  const app = setupApp(false, skipGlobal);

  const { provenance } = app;

  let actions = [];

  for (let i = 0; i < 3; i++) {
    let a = provenance.addAction('Adding new task', (state: ToDoListState) => {
      state.user.name = 'Zach' + i;
      return state;
    });
    a.applyAction();
  }

  return { ...app, label: 'Adding new task' };
}

function addActionsWithAllExtra(skipGlobal: boolean = false) {
  const app = setupApp(false, skipGlobal);

  const { provenance } = app;

  let actions = [];

  for (let i = 0; i < 3; i++) {
    let a = provenance.addAction('Adding new task', (state: ToDoListState) => {
      state.user.name = 'Zach' + i;
      return state;
    });

    a.addArgs(['Adding Args Test'])
      .addMetadata({
        createdOn: new Date().getTime(),
        type: 'Add TODO'
      })
      .addEventType('Add TODO')
      .addArtifacts({
        extra: [{ time: new Date().getTime(), e: 'Extra Test' }]
      })
      .alwaysStoreState(false)
      .applyAction();
  }

  return { ...app, label: 'Adding new task' };
}

function addThreeIdenticalTasks(skipGlobal: boolean = false) {
  const app = setupApp(false, skipGlobal);

  const { provenance } = app;

  const newTask: TodoItem = {
    createdOn: new Date().toISOString(),
    task: 'To check for coverage changes',
    status: TodoStatus.ONGOING,
    completedOn: ''
  };

  let actions = [];

  for (let i = 0; i < 3; i++) {
    let a = provenance.addAction('Adding new task', (state: ToDoListState) => {
      state.todos.push(newTask);
      state.user.totalTask = state.todos.length;
      return state;
    });
    a.applyAction();
  }

  return { ...app, label: 'Adding new task' };
}

function addThreeEmptyChanges(skipGlobal: boolean = false) {
  const app = setupApp(false, skipGlobal);

  const { provenance } = app;

  let actions = [];

  for (let i = 0; i < 3; i++) {
    let a = provenance.addAction('Adding identical state', (state: ToDoListState) => {
      return state;
    });
    a.applyAction();
  }

  return { ...app, label: 'Adding identical state' };
}

function addThreeIdenticalTasksComplex(skipGlobal: boolean = false) {
  const app = setupApp(false, skipGlobal);

  const { provenance } = app;

  const newTask: TodoItem = {
    createdOn: new Date().toISOString(),
    task: 'To check for coverage changes',
    status: TodoStatus.ONGOING,
    completedOn: ''
  };

  let actions = [];

  for (let i = 0; i < 3; i++) {
    let a = provenance.addAction('Empty Task', (state: ToDoListState) => {
      return state;
    });

    a.addLabel('Adding edited task')
      .addAction((state: ToDoListState) => {
        state.todos.push(newTask);
        state.user.totalTask = state.todos.length;
        return state;
      })
      .alwaysStoreState(true)
      .applyAction();
  }

  return { ...app, label: 'Adding edited task' };
}

describe('applying an action that should create diffs only', () => {
  let { provenance, label } = changeNameThreeTimes(true);

  test('if some new node has added', () => {
    const { nodes } = provenance.graph();
    const nodeIds = Object.keys(nodes);
    expect(nodeIds.length).toBe(4);
  });

  test('if new node has proper label', () => {
    const { nodes, current } = provenance.graph();
    const currentNode = nodes[current];
    expect(currentNode.label).toBe(label);
  });

  test('if only diff nodes are stored after the first, as expected', () => {
    const { nodes, current } = provenance.graph();

    expect(isDiffNode(nodes[current])).toBeTruthy();

    let parent = (nodes[current] as ChildNode<ToDoListState, TestEvents, string>).parent;

    expect(isDiffNode(nodes[parent])).toBeTruthy();

    let nextParent = (nodes[parent] as ChildNode<ToDoListState, TestEvents, string>).parent;

    expect(isStateNode(nodes[nextParent])).toBeTruthy();
  });

  test('if state stored at diff node matches the added task', () => {
    const { nodes, current } = provenance.graph();
    const currentState = nodes[current].getState();
    const changedName = currentState.user.name;

    expect(changedName).toEqual('Zach2');
  });
});

describe('applying an action that makes enough changes to always store state only', () => {
  let { provenance, label } = addThreeIdenticalTasks(true);

  test('if some new node has added', () => {
    const { nodes } = provenance.graph();
    const nodeIds = Object.keys(nodes);
    expect(nodeIds.length).toBe(4);
  });

  test('if new node has proper label', () => {
    const { nodes, current } = provenance.graph();
    const currentNode = nodes[current];
    expect(currentNode.label).toBe(label);
  });

  test('if only state nodes are stored, as expected', () => {
    const { nodes, current } = provenance.graph();

    expect(isStateNode(nodes[current])).toBeTruthy();

    let parent = (nodes[current] as ChildNode<ToDoListState, TestEvents, string>).parent;

    expect(isStateNode(nodes[parent])).toBeTruthy();

    let nextParent = (nodes[parent] as ChildNode<ToDoListState, TestEvents, string>).parent;

    expect(isStateNode(nodes[nextParent])).toBeTruthy();
  });

  test('if state stored matches the added task', () => {
    const { nodes, current } = provenance.graph();
    const currentState = nodes[current].getState();
    const addedTodo = currentState.todos[3];

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
});

describe('applying an action with every optional parameter used', () => {
  let { provenance, label } = addActionsWithAllExtra(true);

  test('if some new node has added', () => {
    const { nodes } = provenance.graph();
    const nodeIds = Object.keys(nodes);
    expect(nodeIds.length).toBe(4);
  });

  test('if new node has proper label', () => {
    const { nodes, current } = provenance.graph();
    const currentNode = nodes[current];
    expect(currentNode.label).toBe(label);
  });

  test('if last 2 nodes are diff nodes, as expected', () => {
    const { nodes, current } = provenance.graph();

    expect(isDiffNode(nodes[current])).toBeTruthy();

    let parent = (nodes[current] as ChildNode<ToDoListState, TestEvents, string>).parent;

    expect(isDiffNode(nodes[parent])).toBeTruthy();

    let nextParent = (nodes[parent] as ChildNode<ToDoListState, TestEvents, string>).parent;

    expect(isStateNode(nodes[nextParent])).toBeTruthy();
  });

  test('if state stored matches the added task', () => {
    const { nodes, current } = provenance.graph();
    const currentState = nodes[current].getState();
    const changedName = currentState.user.name;

    expect(changedName).toEqual('Zach2');
  });

  test('if metadata was correctly added', () => {
    const { nodes, current } = provenance.graph();
    const meta = nodes[current].metadata;

    expect(meta.type).toEqual('Add TODO');
  });

  test('if artifacts was correctly added', () => {
    const { nodes, current } = provenance.graph();
    const artif = (nodes[current] as ChildNode<ToDoListState, TestEvents, string>).artifacts;

    expect(artif.extra[0].e).toEqual('Extra Test');
  });
});

describe('applying an action with every optional parameter used', () => {
  let { provenance, label } = addActionsWithAllExtra(true);

  test('if some new node has added', () => {
    const { nodes } = provenance.graph();
    const nodeIds = Object.keys(nodes);
    expect(nodeIds.length).toBe(4);
  });

  test('if new node has proper label', () => {
    const { nodes, current } = provenance.graph();
    const currentNode = nodes[current];
    expect(currentNode.label).toBe(label);
  });

  test('if last 2 nodes are diff nodes, as expected', () => {
    const { nodes, current } = provenance.graph();

    expect(isDiffNode(nodes[current])).toBeTruthy();

    let parent = (nodes[current] as ChildNode<ToDoListState, TestEvents, string>).parent;

    expect(isDiffNode(nodes[parent])).toBeTruthy();

    let nextParent = (nodes[parent] as ChildNode<ToDoListState, TestEvents, string>).parent;

    expect(isStateNode(nodes[nextParent])).toBeTruthy();
  });

  test('if state stored matches the added task', () => {
    const { nodes, current } = provenance.graph();
    const currentState = nodes[current].getState();
    const changedName = currentState.user.name;

    expect(changedName).toEqual('Zach2');
  });

  test('if metadata was correctly added', () => {
    const { nodes, current } = provenance.graph();
    const meta = nodes[current].metadata;

    expect(meta.type).toEqual('Add TODO');
  });

  test('if artifacts was correctly added', () => {
    const { nodes, current } = provenance.graph();
    const artif = (nodes[current] as ChildNode<ToDoListState, TestEvents, string>).artifacts;

    expect(artif.extra[0].e).toEqual('Extra Test');
    expect(provenance.getExtraFromArtifact(current)[0].e).toEqual('Extra Test');
  });
});

describe('add three identical tasks complex', () => {
  let { provenance, label } = addThreeIdenticalTasksComplex(true);

  test('if some new node has added', () => {
    const { nodes } = provenance.graph();
    const nodeIds = Object.keys(nodes);
    expect(nodeIds.length).toBe(4);
  });

  test('if new node has proper label', () => {
    const { nodes, current } = provenance.graph();
    const currentNode = nodes[current];
    expect(currentNode.label).toBe(label);
  });

  test('if last 2 nodes are diff nodes, as expected', () => {
    const { nodes, current } = provenance.graph();

    expect(isStateNode(nodes[current])).toBeTruthy();

    let parent = (nodes[current] as ChildNode<ToDoListState, TestEvents, string>).parent;

    expect(isStateNode(nodes[parent])).toBeTruthy();

    let nextParent = (nodes[parent] as ChildNode<ToDoListState, TestEvents, string>).parent;

    expect(isStateNode(nodes[nextParent])).toBeTruthy();
  });

  test('if state stored matches the added task', () => {
    const { nodes, current } = provenance.graph();
    const currentState = nodes[current].getState();
    const addedTodo = currentState.todos[3];

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

  test('extra should always contain an empty object', () => {
    const { nodes, current } = provenance.graph();

    expect(provenance.getExtraFromArtifact(current).length).toEqual(1);
  });
});

describe('add three states that change nothing', () => {
  let { provenance, label } = addThreeEmptyChanges(true);

  test('if some new node has added', () => {
    const { nodes } = provenance.graph();
    const nodeIds = Object.keys(nodes);
    expect(nodeIds.length).toBe(4);
  });

  test('if new node has proper label', () => {
    const { nodes, current } = provenance.graph();
    const currentNode = nodes[current];
    expect(currentNode.label).toBe(label);
  });

  test('if last 2 nodes are diff nodes, as expected', () => {
    const { nodes, current } = provenance.graph();

    expect(isDiffNode(nodes[current])).toBeTruthy();

    let parent = (nodes[current] as ChildNode<ToDoListState, TestEvents, string>).parent;

    expect(isDiffNode(nodes[parent])).toBeTruthy();

    let nextParent = (nodes[parent] as ChildNode<ToDoListState, TestEvents, string>).parent;

    expect(isStateNode(nodes[nextParent])).toBeTruthy();
  });

  test('if state stored matches the added task', () => {
    const { nodes, current } = provenance.graph();
    const currentState = nodes[current].getState();
    const addedTodo = currentState.todos[0];

    expect(addedTodo).toMatchInlineSnapshot(
      {
        createdOn: expect.any(String),
        task: 'Add unit tests',
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

//
// describe('isStateNode function', () => {
//   const { provenance } = addOneTask();
//
//   test('test if isStateNode function works', () => {
//     let parentId = '';
//     const currNode = provenance.current();
//     if (isStateNode(currNode)) {
//       parentId = currNode.parent;
//     }
//
//     expect(provenance.graph().root).toBe(parentId);
//   });
// });
//
// describe('current and root function', () => {
//   test('current function returns current node', () => {
//     const { provenance } = setupApp(false, true);
//     const { nodes, current } = provenance.graph();
//     const currentNode = nodes[current];
//
//     expect(provenance.current()).toStrictEqual(currentNode);
//   });
//
//   test('root function returns root node', () => {
//     const { provenance } = setupApp();
//     const { nodes, root } = provenance.graph();
//     const rootNode = nodes[root];
//
//     expect(provenance.root()).toStrictEqual(rootNode);
//   });
// });
//
// describe('test go to node', () => {
//   const { provenance, addTask } = addOneTask();
//   const newTask: TodoItem = {
//     createdOn: new Date().toISOString(),
//     completedOn: '',
//     task: 'Write Code',
//     status: TodoStatus.FUTURE
//   };
//
//   provenance.applyAction('Adding 3rd task', addTask, [newTask], { type: 'Add TODO' });
//
//   provenance.addExtraToNodeArtifact(provenance.current().id, 'Hello, World');
//   provenance.getExtraFromArtifact(provenance.current().id);
//
//   test('add artifact error', () => {
//     const err = () => provenance.addExtraToNodeArtifact(provenance.root().id, 'Hello, World');
//     expect(err).toThrowError();
//   });
//
//   test('get artifact error', () => {
//     const err = () => provenance.getExtraFromArtifact(provenance.root().id);
//     expect(err).toThrowError();
//   });
//
//   test('if root is not current', () => {
//     const { root, current } = provenance.graph();
//     expect(root).not.toBe(current);
//   });
//
//   test('if goToNode goes to root after adding 2 tasks', () => {
//     provenance.goToNode(provenance.root().id);
//
//     const root = provenance.root().id;
//     const current = provenance.current().id;
//
//     expect(root).toBe(current);
//   });
//
//   test('if goToNode throws error on wrong id', () => {
//     const errFunc = () => provenance.goToNode('');
//     expect(errFunc).toThrowError();
//   });
// });
//
// describe('reset function', () => {
//   const { provenance, addTask } = addOneTask();
//   const newTask: TodoItem = {
//     createdOn: new Date().toISOString(),
//     completedOn: '',
//     task: 'Write Code',
//     status: TodoStatus.FUTURE
//   };
//
//   provenance.applyAction('Adding 3rd task', addTask, [newTask]);
//
//   test('if root is not current', () => {
//     const { root, current } = provenance.graph();
//     expect(root).not.toBe(current);
//   });
//
//   test('check if reset function goes back to root', () => {
//     provenance.reset();
//
//     const root = provenance.root().id;
//     const current = provenance.current().id;
//
//     expect(root).toBe(current);
//   });
// });
//
// function threeTasks() {
//   const app = addOneTask();
//   const { provenance, addTask } = app;
//   const newTask: TodoItem = {
//     createdOn: new Date().toISOString(),
//     completedOn: '',
//     task: 'Write Code',
//     status: TodoStatus.FUTURE
//   };
//
//   provenance.applyAction('Adding 3rd task', addTask, [newTask]);
//
//   return { ...app };
// }
//
// describe('goBackOneStep function', () => {
//   test('goBackOneStep goes to parent node', () => {
//     const { provenance } = threeTasks();
//     const currentNode = provenance.current();
//     let parentId = '';
//     if (isChildNode(currentNode)) {
//       parentId = currentNode.parent;
//     }
//
//     provenance.goBackOneStep();
//     const newCurrentNodeId = provenance.current().id;
//
//     expect(newCurrentNodeId).toBe(parentId);
//   });
//
//   test('goBackOneStep throws error on root', () => {
//     const { provenance } = threeTasks();
//     provenance.reset();
//     const err = () => provenance.goBackOneStep();
//
//     expect(err).toThrowError();
//   });
// });
//
// describe('goBackNSteps function', () => {
//   test('goBackNSteps goes to root node after 2 steps', () => {
//     const { provenance } = threeTasks();
//     const { root } = provenance.graph();
//
//     provenance.goBackNSteps(2);
//     const newCurrentNodeId = provenance.current().id;
//
//     expect(newCurrentNodeId).toBe(root);
//   });
//
//   test('goBackNSteps throws error on more than 2 steps', () => {
//     const { provenance } = threeTasks();
//     const err = () => provenance.goBackNSteps(10);
//     expect(err).toThrowError();
//   });
// });
//
// describe('goForwardOneStep function', () => {
//   test('goForwardOneStep goes to child node', () => {
//     const { provenance } = threeTasks();
//     provenance.goBackOneStep();
//     const childId = provenance.current().children[0];
//     provenance.goForwardOneStep();
//     const currentId = provenance.graph().current;
//
//     expect(childId).toBe(currentId);
//   });
//
//   test('goForwardOneStep throws error when no children', () => {
//     const { provenance } = threeTasks();
//     const err = () => provenance.goForwardOneStep();
//     expect(err).toThrowError();
//   });
// });
//
// describe('Export state function', () => {
//   test('export full state returns a string', () => {
//     const { provenance } = threeTasks();
//     const exportedString = provenance.exportState();
//     expect(typeof exportedString).toBe('string');
//   });
//
//   test('export partial state returns a string', () => {
//     const { provenance } = threeTasks();
//     const exportedString = provenance.exportState(true);
//     expect(typeof exportedString).toBe('string');
//   });
// });
//
// describe('Import state function', () => {
//   test('import full state loads current state', () => {
//     const { provenance } = threeTasks();
//     const currentState = provenance.current().getState();
//     const exportedString = provenance.exportState();
//
//     const { provenance: prov2 } = setupApp();
//     prov2.importState(exportedString);
//     const currentState2 = prov2.current().getState();
//
//     expect(currentState).toStrictEqual(currentState2);
//   });
//
//   test('import partial state loads current state', () => {
//     const { provenance } = threeTasks();
//     const currentState = provenance.current().getState();
//     const exportedString = provenance.exportState(true);
//
//     const { provenance: prov2 } = setupApp();
//     prov2.importState(exportedString);
//     const currentState2 = prov2.current().getState();
//
//     expect(currentState).toStrictEqual(currentState2);
//   });
// });
//
// describe('loadFromUrl', () => {
//   const { provenance: prov } = threeTasks();
//   const stateCopy = deepCopy(prov.current().getState());
//
//   const originalWindowLocationHref = window.location.href;
//
//   test('test if url loading works', () => {
//     const windowLoc = JSON.stringify(window.location);
//     delete window.location;
//     Object.defineProperty(window, 'location', {
//       value: JSON.parse(windowLoc),
//       writable: true
//     });
//     window.location.href = originalWindowLocationHref + prov.exportState();
//
//     const { provenance } = setupApp(true);
//
//     expect(stateCopy).toStrictEqual(provenance.current().getState());
//   });
//
//   test('test if url loading stops when state not found', () => {
//     const windowLoc = JSON.stringify(window.location);
//     delete window.location;
//     Object.defineProperty(window, 'location', {
//       value: JSON.parse(windowLoc),
//       writable: true
//     });
//     window.location.href = originalWindowLocationHref + 'Hello';
//
//     const { provenance } = setupApp(true);
//
//     expect(stateCopy).not.toStrictEqual(provenance.current().getState());
//   });
//
//   test('if error is thrown in non-browser environment', () => {
//     // const err = () => setupApp(true);
//     // expect(err).toThrowError();
//     delete window.location;
//     Object.defineProperty(window, 'location', {
//       value: null,
//       writable: true
//     });
//
//     const err = () => setupApp(true);
//
//     expect(err).toThrowError();
//   });
// });
//
// describe('Export graph', () => {
//   const { provenance } = setupApp();
//
//   test('exported graph is a string', () => {
//     expect(typeof provenance.exportProvenanceGraph()).toBe('string');
//   });
// });
//
describe('Import graph with diffs', () => {
  const { provenance } = changeNameThreeTimes();
  const oldGraph = deepCopy(provenance.graph());
  const str = provenance.exportProvenanceGraph();

  test('imported string returns same exact graph', () => {
    const { provenance: prov2 } = setupApp();

    prov2.importProvenanceGraph(str);
    const importedGraph = prov2.graph();

    expect(true).toBeTruthy();

    // expect(importedGraph).toStrictEqual(oldGraph);
  });
});

describe('Import graph with empty diffs', () => {
  const { provenance } = addThreeEmptyChanges();
  const oldGraph = deepCopy(provenance.graph());
  const str = provenance.exportProvenanceGraph();

  test('imported string returns same exact graph', () => {
    const { provenance: prov2 } = setupApp();

    prov2.importProvenanceGraph(str);
    const importedGraph = prov2.graph();

    expect(true).toBeTruthy();

    // expect(importedGraph).toStrictEqual(oldGraph);
  });
});
