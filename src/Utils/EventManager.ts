import { SubscriberFunction, ArtifactSubscriberFunction } from '../Interfaces/Provenance';
import { Diff, ProvenanceNode, isStateNode, StateNode } from '../Interfaces/NodeInterfaces';

const GLOBAL: string = 'GLOBAL';
const ARTIFACT: string = 'ARTIFACT';

export interface EventManager<T, S, A> {
  callEvents: (diffs: Diff[], state: T, node: ProvenanceNode<T, S, A>) => void;
  addObserver: (propPath: string[], func: SubscriberFunction<T>) => void;
  addGlobalObserver: (func: SubscriberFunction<T>) => void;
  addArtifactObserver: (func: ArtifactSubscriberFunction<A>) => void;
}

export function initEventManager<T, S, A>(): EventManager<T, S, A> {
  const eventRegistry: {
    [key: string]: SubscriberFunction<T>[];
  } = {};

  const artifactEventRegistry: {
    [key: string]: ArtifactSubscriberFunction<A>[];
  } = {};

  function callGlobalEvents(state: T) {
    if (eventRegistry[GLOBAL] && eventRegistry[GLOBAL].length > 0) {
      eventRegistry[GLOBAL].forEach(f => f(state));
    }
  }

  function callArtifactEvents(node: StateNode<T, S, A>) {
    if (artifactEventRegistry[ARTIFACT] && artifactEventRegistry[ARTIFACT].length > 0) {
      if (isStateNode(node)) {
        if (node.artifacts.extra) {
          const extra = node.artifacts.extra || [];
          artifactEventRegistry[ARTIFACT].forEach(f => f(extra));
        }
      }
    }
  }

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
    addArtifactObserver: (func: ArtifactSubscriberFunction<A>) => {
      if (!artifactEventRegistry[ARTIFACT]) {
        artifactEventRegistry[ARTIFACT] = [];
      }
      artifactEventRegistry[ARTIFACT].push(func);
    },
    callEvents: (diffs: Diff[], state: T, node: ProvenanceNode<T, S, A>) => {
      if (diffs.length === 0) return;

      callGlobalEvents(state);
      if (isStateNode(node)) {
        callArtifactEvents(node);
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
