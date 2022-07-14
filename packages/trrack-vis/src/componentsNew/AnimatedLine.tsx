import { NodeID } from '@visdesignlab/trrack';
import React from 'react';
import { StratifiedMap } from '../components/ProvVis';
import { useSpring, animated, easings } from 'react-spring';
import { ProvVisConfig } from './ProvVis';

export function AnimatedLine({
  x1Width,
  x2Width,
  y1Depth,
  y2Depth,
  config,
}: {
  x1Width: number;
  x2Width: number;
  y1Depth: number;
  y2Depth: number;
  config: ProvVisConfig;
}) {
  const style = useSpring({
    config: {
      duration: config.animationDuration,
      easing: easings.easeInOutSine,
    },
    x1: x1Width * config.verticalSpace,
    x2: x2Width * config.verticalSpace,
    y1: y1Depth * config.verticalSpace,
    y2: y2Depth * config.verticalSpace,
  });

  return <animated.line {...style} stroke="black" pointerEvents={'none'} />;
}
