import { NodeID, ProvenanceNode } from '@visdesignlab/trrack';
import { trackDerivedFunction } from 'mobx/dist/internal';
import React, { useState, useMemo } from 'react';
import { useSpring, animated, easings } from 'react-spring';
import { defaultIcon } from '../Utils/IconConfig';
import { AnimatedIcon } from './AnimatedIcon';
import { ProvVisConfig } from './ProvVis';
import { StratifiedMap } from './useComputeNodePosition';

export function IconLegend<T, S extends string, A>({
  colorMap,
  nodes,
  config,
}: {
  colorMap: Record<S | 'Root', string>;
  nodes: StratifiedMap<T, S, A>;
  config: ProvVisConfig<S, A>;
}) {
  const legendCategories = useMemo(() => {
    const categoryList: (S | 'Root')[] = [];

    Object.values(nodes).forEach((node) => {
      if (!categoryList.includes(node.data.metadata.eventType)) {
        categoryList.push(node.data.metadata.eventType);
      }
    });

    return categoryList;
  }, [nodes]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {legendCategories.map((cat) => {
        return (
          <div style={{ display: 'flex' }}>
            <svg height={'20px'} width={'20px'}>
              <g transform="translate(10, 10)">
                {config.iconConfig?.[cat] && config.iconConfig[cat].glyph
                  ? config.iconConfig[cat].glyph()
                  : defaultIcon(colorMap[cat]).glyph()}
              </g>
            </svg>
            <p style={{ margin: 0 }}>{cat}</p>
          </div>
        );
      })}
    </div>
  );
}
