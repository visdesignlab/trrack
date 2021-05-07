import { StateNode } from '@visdesignlab/trrack';
import React from 'react';
import { Animate } from 'react-move';
import { EventConfig } from '../Utils/EventConfig';
import { treeColor } from './Styles';

interface BookmarkNodeProps<T, S extends string, A> {
  current: boolean;
  node: StateNode<S, A>;
  nodeMap: any;
  editAnnotations: boolean;
  eventConfig?: EventConfig<S>;
}

function BookmarkNode<T, S extends string, A>({
  current,
  node,
  eventConfig,
}: BookmarkNodeProps<T, S, A>) {
  const radius = 5;
  const strokeWidth = 2;
  const textSize = 15;

  const cursorStyle = {
    cursor: 'pointer',
  } as React.CSSProperties;

  let glyph = (
    <circle
      style={cursorStyle}
      className={treeColor(current)}
      r={radius}
      strokeWidth={strokeWidth}
    />
  );

  const dropDownAdded = false;
  const { eventType } = node.metadata;

  if (eventConfig) {
    const { currentGlyph, backboneGlyph } = eventConfig[eventType];

    if (current) {
      glyph = (
        <g style={cursorStyle} fontWeight={'none'}>
          {currentGlyph}
        </g>
      );
    } else {
      glyph = (
        <g style={cursorStyle} fontWeight={'none'}>
          {backboneGlyph}
        </g>
      );
    }
  }

  let label = '';
  let annotate = '';

  if (
    node.artifacts &&
    node.artifacts.annotations.length > 0 &&
    node.artifacts.annotations[0].annotation.length > 0
  ) {
    annotate = node.artifacts.annotations[0].annotation;
  }

  label = node.label;

  if (annotate.length > 20) annotate = `${annotate.substr(0, 20)}..`;

  if (label.length > 20) label = `${label.substr(0, 20)}..`;

  return (
    <Animate
      start={{ opacity: 0 }}
      enter={{
        opacity: [1],
      }}
    >
      {() => (
        <>
          <g style={{ opacity: 1 }}>
            {glyph}

            <text
              y={0}
              x={20}
              dominantBaseline="middle"
              textAnchor="start"
              fontSize={textSize}
              fontWeight={'bold'}
            >
              {label}
            </text>

            <text
              y={20}
              x={dropDownAdded ? 10 : 0}
              dominantBaseline="middle"
              textAnchor="start"
              fontSize={textSize}
              fontWeight={'regular'}
            >
              {annotate}
            </text>
          </g>
        </>
      )}
    </Animate>
  );
}

export default BookmarkNode;
