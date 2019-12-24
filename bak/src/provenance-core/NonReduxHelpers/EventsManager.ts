import Global from './Global';

export type SubscriberFunction<T> = (state?: T) => void;

export interface EventManager<T> {
  callEvents: (prevState: T, newState: T) => void;
  addGlobalObserver: (func: SubscriberFunction<T>) => void;
  addObserver: (propPath: string, func: SubscriberFunction<T>) => void;
}

export function initEventManager<T>(): EventManager<T> {
  const eventRegistry: { [key: string]: SubscriberFunction<T>[] } = {};
  return {
    addGlobalObserver: (func: SubscriberFunction<T>) => {
      if (!eventRegistry[Global]) eventRegistry[Global] = [];
      eventRegistry[Global].push(func);
    },
    addObserver: (propPath: string, func: SubscriberFunction<T>) => {
      if (!eventRegistry[propPath]) eventRegistry[propPath] = [];
      eventRegistry[propPath].push(func);
    },
    callEvents: (prevState: T, newState: T) => {
      if (eventRegistry[Global]) {
        if (prevState !== newState) eventRegistry[Global].forEach(f => f(newState));
        return;
      }

      Object.keys(eventRegistry).forEach(path => {
        const paths = path.split('.');
        const prevValue = paths.reduce((prev, curr) => {
          return prev && prev[curr];
        }, prevState);
        const newValue = paths.reduce((prev, curr) => {
          return prev && prev[curr];
        }, newState);

        if (!(prevValue && newValue)) throw new Error(`Path ${path} is illegal.`);

        if (JSON.stringify(prevValue) !== JSON.stringify(newValue)) {
          eventRegistry[path].forEach(f => f(newState));
        }
      });
    }
  };
}
