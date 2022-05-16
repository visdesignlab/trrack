import { Graph } from './graph';
import { ProvenanceNode } from './provenance-nodes';

export type ProvenanceGraph<Event, Metadata> = Graph<
  ProvenanceNode<Event, Metadata>
> & {
  PROV_VERSION: string;
  sessionName?: {
    value: string;
    lastModified: number;
  };
  authors?: {
    value: any[];
    lastModified: number;
  };
};
