import { BundleMap } from '../Utils/BundleMap';
import findBundleParent from '../Utils/findBundleParent';
import { getX } from './LinkTransitions';

export default function nodeTransitions(
  xOffset: number,
  yOffset: number,
  clusterOffset: number,
  backboneOffset: number,
  duration: number = 500,
  nodeList: any[],
  nodeMap: any,
  annotationOpen: number,
  annotationHeight: number,
  bundleMap?: BundleMap
) {
  xOffset = -xOffset;
  backboneOffset = -backboneOffset;
  const start = (data: any) => {
    let clusteredNodesInFront = 0;

    const x = getX(data.width, xOffset, backboneOffset);

    let parentId = findBundleParent(data.id, bundleMap).filter((d) => {
      return nodeMap[d].width === 0;
    })[0];

    clusteredNodesInFront =
      clusteredNodesInFront === 0
        ? clusteredNodesInFront
        : clusteredNodesInFront - 1;

    let y =
      yOffset * data.depth - (yOffset - clusterOffset) * clusteredNodesInFront;

    if (
      parentId !== undefined &&
      bundleMap &&
      !Object.keys(bundleMap).includes(data.id)
    ) {
      y =
        yOffset *
          (nodeMap[parentId].depth -
            bundleMap[parentId].bunchedNodes.length +
            2) -
        (yOffset - clusterOffset) * clusteredNodesInFront;
    }

    if (
      annotationOpen !== -1 &&
      data.depth > annotationOpen &&
      data.width === 0
    ) {
      y += annotationHeight;
    }

    return { x: x, y: y - yOffset, opacity: 0 };
  };

  const enter = (data: any) => {
    // let backboneBundleNodes = findBackboneBundleNodes(nodeMap, bundleMap);

    let clusteredNodesInFront = 0;

    // for (let i = 0; i < nodeList.length; i++) {
    //   if (
    //     data.width === 0 &&
    //     nodeList[i].width === 0 &&
    //     nodeList[i].depth <= data.depth &&
    //     backboneBundleNodes.includes(nodeList[i].id)
    //   ) {
    //     clusteredNodesInFront++;
    //   }
    // }

    const x = getX(data.width, xOffset, backboneOffset);

    clusteredNodesInFront =
      clusteredNodesInFront === 0
        ? clusteredNodesInFront
        : clusteredNodesInFront - 1;

    let y =
      yOffset * data.depth - (yOffset - clusterOffset) * clusteredNodesInFront;

    if (
      annotationOpen !== -1 &&
      data.depth > annotationOpen &&
      data.width === 0
    ) {
      y += annotationHeight;
    }

    return {
      x: [x],
      y: [y],
      opactiy: 1,
      timing: { duration },
    };
  };

  const update = (data: any) => {
    // let backboneBundleNodes = findBackboneBundleNodes(nodeMap, bundleMap);

    let clusteredNodesInFront = 0;

    // for (let i = 0; i < nodeList.length; i++) {
    //   if (
    //     data.width === 0 &&
    //     nodeList[i].width === 0 &&
    //     nodeList[i].depth <= data.depth &&
    //     backboneBundleNodes.includes(nodeList[i].id)
    //   ) {
    //     clusteredNodesInFront++;
    //   }
    // }

    const x = getX(data.width, xOffset, backboneOffset);

    clusteredNodesInFront =
      clusteredNodesInFront === 0
        ? clusteredNodesInFront
        : clusteredNodesInFront - 1;

    let y =
      yOffset * data.depth - (yOffset - clusterOffset) * clusteredNodesInFront;

    if (
      annotationOpen !== -1 &&
      data.depth > annotationOpen &&
      data.width === 0
    ) {
      y += annotationHeight;
    }

    return {
      x: [x],
      y: [y],
      opactiy: 1,
      timing: { duration },
    };
  };

  return { enter, leave: start, update, start };
}
