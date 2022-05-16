export type ArgArray = readonly unknown[];

export type IrreversibleAction<DoArgs extends ArgArray> = {
  do: string;
  doArguments: DoArgs;
};

export type ReversibleAction<
  DoArgs extends ArgArray,
  UndoArgs extends ArgArray
> = IrreversibleAction<DoArgs> & {
  undo: string;
  undoArgs: UndoArgs;
};

export type Action<DoArgs extends ArgArray, UndoArgs extends ArgArray> =
  | ReversibleAction<DoArgs, UndoArgs>
  | IrreversibleAction<DoArgs>;

export type ActionFunction<Args extends ArgArray = any, Return = any> = (
  ...args: Args
) => PromiseLike<Return>;
