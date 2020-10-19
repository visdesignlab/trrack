import { diff } from 'deep-diff';

export default function deepDiff<T>(obj1: T, obj2: T) {
  return diff(obj1, obj2);
}
