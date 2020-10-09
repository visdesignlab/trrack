import { BundleMap } from '../Utils/BundleMap';

export default function findBundleParent(nodeId: string, bundleMap?: BundleMap): string[] {
  let parentList = [];
  for (let bundle in bundleMap) {
    if (bundleMap[bundle].bunchedNodes.includes(nodeId)) {
      parentList.push(bundle);
    }
  }

  return parentList;
}
