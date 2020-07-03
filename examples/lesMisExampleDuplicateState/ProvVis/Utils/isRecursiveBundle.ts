import { BundleMap } from '../Utils/BundleMap';
import findBundleParent from "../Utils/findBundleParent";

//Using this function for one of the collapsing options. not yet finished.

export default function isRecursiveParent(nodeId:string, nodeList:any, bundledNodes:any, expandedClusterList:any, bundleMap?: BundleMap): string {
  return '';
  // let curr = nodeList.filter(function(d:any) {
  //   return d.id === nodeId;
  // })[0];
  //
  // if(!bundleMap)
  //   return '';
  //
  // console.log("FINDING PARENT FOR: ", nodeId);
  //
  //
  // while (true) {
  //   if(curr === undefined)
  //     return '';
  //
  //   console.log(expandedClusterList);
  //   console.log(curr.parent);
  //   console.log(bundledNodes.includes(curr.parent));
  //
  //   console.log(findBundleParent(curr.parent, bundleMap));
  //
  //   if(bundledNodes.includes(curr.parent) && !(expandedClusterList.includes(findBundleParent(curr.parent, bundleMap))) ){
  //     console.log(bundleMap);
  //     console.log(findBundleParent(curr.parent, bundleMap));
  //     console.log(expandedClusterList);
  //     return findBundleParent(curr.parent, bundleMap);
  //   }
  //
  //   let temp = nodeList.filter(function(d:any) {
  //     return d.id === curr.parent;
  //   })[0];
  //
  //   curr = temp;
  // }
}
