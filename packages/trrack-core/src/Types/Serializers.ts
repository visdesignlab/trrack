export type JsonValue = {
  [key: string]: JsonValue | number | string | unknown[];
};

export type Serializer<T> = (obj: T) => JsonValue;

export type Deserializer<T> = (obj: JsonValue) => T;
