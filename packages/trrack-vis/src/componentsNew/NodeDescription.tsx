import { NodeID, ProvenanceNode } from '@visdesignlab/trrack';
import React from 'react';
import { StratifiedMap } from '../components/ProvVis';
import { useSpring, animated, easings } from 'react-spring';
import { ProvVisConfig } from './ProvVis';

export function NodeDescription<S, A>({
  depth,
  node,
  config,
}: {
  depth: number;
  node: ProvenanceNode<S, A>;
  config: ProvVisConfig;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        height: config.verticalSpace,
        justifyContent: 'center',
        width: `${config.labelWidth}px`,
        top: depth * config.verticalSpace + config.marginTop / 2,
      }}
    >
      <p
        style={{
          margin: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {node.label}
      </p>
    </div>
  );
}
