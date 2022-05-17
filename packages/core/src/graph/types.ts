import { ProvenanceNode } from './nodes';

export type ProvenanceGraph = {
  nodes: { [key: string]: ProvenanceNode };
  current: string;
  root: string;
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
