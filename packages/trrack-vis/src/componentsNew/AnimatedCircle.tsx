import { NodeID } from '@visdesignlab/trrack';
import React from 'react';
import { StratifiedMap } from '../components/ProvVis';
import { useSpring, animated, easings } from 'react-spring';
import { ProvVisConfig } from './ProvVis';

export function AnimatedCircle({
  width,
  depth,
  onClick,
  config,
}: {
  width: number;
  depth: number;
  onClick: () => void;
  config: ProvVisConfig;
}) {
  const style = useSpring({
    config: {
      duration: config.animationDuration,
      easing: easings.easeInOutSine,
    },
    cx: width * config.verticalSpace,
    cy: depth * config.verticalSpace,
  });

  return <animated.circle {...style} r={5} onClick={onClick} />;
}
