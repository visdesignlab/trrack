/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { createAction, initProvenance } from '../src';

export function print(obj: any) {
  console.log(JSON.stringify(obj, null, 2));
}

export type State = {
  counter: number;
  message: string;
  testArr: string[];
};

export type Events = 'IncreaseCounter' | 'DecreaseCounter' | 'UpdateMessage';

export const initialState: State = {
  counter: 0,
  message: 'Init',
  testArr: ['First Element'],
};

export function setupProvenanceAndAction(
  initState: State = initialState,
  loadFromUrl = false,
  skipDone = false
) {
  const provenance = initProvenance<State, Events>(initState, { loadFromUrl });

  const action = createAction<State, [void], Events>((state: State) => {
    state.counter += 1;
  });

  const ephemeralAction = createAction<State, [void], Events>((state) => {
    state.counter -= 1;
  })
    .setLabel('Ephemeral decrease counter')
    .setActionType('Ephemeral');

  const changeMessageAction = createAction<State, [string], Events>(
    (state: State, msg: string) => {
      state.message = msg;
    }
  ).setLabel('Change Message');

  if (!skipDone) provenance.done();

  return {
    provenance,
    action,
    changeMessageAction,
    ephemeralAction,
  };
}

export type Todo = {
  title: string;
  description: string;
  status: 'complete' | 'incomplete';
};

export type TodoManager = {
  user: string;
  todos: Todo[];
  totalTodos: number;
  totalCompleted: number;
  totalIncomplete: number;
  logs: Set<string>;
  map: Map<string, string>;
};

export type TodoEvents =
  | 'SetName'
  | 'AddTodo'
  | 'RemoveTodo'
  | 'MarkComplete'
  | 'MarkIncomplete'
  | 'Log';

export type TodoArtifacts = {
  notes: string;
};

export const initialTodoState: TodoManager = {
  user: 'Test User',
  todos: [],
  totalTodos: 0,
  totalIncomplete: 0,
  totalCompleted: 0,
  logs: new Set<string>(['log']),
  map: new Map(),
};

export function setupTodoManager() {
  const provenance = initProvenance<TodoManager, TodoEvents, TodoArtifacts>({
    user: 'Test User',
    todos: [],
    totalTodos: 0,
    totalIncomplete: 0,
    totalCompleted: 0,
    logs: new Set(['log']),
    map: new Map(),
  });

  const changeName = createAction<TodoManager, [string], TodoEvents>(
    (state, name: string) => {
      state.user = name;
    }
  )
    .setLabel('Change Name')
    .setEventType('SetName');

  const addTodoAction = createAction<TodoManager, [Todo], TodoEvents>(
    (state, todo: Todo) => {
      state.todos.push(todo);
      if (todo.status === 'incomplete') state.totalIncomplete += 1;
      else state.totalCompleted += 1;
      state.totalTodos += 1;
    }
  )
    .setLabel('Add Todo')
    .setEventType('AddTodo');

  const addLogAction = createAction<TodoManager, [string], TodoEvents>(
    (state, log: string) => {
      state.logs.add(log);
    }
  )
    .setLabel('Log')
    .setEventType('Log');

  const addMapAction = createAction<TodoManager, [string, string], TodoEvents>(
    (state, key, value) => {
      state.map.set(key, value);
    }
  ).setLabel('Map');

  provenance.done();
  return {
    provenance,
    changeName,
    addTodoAction,
    addLogAction,
    addMapAction,
    initState: initialTodoState,
  };
}
export class Test {
  arr: string[] = [];

  constructor(arr: string[]) {
    this.arr = arr;
  }

  add(str: string) {
    this.arr.push(str);
  }

  remove(str: string) {
    this.arr = this.arr.filter((a) => a !== str);
  }

  size() {
    return this.arr.length;
  }

  elements() {
    return this.arr;
  }

  static serialize(obj: Test) {
    return { arr: obj.arr };
  }

  static deserialize(val: any) {
    return new Test(val.arr);
  }
}

export function customSerializerTest() {
  const provenance = initProvenance<Test, void, void>(new Test([]), {
    _serializer: Test.serialize,
    _deserializer: Test.deserialize,
  });

  const action = createAction<Test, [string], void>((state, str) => {
    state.add(str);
  }).setLabel('Add');

  provenance.done();
  return { provenance, action };
}
