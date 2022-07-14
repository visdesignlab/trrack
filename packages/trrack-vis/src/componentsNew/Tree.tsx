import { NodeID, ProvenanceNode } from '@visdesignlab/trrack';
import React from 'react';
import { useSpring, animated } from 'react-spring';
import { AnimatedCircle } from './AnimatedCircle';
import { AnimatedLine } from './AnimatedLine';
import { HierarchyLink, HierarchyNode } from 'd3';
import { ProvVisConfig } from './ProvVis';
import { NodeDescription } from './NodeDescription';
import { StratifiedMap } from './useComputeNodePosition';

export function Tree<T, S extends string, A>({
  nodes,
  links,
  changeCurrent = (id: NodeID) => null,
  config,
}: {
  nodes: StratifiedMap<T, S, A>;
  links: HierarchyLink<ProvenanceNode<S, A>>[];
  changeCurrent?: (id: NodeID) => void;
  config: ProvVisConfig;
}) {
  return (
    <>
      <div
        style={{
          display: 'flex',
          height: '100%',
          gap: `${config.labelWidth}px`,
        }}
      >
        <div
          style={{
            position: 'relative',
          }}
        >
          {Object.values(nodes)
            .filter((node) => node.width === 0)
            .map((node) => {
              return (
                <NodeDescription
                  config={config}
                  depth={node.depth}
                  node={node.data}
                />
              );
            })}
        </div>
        <svg>
          <g
            transform={`translate(${config.nodeAndLabelGap}, ${config.marginTop})`}
          >
            {Object.values(nodes).map((node) => {
              return (
                <>
                  <AnimatedCircle
                    width={node.width!}
                    depth={node.depth}
                    onClick={() => changeCurrent(node.id!)}
                    config={config}
                  />
                </>
              );
            })}
            {links.map((link) => {
              return (
                <AnimatedLine
                  key={link.source.id! + link.target.id!}
                  // TODO:: idk how to fix this typing
                  x1Width={
                    (
                      link.source as HierarchyNode<ProvenanceNode<S, A>> & {
                        width: number;
                      }
                    ).width
                  }
                  x2Width={
                    (
                      link.target as HierarchyNode<ProvenanceNode<S, A>> & {
                        width: number;
                      }
                    ).width
                  }
                  y1Depth={link.source.depth}
                  y2Depth={link.target.depth}
                  config={config}
                />
              );
            })}
          </g>
        </svg>
      </div>
    </>
  );
}
