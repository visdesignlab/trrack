import { getX } from "./LinkTransitions";
import { BundleMap } from "../Utils/BundleMap";

export default function bundleTransitions(
  xOffset: number,
  yOffset: number,
  clusterOffset: number,
  backboneOffset: number,
  duration: number = 500,
  expandedClusterList: string[],
  stratifiedMap: any,
  nodeList: any[],
  annotationOpen: number,
  annotationHeight: number,
  bundleMap?: BundleMap
) {
  xOffset = -xOffset;
  backboneOffset = -backboneOffset;
  const start = () => {
    return { x: 0, y: 0, opacity: 0 };
  };

  const enter = (data: any) => {
    let validity = true;

    const x = getX(stratifiedMap[data].width, xOffset, backboneOffset);

    // let backboneBundleNodes = findBackboneBundleNodes(stratifiedMap, bundleMap)

    let highestDepth = stratifiedMap[data].depth;
    let lowestDepth = stratifiedMap[data].depth;

    if (bundleMap && expandedClusterList.includes(data)) {
      for (let i = 0; i < bundleMap[data].bunchedNodes.length; i++) {
        // if(stratifiedMap[bundleMap[data].bunchedNodes[i]].width != 0)
        // {
        //   validity = false;
        // }
        if (
          stratifiedMap[bundleMap[data].bunchedNodes[i]] && stratifiedMap[bundleMap[data].bunchedNodes[i]].depth < highestDepth
        ) {
          highestDepth = stratifiedMap[bundleMap[data].bunchedNodes[i]].depth;
        }

        if (
          stratifiedMap[bundleMap[data].bunchedNodes[i]] && stratifiedMap[bundleMap[data].bunchedNodes[i]].depth > lowestDepth
        ) {
          lowestDepth = stratifiedMap[bundleMap[data].bunchedNodes[i]].depth;
        }
      }
    }

    let y = yOffset * highestDepth;

    if (annotationOpen !== -1 && highestDepth > annotationOpen) {
      y += annotationHeight;
    }

    let height = 0;

    for(let j in bundleMap![data].bunchedNodes)
    {
      if(stratifiedMap[bundleMap![data].bunchedNodes[j]])
      {
        height++
      }
    }

    height = clusterOffset * height;

    if (!expandedClusterList.includes(data)) {
      height = 10;
    }

    if (
      annotationOpen !== -1 &&
      annotationOpen >= highestDepth &&
      annotationOpen <= lowestDepth
    ) {
      height += annotationHeight;
    }

    return {
      x: [x],
      y: [y],
      opacity: [!expandedClusterList.includes(data) ? 0 : 1],
      timing: { duration },
      validity: validity,
      height: height
    };
  };

  const update = (data: any) => {
    let validity = true;

    const x = getX(stratifiedMap[data].width, xOffset, backboneOffset);

    // let backboneBundleNodes = findBackboneBundleNodes(stratifiedMap, bundleMap)

    let highestDepth = stratifiedMap[data].depth;
    let lowestDepth = stratifiedMap[data].depth;

    if (bundleMap && expandedClusterList.includes(data)) {
      for (let i = 0; i < bundleMap[data].bunchedNodes.length; i++) {
        // if(stratifiedMap[bundleMap[data].bunchedNodes[i]].width != 0)
        // {
        //   validity = false;
        // }
        if (
          stratifiedMap[bundleMap[data].bunchedNodes[i]] && stratifiedMap[bundleMap[data].bunchedNodes[i]].depth < highestDepth
        ) {
          highestDepth = stratifiedMap[bundleMap[data].bunchedNodes[i]].depth;
        }

        if (
          stratifiedMap[bundleMap[data].bunchedNodes[i]] && stratifiedMap[bundleMap[data].bunchedNodes[i]].depth > lowestDepth
        ) {
          lowestDepth = stratifiedMap[bundleMap[data].bunchedNodes[i]].depth;
        }
      }
    }

    let y = yOffset * highestDepth;

    if (annotationOpen !== -1 && highestDepth > annotationOpen) {
      y += annotationHeight;
    }

    let height = 0;
    for(let j in bundleMap![data].bunchedNodes)
    {
      if(stratifiedMap[bundleMap![data].bunchedNodes[j]])
      {
        height++
      }
    }

    height = clusterOffset * height;

    if (!expandedClusterList.includes(data)) {
      height = 10;
    }

    if (
      annotationOpen !== -1 &&
      annotationOpen >= highestDepth &&
      annotationOpen <= lowestDepth
    ) {
      height += annotationHeight;
    }

    return {
      x: [x],
      y: [y],
      opacity: [!expandedClusterList.includes(data) ? 0 : 1],
      timing: { duration },
      validity: validity,
      height: [height]
    };
  };
  return { enter, leave: start, update, start };
}
