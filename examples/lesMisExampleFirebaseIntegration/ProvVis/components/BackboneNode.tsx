import { ProvenanceNode, StateNode } from '../../../../src/index';
import React, { ReactChild } from 'react';
import { Animate } from 'react-move';
import { Popup } from 'semantic-ui-react';

import { BundleMap } from '../Utils/BundleMap';
import { EventConfig } from '../Utils/EventConfig';
import translate from '../Utils/translate';
import { treeColor } from './Styles';

interface BackboneNodeProps<T, S extends string, A> {
  first: boolean;
  iconOnly: boolean;
  current: boolean;
  duration: number;
  node: StateNode<T, S, A>;
  radius: number;
  strokeWidth: number;
  textSize: number;
  nodeMap: any;
  annotationOpen: number;
  setAnnotationOpen: any;
  exemptList: string[];
  setExemptList: any;
  bundleMap?: BundleMap;
  clusterLabels: boolean;
  eventConfig?: EventConfig<S>;
  popupContent?: (nodeId: StateNode<T, S, A>) => ReactChild;
  annotationContent?: (nodeId: StateNode<T, S, A>) => ReactChild;
  expandedClusterList?: string[];
}

function BackboneNode<T, S extends string, A>({
  first,
  iconOnly,
  current,
  node,
  duration,
  radius,
  strokeWidth,
  textSize,
  nodeMap,
  annotationOpen,
  setAnnotationOpen,
  exemptList,
  setExemptList,
  bundleMap,
  clusterLabels,
  eventConfig,
  popupContent,
  annotationContent,
  expandedClusterList,
}: BackboneNodeProps<T, S, A>) {
  const padding = 15;

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

  // let backboneBundleNodes = findBackboneBundleNodes(nodeMap, bundleMap)

  let dropDownAdded = false;

  if (eventConfig) {
    const eventType = node.metadata.type;
    if (eventType && eventType in eventConfig && eventType !== "Root") {
      const { bundleGlyph, currentGlyph, backboneGlyph } = eventConfig[
        eventType
      ];
      if (bundleMap && Object.keys(bundleMap).includes(node.id)) {
        dropDownAdded = true;
        glyph = (
          <g style={cursorStyle} fontWeight={"none"}>
            {bundleGlyph}
          </g>
        );
      }
      if (current) {
        glyph = (
          <g style={cursorStyle} fontWeight={"none"}>
            {currentGlyph}
          </g>
        );
      } else if (!dropDownAdded) {
        glyph = (
          <g style={cursorStyle} fontWeight={"none"}>
            {backboneGlyph}
          </g>
        );
      }
    }
  }

  let label: string = "";
  let annotate: string = "";

  console.log(bundleMap)
  console.log(nodeMap[node.id]);

  if (bundleMap && Object.keys(bundleMap).includes(node.id) && node.ephemeral && expandedClusterList && !expandedClusterList.includes(node.id))
  {
    if(node.metadata && node.metadata.type)
    {
      label = "[" + bundleMap[node.id].bunchedNodes.length + "] " + node.metadata.type
    }
    else{
      label = "[" + bundleMap[node.id].bunchedNodes.length + "]"
    }
  }
  else{
    label = node.label;
  }

  if (node.artifacts && node.artifacts.annotation && node.artifacts.annotation.length > 0) {
    annotate = node.artifacts.annotation;
  }


  if (!nodeMap[node.id]) {
    return null;
  }

  if (annotate.length > 30) annotate = annotate.substr(0, 30) + "..";

  if (label.length > 30) label = label.substr(0, 30) + "..";

  let labelG = (
    <g style={{ opacity: 1 }} transform={translate(padding, 0)}>
      {!iconOnly ? (
        <g>
          {dropDownAdded ? (
            <text
              style={cursorStyle}
              onClick={(e) => nodeClicked(node, e)}
              fontSize={17}
              fill={"rgb(248, 191, 132)"}
              textAnchor="middle"
              alignmentBaseline="middle"
              x={1}
              y={0}
              fontFamily="FontAwesome"
            >
              {expandedClusterList && expandedClusterList.includes(node.id)
                ? "\uf0d8"
                : "\uf0d7"}
            </text>
          ) : (
            <g></g>
          )}
          <text
            y={annotate.length === 0 ? 0 : -7}
            x={dropDownAdded ? 10 : 0}
            dominantBaseline="middle"
            textAnchor="start"
            fontSize={textSize}
            fontWeight={"bold"}
            onClick={() => labelClicked(node)}
          >
            {label}
          </text>
          ,
          <text
            y={7}
            x={dropDownAdded ? 10 : 0}
            dominantBaseline="middle"
            textAnchor="start"
            fontSize={textSize}
            fontWeight={"regular"}
            onClick={() => labelClicked(node)}
          >
            {annotate}
          </text>
        </g>
      ) : (
        <g>
          {dropDownAdded ? (
            <text
              style={cursorStyle}
              onClick={(e) => nodeClicked(node, e)}
              fontSize={17}
              fill={"rgb(248, 191, 132)"}
              textAnchor="middle"
              alignmentBaseline="middle"
              x={1}
              y={0}
              fontFamily="FontAwesome"
            >
              {expandedClusterList && expandedClusterList.includes(node.id)
                ? "\uf0d8"
                : "\uf0d7"}
            </text>
          ) : (
            <g></g>
          )}
        </g>
      )}

      {annotationOpen !== -1 &&
      nodeMap[node.id].depth === annotationOpen &&
      annotationContent ? (
        <g>{annotationContent(nodeMap[node.id])}</g>
      ) : (
        <g></g>
      )}
    </g>
  );

  return (
    <Animate
      start={{ opacity: 0 }}
      enter={{
        opacity: [1],
        timing: { duration: 100, delay: first ? 0 : duration },
      }}
    >
      {(state) => (
        <>
          {popupContent !== undefined && nodeMap[node.id].depth > 0 ? (
            <Popup content={popupContent(node)} trigger={glyph} />
          ) : (
            glyph
          )}
          {/* {glyph} */}

          {popupContent !== undefined && nodeMap[node.id].depth > 0 ? (
            <Popup content={popupContent(node)} trigger={labelG} />
          ) : (
            labelG
          )}
        </>
      )}
    </Animate>
  );

  function labelClicked(node: ProvenanceNode<T, S, A>) {
    if (!annotationContent) {
      return;
    } else if (annotationOpen === nodeMap[node.id].depth) {
      setAnnotationOpen(-1);
    } else {
      setAnnotationOpen(nodeMap[node.id].depth);
    }
  }

  function nodeClicked(node: ProvenanceNode<T, S, A>, event: any) {
    if (bundleMap && Object.keys(bundleMap).includes(node.id)) {
      let exemptCopy: string[] = Array.from(exemptList);

      if (exemptCopy.includes(node.id)) {
        exemptCopy.splice(
          exemptCopy.findIndex((d) => d === node.id),
          1
        );
      } else {
        exemptCopy.push(node.id);
      }

      setExemptList(exemptCopy);
    }

    event.stopPropagation();
  }
}

export default BackboneNode;

// const Label: FC<{ label: string } & React.SVGProps<SVGTextElement>> = (props: {
//   label: string;
// }) => {
//   return <text {...props}>{props.label}</text>;
// };
