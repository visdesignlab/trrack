import { NodeID, ProvenanceNode } from '@visdesignlab/trrack';
import { trackDerivedFunction } from 'mobx/dist/internal';
import React, { useState, useMemo } from 'react';
import { useSpring, animated, easings } from 'react-spring';
import { defaultIcon } from '../Utils/IconConfig';
import { ProvVisConfig } from './ProvVis';

export function AnimatedIcon<S extends string, A>({
  width,
  depth,
  yOffset,
  onClick,
  config,
  node,
  currentNode,
  isHover,
  setHover,
  colorMap,
}: {
  width: number;
  depth: number;
  yOffset: number;
  onClick: () => void;
  config: ProvVisConfig<S, A>;
  node: ProvenanceNode<S, A>;
  currentNode: NodeID;
  isHover: boolean;
  setHover: (node: NodeID | null) => void;
  colorMap: Record<S | 'Root', string>;
}) {
  const style = useSpring({
    config: {
      duration: config.animationDuration,
      easing: easings.easeInOutSine,
    },
    transform: `translate(${width * config.gutter}, ${
      depth * config.verticalSpace + yOffset
    })`,
  });

  const icon = useMemo(() => {
    const currentIconConfig = config.iconConfig?.[node.metadata.eventType];
    const currDefaultIcon = defaultIcon(colorMap[node.metadata.eventType]);

    if (currentIconConfig && currentIconConfig.glyph) {
      if (node.id === currentNode && currentIconConfig.currentGlyph) {
        return currentIconConfig.currentGlyph(node);
      }
      if (isHover && currentIconConfig.hoverGlyph) {
        return currentIconConfig.hoverGlyph(node);
      }
      if (width === 0 && currentIconConfig.backboneGlyph) {
        return currentIconConfig.backboneGlyph(node);
      }

      return currentIconConfig.glyph(node);
    } else {
      if (node.id === currentNode) {
        return currDefaultIcon.currentGlyph(node);
      }
      if (isHover) {
        return currDefaultIcon.hoverGlyph(node);
      }
      if (width === 0) {
        return currDefaultIcon.backboneGlyph(node);
      }

      return currDefaultIcon.glyph(node);
    }
  }, [
    config.iconConfig,
    node.metadata.eventType,
    node.id,
    currentNode,
    isHover,
    width,
  ]);

  return (
    <animated.g
      {...style}
      cursor={'pointer'}
      onClick={onClick}
      onMouseOver={() => {
        if (!style.transform.isAnimating) {
          setHover(node.id);
        }
      }}
      onMouseOut={() => setHover(null)}
    >
      {icon}
    </animated.g>
  );
}
