import { diff } from 'deep-diff';

export default function differ<T>(obj1: T, obj2: T) {
  return diff(obj1, obj2);
}
