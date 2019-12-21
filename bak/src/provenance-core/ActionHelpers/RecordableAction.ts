export interface RecordableAction<T> {
  label: string;
  action: (...args: unknown[]) => T;
  args: unknown[];
  thisArg?: unknown;
}
