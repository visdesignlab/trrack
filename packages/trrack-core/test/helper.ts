import { initProvenance, createAction } from '../src';

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
  initState: State,
  loadFromUrl: boolean = false,
  skipDone: boolean = false,
) {
  const provenance = initProvenance<State, Events>(initState, { loadFromUrl });

  const action = createAction<State, Events>((state: State) => {
    state.counter += 1;
  });

  const ephemeralAction = createAction<State, Events>((state) => {
    state.counter -= 1;
  })
    .setLabel('Ephemeral decrease counter')
    .setActionType('Ephemeral');

  const changeMessageAction = createAction<State, Events>(
    (state: State, msg: string) => {
      state.message = msg;
    },
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
  logs: string[];
};

export type TodoEvents =
  | 'SetName'
  | 'AddTodo'
  | 'RemoveTodo'
  | 'MarkComplete'
  | 'MarkIncomplete';

export type TodoArtifacts = {
  notes: string;
};

export const initialTodoState: TodoManager = {
  user: 'Test User',
  todos: [],
  totalTodos: 0,
  totalIncomplete: 0,
  totalCompleted: 0,
  logs: [],
};

export function setupTodoManager() {
  const provenance = initProvenance<TodoManager, TodoEvents, TodoArtifacts>(
    initialTodoState,
  );

  const changeName = createAction<TodoManager, TodoEvents>(
    (state, name: string) => {
      state.user = name;
    },
  )
    .setLabel('Change Name')
    .setEventType('SetName');

  const addTodoAction = createAction<TodoManager, TodoEvents>(
    (state, todo: Todo) => {
      state.todos.push(todo);
      if (todo.status === 'incomplete') state.totalIncomplete += 1;
      else state.totalCompleted += 1;
      state.totalTodos += 1;
    },
  )
    .setLabel('Add Todo')
    .setEventType('AddTodo');

  provenance.done();
  return {
    provenance,
    changeName,
    addTodoAction,
    initState: initialTodoState,
  };
}
