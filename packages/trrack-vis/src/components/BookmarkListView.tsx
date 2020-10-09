
import { Provenance, isStateNode, isChildNode, NodeID, Nodes, ProvenanceGraph, ProvenanceNode, StateNode, ChildNode, DiffNode } from '@visdesignlab/trrack';


import { style } from 'typestyle';
import { NodeGroup } from 'react-move';
import BookmarkTransitions from './BookmarkTransitions';
import React, { ReactChild, useEffect, useState } from 'react';
import BookmarkNode from './BookmarkNode';
import { EventConfig } from '../Utils/EventConfig';
import { Popup } from 'semantic-ui-react';
import translate from '../Utils/translate';





export interface BookmarkListViewConfig<T, S extends string, A> {
  graph?: ProvenanceGraph<T, S, A>;
  eventConfig?: EventConfig<S>;
  popupContent?: (nodeId: StateNode<T, S, A>) => ReactChild;
  currentNode: NodeID;

}



function BookmarkListView<T, S extends string, A>({
  graph,
  eventConfig,
  popupContent,
  currentNode

} : BookmarkListViewConfig<T, S, A> ) {

  if(graph === undefined)
  {
    return null;
  }

  console.log(popupContent);

  let gutter = 15;
  let verticalSpace = 50;
  let clusterVerticalSpace = 50;
  let backboneGutter = 20;


  const isAtRoot = graph.root === graph.current;
  const isAtLatest = graph.nodes[graph.current].children.length === 0;

  let current = graph.nodes[graph.current];
  let nodesNum = graph.nodes[graph.current].children.length;

  let bookmarks = [];

  const xOffset = gutter;
  const yOffset = verticalSpace;


  if(isChildNode(current)){
    while(true){
      if(isChildNode(current)){
        if(current.bookmarked){
          bookmarks.push(current);
        }
        else{
          break;
        }

        }
        else{
          break;
        }
        current = graph.nodes[current.parent];
    }
  }



  //let nodeList = bookmarks;


 //  const items = [];
 //  for (const [index, value] of bookmarkList.entries()) {
 //   items.push(<li key={index}>{value}</li>)
 // }

 console.log(bookmarks);


  let margin = {
    marginRight: "1px"
  } as React.CSSProperties

  return (

    // <svg>
        <NodeGroup
          data={bookmarks}
          keyAccessor={(d) => d.label}
          {...BookmarkTransitions(
            xOffset,
            yOffset,
            bookmarks
          )}
        >
          {(bookmarks) => (

            <>
              {bookmarks.map((bookmark) => {
                const { data: d, key, state } = bookmark;

                return (
                  <g key={key}
                    transform={translate(
                      state.x,
                      state.y
                  )}>
                      <BookmarkNode
                          current={currentNode === d.id}
                          node={d}
                          nodeMap={bookmarks}
                          editAnnotations={false}
                          annotationContent={undefined}
                          popupContent={popupContent}
                          eventConfig={eventConfig}

                          />
                  </g>
                );
              })}
            </>
          )}
        </NodeGroup>
    // </svg>


 );
}

 const dot = style({
  display: "inline-block",
  marginRight: "1px",
  marginLeft: "10px",
  color:"#cccccc",

});

const circleStyle = style({
      padding:10,
      margin:20,
      display:"inline-block",
      backgroundColor: "#cccccc",
      borderRadius: "50%",
      width:100,
      height:100,
    });

const marginRight = style({
  marginRight:"1px",

});


export default BookmarkListView;
