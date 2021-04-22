/* eslint-disable no-shadow */
// TODO:: Fix typing, target shouldnt be of type T.

// eslint-disable-next-line no-unused-vars
export default function deepCopy<T>(target: T, deserialize : ((t: any) => T)): T {
  if (target instanceof Array) {
    const cp = [] as any[];
    (target as any[]).forEach((v) => {
      cp.push(v);
    });
    return cp.map((n: any) => deepCopy<any>(n, deserialize)) as any;
  }
  if (typeof target === 'object' && target !== {}) {
    const cp = { ...(target as { [key: string]: any }) } as {
      [key: string]: any;
    };
    Object.keys(cp).forEach((k) => {
      cp[k] = deepCopy<any>(cp[k], deserialize);
    });
    return cp as T;
  }

  return deserialize(target);
}

// To add support for other types, this is where it would be done.
// Also is where I should add the ability to pass in serializers.
export const givenSerialize = <T>(obj: T) => {
  const str = JSON.stringify(obj, (_, val) => {
    if (val instanceof Set) {
      return {
        type: 'Set',
        arr: Array.from(val),
      };
    }
    return val;
  });

  return JSON.parse(str);
};

export const givenDeserialize = <T> (o: any) : T => {
  const str = JSON.stringify(o);
  const obj = JSON.parse(str, (_, val) => {
    if (val.type && val.type === 'Set') {
      return new Set(val.arr);
    }
    return val;
  });

  return obj;
};
