import { ProvenanceGraph } from '../Interfaces/ProvenanceGraph';
import {
  RootNode,
  NodeID,
  NodeMetadata,
  Artifacts,
  StateNode,
  DiffNode,
  Diff,
  isStateNode,
  isChildNode,
  isDiffNode,
  Extra
} from '../Interfaces/NodeInterfaces';

import 'firebase/database';
import 'firebase/firestore';

import firebase from 'firebase/app';

type LoggingParams<T, S, A> = {
  participantId: string;
  graph: ProvenanceGraph<T, S, A>;
};

export function initializeFirebase(config: any) {
  const app: firebase.app.App =
    firebase.apps.length === 0 ? firebase.initializeApp(config) : firebase.app();

  const db = firebase.database(app);

  return {
    config,
    app,
    db
  };
}

export function logToFirebase(rtd: firebase.database.Database) {
  let addedNodes: string[] = [];

  return function(graph: ProvenanceGraph<any, any, any>) {
    const path = `${graph.root}`;
    const nodes = Object.keys(graph.nodes);
    const nodeToAdd: string[] = [];
    for (let node of nodes) {
      if (!addedNodes.includes(node)) {
        nodeToAdd.push(node);
        addedNodes.push(node);
      }
    }

    nodeToAdd.forEach(node => {
      const actualNode = JSON.parse(JSON.stringify(graph.nodes[node]));

      rtd
        .ref(`${path}/nodes/${node}`)
        .set(actualNode)
        .then(() => {
          const log = {
            time: Date.now(),
            status: 'error',
            currentNodeId: graph.current
          };
        })
        .catch(err => {
          throw new Error('Something went wrong while logging.');
        });
    });
  };
}
