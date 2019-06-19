export function generateUUID(): string {
  // Public domain/MIT
  let d = new Date().getTime();

  if (
    typeof performance !== "undefined" &&
    typeof performance.now === "function"
  ) {
    d += performance.now();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    let r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function generateTimeStamp(): number {
  return new Date().getTime();
}

export function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

export function deepCopyReadonly<T>(obj: T): Readonly<T> {
  return JSON.parse(JSON.stringify(obj)) as Readonly<T>;
}
