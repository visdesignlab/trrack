import { GraphNode } from '../graph';

type EventType<Event> = Event | 'Creation';

export type NodeMetadata<Event, Metadata> = {
  createdOn: number;
  eventType: EventType<Event>;
  data?: Metadata;
};

type ArtifactBase = {
  timestamp: number;
};

export type Annotation = ArtifactBase & {
  annotation: string;
};

export type Artifact<ArtifactType> = ArtifactBase & {
  artifact: ArtifactType;
};

type NodeType = 'RootNode' | 'ActionNode' | 'StateNode';

export type BaseNode<Event, Metadata> = GraphNode & {
  label: string;
  metadata: NodeMetadata<Event, Metadata>;
  type: NodeType;
};

export type RootNode<Metadata> = BaseNode<'Creation', Metadata> & {
  type: 'RootNode';
  parent: 'None';
};

export type ArgArray = readonly unknown[];

export type ActionRecord<T extends ArgArray> = {
  name: string;
  args: {
    do: T;
    undo: T;
  };
};

export type ActionNode<Event, Metadata> = BaseNode<Event, Metadata> & {
  type: 'ActionNode';
};

export type ProvenanceNode<Event, Metadata> =
  | RootNode<Metadata>
  | ActionNode<Event, Metadata>;
