import { BundleMap } from '../Utils/BundleMap';

export default function findBackboneBundleNodes(nodeMap: any, bundleMap?: BundleMap): string[] {
  let backboneBundleNodes = [];

  // Find nodes in the clusters whose entire cluster is on the backbone.
  for (let bundle in bundleMap) {
    let flag = true;

    if (nodeMap[bundle].width !== 0) {
      flag = false;
    }

    for (let i of bundleMap[bundle].bunchedNodes) {
      if (nodeMap[i].width !== 0) {
        flag = false;
      }
    }

    if (flag) {
      backboneBundleNodes.push(bundle);
      for (let n of bundleMap[bundle].bunchedNodes) {
        backboneBundleNodes.push(n);
      }
    }
  }

  return backboneBundleNodes;
}
