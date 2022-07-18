import React from 'react';
import { useSpring, animated, easings } from 'react-spring';
import { ProvVisConfig } from './ProvVis';

export function AnimatedLine<S extends string, A>({
  x1Width,
  x2Width,
  y1Depth,
  y2Depth,
  y1Offset,
  y2Offset,
  config,
}: {
  x1Width: number;
  x2Width: number;
  y1Depth: number;
  y2Depth: number;
  y1Offset: number;
  y2Offset: number;
  config: ProvVisConfig<S, A>;
}) {
  const style = useSpring({
    config: {
      duration: config.animationDuration,
      easing: easings.easeInOutSine,
    },
    x1: x1Width * config.gutter,
    x2: x2Width * config.gutter,
    y1: y1Depth * config.verticalSpace + y1Offset,
    y2: y2Depth * config.verticalSpace + y2Offset,
  });

  return <animated.line {...style} stroke="black" pointerEvents={'none'} />;
}
