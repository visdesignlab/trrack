import { Provenance, ProvenanceNode, ProvenanceGraph, StateNode } from '@visdesignlab/trrack';
import React, { ReactChild } from 'react';
import { Animate } from 'react-move';
import { Popup } from 'semantic-ui-react';

import { BundleMap } from '../Utils/BundleMap';
import { EventConfig } from '../Utils/EventConfig';
import translate from '../Utils/translate';
import { treeColor } from './Styles';


interface BookmarkNodeProps<T, S extends string, A> {
  current: boolean;
  node: StateNode<T, S, A>;
  nodeMap: any;
  editAnnotations: boolean;
  annotationContent?: (nodeId: StateNode<T, S, A>) => ReactChild;
  popupContent?: (nodeId: StateNode<T, S, A>) => ReactChild;
  eventConfig?: EventConfig<S>;
}

function BookmarkNode<T, S extends string, A>({
  current,
  node,
  nodeMap,
  editAnnotations,
  annotationContent,
  popupContent,
  eventConfig,
}: BookmarkNodeProps<T, S, A>) {

  const padding = 15;
  const radius = 5;
  const strokeWidth = 2;
  const textSize = 15;

  let cursorStyle = {
    cursor: "pointer",
  } as React.CSSProperties;

  // console.log(JSON.parse(JSON.stringify(node)));
  let glyph = (
    <circle
      style={cursorStyle}
      className={treeColor(current)}
      r={radius}
      strokeWidth={strokeWidth}
    />
  );

  // console.log("in bookmark node");

  let dropDownAdded = false;
  const eventType = node.metadata.type;
  //
  // console.log(node);
  // console.log(current);
  // console.log(node.id)


  // if(eventype !== selectedNode || (eventype !== selectedBar || (eventype !== movedNode){
  //   currentGlyph =
  // }

  // console.log(eventType);
  // console.log(eventConfig[eventType]);
  const { bundleGlyph, currentGlyph, backboneGlyph } = eventConfig[eventType];


  if (current) {
    glyph = (
      <g style={cursorStyle} fontWeight={"none"}>
        {currentGlyph}
      </g>
    );
  } else {
    console.log("in else");
    glyph = (
      <g style={cursorStyle} fontWeight={"none"}>
        {backboneGlyph}
      </g>
    );
  }



  // glyph = (
  //   <g style={cursorStyle} fontWeight={"none"}>
  //     {backboneGlyph}
  //   </g>);


  let label: string = "";
  let annotate: string = "";

  if (node.artifacts && node.artifacts.annotation && node.artifacts.annotation.length > 0) {
    annotate = node.artifacts.annotation;
  }

  label = node.label;

  if (annotate.length > 20) annotate = annotate.substr(0, 20) + "..";

  if (label.length > 20) label = label.substr(0, 20) + "..";

  // console.log(nodeMap);

  let x = 15;
  let y = nodeMap.length*5;
  //console.log(nodeMap[node.id].depth);


  return (
    <Animate
      start={{ opacity: 0 }}
      enter={{
        opacity: [1],
      }}
    >
      {(state) => (
        <>
        <g style={{ opacity: 1 }} >

          {glyph}

          <text
            // y={annotate.length === 0 ? 0 : -7}
            y ={0}
            x={20}
            dominantBaseline="middle"
            textAnchor="start"
            fontSize={textSize}
            fontWeight={"bold"}
          >
            {label}
            </text>

            <text
            y={20}
            x={dropDownAdded ? 10 : 0}
            dominantBaseline="middle"
            textAnchor="start"
            fontSize={textSize}
            fontWeight={"regular"}
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

// const Label: FC<{ label: string } & React.SVGProps<SVGTextElement>> = (props: {
//   label: string;
// }) => {
//   return <text {...props}>{props.label}</text>;
// };
