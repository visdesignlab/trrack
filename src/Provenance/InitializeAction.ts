import { Action } from '../Interfaces/ActionObject';

import { ActionFunction } from '../Interfaces/Provenance';

export default function createAction<T, S, A>(
  initialState: T,
  initialAction: ActionFunction<T>
): Action<T, S, A> {
  const action: Action<T, S, A> = new Action<T, S, A>(initialAction);
  return action;
}
