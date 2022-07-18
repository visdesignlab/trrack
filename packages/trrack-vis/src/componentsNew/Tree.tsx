import { NodeID, ProvenanceNode } from '@visdesignlab/trrack';
import React, { useMemo, useState } from 'react';
import { AnimatedIcon } from './AnimatedIcon';
import { AnimatedLine } from './AnimatedLine';
import { HierarchyLink, HierarchyNode } from 'd3';
import { ProvVisConfig } from './ProvVis';
import { NodeDescription } from './NodeDescription';
import { StratifiedMap } from './useComputeNodePosition';
import { IconLegend } from './IconLegend';

export function Tree<T, S extends string, A>({
  nodes,
  links,
  currentNode,
  config,
}: {
  nodes: StratifiedMap<T, S, A>;
  links: HierarchyLink<ProvenanceNode<S, A>>[];
  config: ProvVisConfig<S, A>;
  currentNode: NodeID;
}) {
  const [hoverNode, setHoverNode] = useState<NodeID | null>(null);
  const [annotationDepth, setAnnotationDepth] = useState<number | null>(null);

  // give each event type a color to use for the default icons
  // colors are the default tableau 10 colors
  const colorMap = useMemo(() => {
    const tableauColors = [
      '#1F77B4',
      '#FF7F0E',
      '#2CA02C',
      '#D62728',
      '#9467BD',
      '#8C564B',
      '#CFECF9',
      '#7F7F7F',
      '#BCBD22',
      '#17BECF',
    ];

    let currColorNumber = 0;

    const innerColorMap: Record<S | 'Root', string> = {} as Record<
      S | 'Root',
      string
    >;

    innerColorMap['Root'] = 'black';

    Object.values(nodes).forEach((node) => {
      if (!innerColorMap[node.data.metadata.eventType]) {
        innerColorMap[node.data.metadata.eventType] =
          tableauColors[currColorNumber % 10];
        currColorNumber += 1;
      }
    });

    return innerColorMap;
  }, [nodes]);

  // render the descriptions for the backbone nodes
  const descriptions = useMemo(() => {
    return Object.values(nodes)
      .filter((node) => node.width === 0)
      .map((node) => {
        return (
          <NodeDescription
            config={config}
            depth={node.depth}
            node={node.data}
            currentNode={currentNode}
            onClick={() => config.changeCurrent(node.id!)}
            isHover={node.id! === hoverNode}
            setHover={(node: NodeID | null) => setHoverNode(node)}
            colorMap={colorMap}
            setAnnotationDepth={(depth: number | null) => {
              if (annotationDepth !== depth) {
                setAnnotationDepth(depth);
              } else {
                setAnnotationDepth(null);
              }
            }}
            annotationDepth={annotationDepth}
            yOffset={0}
          />
        );
      });
  }, [nodes, currentNode, hoverNode, annotationDepth]);

  // render edges for every node
  const edges = useMemo(() => {
    return links.map((link) => {
      // TODO:: idk how to fix this typing
      const sourceWidth = (
        link.source as HierarchyNode<ProvenanceNode<S, A>> & {
          width: number;
        }
      ).width;

      const targetWidth = (
        link.target as HierarchyNode<ProvenanceNode<S, A>> & {
          width: number;
        }
      ).width;

      return (
        <AnimatedLine
          key={link.source.id! + link.target.id!}
          x1Width={sourceWidth}
          x2Width={targetWidth}
          y1Depth={link.source.depth}
          y2Depth={link.target.depth}
          config={config}
          y1Offset={0}
          y2Offset={0}
        />
      );
    });
  }, [links, config, annotationDepth]);

  // render icons for every node
  const nodeIcons = useMemo(() => {
    return Object.values(nodes).map((node) => {
      return (
        <>
          <AnimatedIcon
            width={node.width!}
            depth={node.depth}
            onClick={() => {
              // this if is just to avoid some annoying hovers that would flash quickly when you switched nodes
              if (node.width !== 0) {
                setHoverNode(null);
              }
              config.changeCurrent(node.id!);
            }}
            config={config}
            node={node.data}
            currentNode={currentNode}
            isHover={node.id! === hoverNode}
            setHover={(node: NodeID | null) => setHoverNode(node)}
            colorMap={colorMap}
            yOffset={0}
          />
        </>
      );
    });
  }, [nodes, currentNode, config, hoverNode, annotationDepth]);

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
          {descriptions}
        </div>
        <svg>
          <g
            transform={`translate(${config.nodeAndLabelGap}, ${config.marginTop})`}
          >
            {edges}
            {nodeIcons}
          </g>
        </svg>
        <IconLegend colorMap={colorMap} nodes={nodes} config={config} />
      </div>
    </>
  );
}
