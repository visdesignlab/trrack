export default function linkTransitions(
  xOffset: number,
  yOffset: number,
  clusterOffset: number,
  backboneOffset: number,
  duration = 500,
  annotationOpen: number,
  annotationHeight: number
) {
  xOffset = -xOffset;
  backboneOffset = -backboneOffset;
  const start = () => ({
    x1: 0,
    x2: 0,
    y1: 0,
    y2: 0,
    opacity: 0,
  });

  const enter = (data: any) => {
    let clusteredNodesInFront = 0;

    // eslint-disable-next-line max-len
    clusteredNodesInFront =
      clusteredNodesInFront === 0
        ? clusteredNodesInFront
        : clusteredNodesInFront - 1;

    const { source, target } = data;
    const x1 = getX(source.width, xOffset, backboneOffset);
    const x2 = getX(target.width, xOffset, backboneOffset);

    let y1 =
      yOffset * source.depth -
      (yOffset - clusterOffset) * clusteredNodesInFront;
    let y2 =
      yOffset * target.depth -
      (yOffset - clusterOffset) * clusteredNodesInFront;

    if (
      annotationOpen !== -1 &&
      source.depth > annotationOpen &&
      source.width === 0
    ) {
      y1 += annotationHeight;
    }

    if (
      annotationOpen !== -1 &&
      target.depth > annotationOpen &&
      target.width === 0
    ) {
      y2 += annotationHeight;
    }

    return {
      x1,
      x2,
      y1,
      y2,
      opacity: 1,
      timing: { duration },
    };
  };

  const update = (data: any) => {
    let clusteredNodesInFront = 0;

    // eslint-disable-next-line max-len
    clusteredNodesInFront =
      clusteredNodesInFront === 0
        ? clusteredNodesInFront
        : clusteredNodesInFront - 1;

    const { source, target } = data;
    const x1 = getX(source.width, xOffset, backboneOffset);
    const x2 = getX(target.width, xOffset, backboneOffset);

    let y1 =
      yOffset * source.depth -
      (yOffset - clusterOffset) * clusteredNodesInFront;
    let y2 =
      yOffset * target.depth -
      (yOffset - clusterOffset) * clusteredNodesInFront;

    if (
      annotationOpen !== -1 &&
      source.depth > annotationOpen &&
      source.width === 0
    ) {
      y1 += annotationHeight;
    }

    if (
      annotationOpen !== -1 &&
      target.depth > annotationOpen &&
      target.width === 0
    ) {
      y2 += annotationHeight;
    }

    return {
      x1: [x1],
      y1: [y1],
      x2: [x2],
      y2: [y2],
      opacity: 1,
      timing: { duration },
    };
  };

  return {
    enter,
    leave: start,
    update,
    start,
  };
}

export function getX(width: number, xOffset: number, backboneOffset: number) {
  return width > 1
    ? (xOffset + backboneOffset) * width - backboneOffset
    : (xOffset + backboneOffset) * width;
}
