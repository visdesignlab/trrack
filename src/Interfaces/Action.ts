export type ActionType = 'Ephemeral' | 'Regular';

export type ActionObject<T> = {
  setLabel: (label: string) => ActionObject<T>;
  setArgs: (args: any[]) => ActionObject<T>;
  setActionType: (actionType: ActionType) => ActionObject<T>;
  apply: (state: T, ...args: any[]) => ActionReturnType<T>;
};

export type ActionReturnType<T> = {
  state: T;
  label: string;
  complex: boolean;
  ephemeral: boolean;
};

export type ActionFunction<T> = (state: T, ...args: any[]) => T;
