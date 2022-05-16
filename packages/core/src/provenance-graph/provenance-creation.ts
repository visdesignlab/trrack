import { PROV_VERSION } from '..';
import { getUUID } from '../utils/uuid-generator';
import { ActionNode, ProvenanceNode, RootNode } from './provenance-nodes';
import { ProvenanceGraph } from './types';

export function createRootNode<Metadata>(meta?: Metadata): RootNode<Metadata> {
  return {
    id: getUUID(),
    parent: 'None',
    children: [],
    type: 'RootNode',
    label: 'Root',
    metadata: {
      createdOn: Date.now(),
      eventType: 'Creation',
      data: meta,
    },
  };
}

export function createProvenanceGraph<Event, Metadata>(
  sessionName?: string,
  authors?: string[],
  rootMetadata?: Metadata
): ProvenanceGraph<Event, Metadata> {
  const root = createRootNode(rootMetadata);

  const nodes = {
    [root.id]: root,
  };

  const graph: ProvenanceGraph<Event, Metadata> = {
    current: root.id,
    root: root.id,
    nodes,
    PROV_VERSION,
  };

  if (sessionName) {
    graph.sessionName = {
      value: sessionName,
      lastModified: root.metadata.createdOn,
    };
  }

  if (authors) {
    graph.authors = {
      value: authors,
      lastModified: root.metadata.createdOn,
    };
  }

  return graph;
}

export function addNewActionNode<Event, Metadata>(
  label: string,
  parent: ProvenanceNode<Event, Metadata>,
  event: Event
): ActionNode<Event, Metadata> {
  const actionNode: ActionNode<Event, Metadata> = {
    id: getUUID(),
    children: [],
    label,
    metadata: {
      createdOn: Date.now(),
      eventType: event,
    },
    parent: parent.id,
    type: 'ActionNode',
  };

  parent.children.push(actionNode.id);

  return actionNode;
}
