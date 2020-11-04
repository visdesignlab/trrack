import { NodeID, ProvenanceGraph } from '@visdesignlab/trrack';

import { NodeGroup } from 'react-move';
import React from 'react';
import BookmarkTransitions from './BookmarkTransitions';
import BookmarkNode from './BookmarkNode';
import { EventConfig } from '../Utils/EventConfig';
import translate from '../Utils/translate';

export interface BookmarkListViewConfig<T, S extends string, A> {
  graph?: ProvenanceGraph<T, S, A>;
  eventConfig?: EventConfig<S>;
  currentNode: NodeID;
}

function BookmarkListView<T, S extends string, A>({
  graph,
  eventConfig,
  currentNode,
}: BookmarkListViewConfig<T, S, A>) {
  if (graph === undefined) {
    return null;
  }

  const gutter = 15;
  const verticalSpace = 50;

  const bookmarks = [];

  const xOffset = gutter;
  const yOffset = verticalSpace;

  // eslint-disable-next-line no-restricted-syntax
  for (const j in graph.nodes) {
    if (graph.nodes[j].bookmarked) {
      bookmarks.push(graph.nodes[j]);
    }
  }

  return (
    <NodeGroup
      data={bookmarks}
      keyAccessor={(d) => d.label}
      {...BookmarkTransitions(xOffset, yOffset, bookmarks)}
    >
      {(innerBookmarks) => (
        <>
          {innerBookmarks.map((bookmark) => {
            const { data: d, key, state } = bookmark;

            return (
              <g key={key} transform={translate(state.x, state.y)}>
                <BookmarkNode
                  current={currentNode === d.id}
                  node={d}
                  nodeMap={innerBookmarks}
                  editAnnotations={false}
                  eventConfig={eventConfig}
                />
              </g>
            );
          })}
        </>
      )}
    </NodeGroup>
  );
}

export default BookmarkListView;
