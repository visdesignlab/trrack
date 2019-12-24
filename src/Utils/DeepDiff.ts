import * as DD from 'deep-diff';
import { Diff } from '../Interfaces/NodeInterfaces';

export default function deepDiff<T>(obj1: T, obj2: T): Diff[] {
  const diffs: Diff[] = [];

  const changes = DD.diff(obj1, obj2);

  if (changes) {
    changes.forEach((change: any) => {
      const { path: diffedKey, lhs: prevValue, rhs: currValue } = change;

      diffs.push({
        diffedKey,
        prevValue,
        currValue
      });
    });
  }

  return diffs;
}
