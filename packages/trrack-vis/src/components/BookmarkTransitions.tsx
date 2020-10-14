/* eslint-disable no-plusplus */
export default function BookmarkTransitions(
  xOffset: number,
  yOffset: number,
  nodeList: any[],
) {
  xOffset = -xOffset;

  const start = (data: any) => {
    let index = nodeList.findIndex(data);

    const x = 0;
    const y = 40 * index;

    // console.log(y);
    // console.log(index);

    return { x, y: y - yOffset, opacity: 0 };
  };

  const enter = (data: any) => {
    let index = nodeList.findIndex(data);

    const { source, target } = data;

    console.log(data);
    console.log(nodeList);
    console.log(nodeList[0]);

    const x = 0;
    const y = 40 * index;

    // console.log(y);
    // console.log(index);

    return {
      x: [x],
      y: [y],
      opactiy: 1,
    };
  };

  const update = (data: any) => {
    let index = nodeList.findIndex(data);

    // let backboneBundleNodes = findBackboneBundleNodes(nodeMap, bundleMap);
    const x = 0;
    const y = 40 * index;

    // console.log(y);
    // console.log(index);

    return {
      x: [x],
      y: [y],
      opactiy: 1,
    };
  };

  return {
    enter, leave: start, update, start,
  };
}
