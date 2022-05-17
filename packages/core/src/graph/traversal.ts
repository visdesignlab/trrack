import { GraphTraversalRecord } from '../tracker';

/**
 * Actual LCA algorithm
 * @param current Source node
 * @param destination Destination node
 * @param graphRecord Level and parent list of graph records
 * @returns least common ancestor of both current and destination nodes
 */
function LCA(
  current: string,
  destination: string,
  graphRecord: GraphTraversalRecord
) {
  let [source, target] = [current, destination];
  if (graphRecord.levelList[source] > graphRecord.levelList[target]) {
    [source, target] = [target, source];
  }

  let diff = graphRecord.levelList[target] - graphRecord.levelList[source];

  while (diff !== 0) {
    target = graphRecord.parentList[target];
    diff -= 1;
  }

  if (source === target) {
    return source;
  }

  while (source !== target) {
    source = graphRecord.parentList[source];
    target = graphRecord.parentList[target];
  }

  return source;
}

/**
 * Determine a path between current and destination using LCA algorithm.
 * @param current The node the graph currently is at.
 * @param destination The node we want to go to.
 * @param graphRecord Level and Parent list to determine LCA.
 * @returns A string of node ids which indicate the path.
 */
export function getPathToNode(
  current: string,
  destination: string,
  graphRecord: GraphTraversalRecord
) {
  const lca = LCA(current, destination, graphRecord);

  const pathFromSourceToLca: string[] = [];
  const pathFromTargetToLca: string[] = [];

  let [source, target] = [current, destination];

  while (source !== lca) {
    pathFromSourceToLca.push(source);
    source = graphRecord.parentList[source];
  }
  pathFromSourceToLca.push(source);

  while (target !== lca) {
    pathFromTargetToLca.push(target);
    target = graphRecord.parentList[target];
  }

  const path = [...pathFromSourceToLca, ...pathFromTargetToLca.reverse()];
  return path;
}

/**
 *  Determine if we are going up when we move from source to target
 * @param source - Where we start
 * @param target  - Where we end
 * @param graphRecord - Leve and parent list
 * @returns True if we are going up in the provenance graph, else return false.
 * Throw an error if both the nodes are disconnected
 */
export function isNextNodeUp(
  source: string,
  target: string,
  graphRecord: GraphTraversalRecord
): boolean {
  if (graphRecord.parentList[source] === target) {
    return true;
  } else if (graphRecord.parentList[target] === source) {
    return false;
  }

  throw new Error(
    `Illegal use of function. Nodes ${source} and ${target} are not connected.`
  );
}
