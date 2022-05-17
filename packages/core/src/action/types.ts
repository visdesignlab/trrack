export type Action = {
  registry_name: string;
  label: string;
  do: {
    args: any[];
  };
  undo: {
    args: any[];
  };
};
