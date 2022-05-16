export type GraphNode<IDType = string> = {
  id: IDType;
  parent: IDType | 'None';
  children: IDType[];
};

export type RootGraphNode<IDType> = GraphNode<IDType> & {
  parent: 'None';
};

type IDType<T extends GraphNode<string | number>> = T[keyof Pick<T, 'id'>];

export type Graph<Node extends GraphNode<string | number>> = {
  nodes: { [key in IDType<Node>]: Node };
  current: IDType<Node>;
  root: IDType<Node>;
};
