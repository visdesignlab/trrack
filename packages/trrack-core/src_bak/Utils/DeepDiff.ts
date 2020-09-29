const diff = require('deep-diff').diff;
import { Diff } from '../Interfaces/NodeInterfaces';

export default function deepDiff<T>(obj1: T, obj2: T): Diff[] | undefined {
  return diff(obj1, obj2);
}
