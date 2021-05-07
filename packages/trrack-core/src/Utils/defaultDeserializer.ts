import { JsonValue } from '../Types/Serializers';

function defaultDeserializer<T>(o: JsonValue): T {
  const str = JSON.stringify(o);
  const obj = JSON.parse(str, (_, val) => {
    if (!val) return val;

    if (val.type && val.type === 'Set') {
      return new Set(val.arr);
    }
    if (val.type && val.type === 'Map') {
      return new Map(Object.entries(val.obj));
    }
    return val;
  });

  return obj;
}

export default defaultDeserializer;
