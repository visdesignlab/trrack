import { BundleMap } from '../Utils/BundleMap';

export default function findBundleParent(nodeId:string, bundleMap?: BundleMap): string[] {
  // Find nodes in the clusters whose entire cluster is on the backbone.

  let parentList = []
  for (let bundle in bundleMap) {
    if(bundleMap[bundle].bunchedNodes.includes(nodeId))
    {
      parentList.push(bundle);
    }
  }

  return parentList;
}
