import { isChildNode, NodeID, ProvenanceNode } from '@visdesignlab/trrack';
import React from 'react';
import { ProvVisConfig } from './ProvVis';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-solid-svg-icons';
import { BookmarkButton } from './BookmarkButton';
import { AnnotationButton } from './AnnotationButton';
import { useSpring, animated, easings } from 'react-spring';
import { TextField } from '@mui/material';
import { css } from '@emotion/react';
import { AnnotationField } from './AnnotationField';

export function NodeDescription<S extends string, A>({
  depth,
  yOffset,
  node,
  config,
  currentNode,
  onClick,
  isHover,
  setHover,
  colorMap,
  annotationDepth,
  setAnnotationDepth,
}: {
  depth: number;
  yOffset: number;
  node: ProvenanceNode<S, A>;
  config: ProvVisConfig<S, A>;
  currentNode: NodeID;
  onClick: () => void;
  isHover: boolean;
  setHover: (node: NodeID | null) => void;
  colorMap: Record<S | 'Root', string>;
  annotationDepth: number | null;
  setAnnotationDepth: (depth: number | null) => void;
}) {
  const style = useSpring({
    config: {
      duration: config.animationDuration,
      easing: easings.easeInOutSine,
    },
    top: depth * config.verticalSpace + config.marginTop / 2 + yOffset,
  });

  return (
    <>
      <animated.div
        style={{
          ...style,
          cursor: 'pointer',
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          height: config.verticalSpace,
          justifyContent: 'center',
          alignItems: 'end',
          width: `${config.labelWidth}px`,
        }}
        onClick={onClick}
        onMouseEnter={() => setHover(node.id)}
        onMouseLeave={() => setHover(null)}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {isHover || annotationDepth === depth ? (
            <AnnotationButton
              color={colorMap[node.metadata.eventType]}
              isAnnotating={annotationDepth === depth}
              onClick={() => setAnnotationDepth(depth)}
            />
          ) : null}
          {isHover || node.bookmarked ? (
            <BookmarkButton
              color={colorMap[node.metadata.eventType]}
              isBookmarked={node.bookmarked}
              onClick={() => config.bookmarkNode(node.id)}
            />
          ) : null}
          <div
            style={{
              // width: `${config.labelWidth}px`,
              alignItems: 'end',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <p
              style={{
                maxWidth: `${config.labelWidth}px`,
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {node.label}
            </p>
            {isChildNode(node) && node.artifacts.annotations.length > 0 ? (
              <p
                style={{
                  maxWidth: `${config.labelWidth}px`,
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: 'gray',
                }}
              >
                {
                  node.artifacts.annotations[
                    node.artifacts.annotations.length - 1
                  ].annotation
                }
              </p>
            ) : null}
          </div>
        </div>
      </animated.div>
      {annotationDepth === depth ? (
        <animated.div
          style={{
            cursor: 'pointer',
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'start',
            fontSize: '12px !important',
            width: `250px`,
            zIndex: 10,
            top: style.top.to((num) => num + config.verticalSpace),
          }}
        >
          <AnnotationField
            config={config}
            node={node}
            setAnnotationDepth={setAnnotationDepth}
          />
        </animated.div>
      ) : null}
    </>
  );
}
