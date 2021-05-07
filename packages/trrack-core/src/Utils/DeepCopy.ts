/* eslint-disable no-shadow */
// TODO:: Fix typing, target shouldnt be of type T.

// eslint-disable-next-line no-unused-vars
export default function deepCopy<T>(target: T): T {
  return JSON.parse(JSON.stringify(target));
}
