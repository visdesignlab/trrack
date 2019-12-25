import { SubscriberFunction } from '../Interfaces/Provenance';
import { Diff } from '../Interfaces/NodeInterfaces';

const GLOBAL: string = 'GLOBAL';

export interface EventManager<T> {
  callEvents: (diffs: Diff[], state: T) => void;
  addObserver: (propPath: string[], func: SubscriberFunction<T>) => void;
  addGlobalObserver: (func: SubscriberFunction<T>) => void;
}

export function initEventManager<T>(): EventManager<T> {
  const eventRegistry: { [key: string]: SubscriberFunction<T>[] } = {};

  return {
    addGlobalObserver: (func: SubscriberFunction<T>) => {
      if (!eventRegistry[GLOBAL]) {
        eventRegistry[GLOBAL] = [];
      }
      eventRegistry[GLOBAL].push(func);
    },
    addObserver: (propPath: string[], func: SubscriberFunction<T>) => {
      const path = propPath.join('|');
      if (!eventRegistry[path]) {
        eventRegistry[path] = [];
      }
      eventRegistry[path].push(func);
    },
    callEvents: (diffs: Diff[], state: T) => {
      if (diffs.length === 0) return;

      if (eventRegistry[GLOBAL]) {
        eventRegistry[GLOBAL].forEach(f => f(state));
      }

      const diffStrings: string[] = [];

      diffs.forEach((diff: Diff) => {
        const pathArr = diff.path;
        const changedPaths: string[] = [];

        const diffStr = pathArr.join('|');
        if (!diffStrings.includes(diffStr)) {
          diffStrings.push(diffStr);
        } else {
          return;
        }

        pathArr.forEach(path => {
          if (changedPaths.length === 0) {
            changedPaths.push(path);
          } else {
            changedPaths.push([changedPaths.reverse()[0], path].join('|'));
          }
        });

        changedPaths.reverse().forEach(cp => {
          if (eventRegistry[cp]) {
            eventRegistry[cp].forEach(f => f(state));
          }
        });
      });
    }
  };
}
