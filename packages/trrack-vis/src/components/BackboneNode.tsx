/* eslint-disable no-unused-vars */
import { Provenance, ProvenanceNode, StateNode } from '@visdesignlab/trrack';
import React, { ReactChild, useState } from 'react';
import { Animate } from 'react-move';
import { Popup } from 'semantic-ui-react';
import { BundleMap } from '../Utils/BundleMap';
import { EventConfig } from '../Utils/EventConfig';
import translate from '../Utils/translate';
import { treeColor } from './Styles';

interface BackboneNodeProps<T, S extends string, A> {
  prov: Provenance<T, S, A>;
  first: boolean;
  iconOnly: boolean;
  current: boolean;
  duration: number;
  node: StateNode<S, A>;
  radius: number;
  strokeWidth: number;
  textSize: number;
  setBookmark: any;
  bookmark: any;
  nodeMap: any;
  annotationOpen: number;
  setAnnotationOpen: any;
  exemptList: string[];
  setExemptList: any;
  bundleMap?: BundleMap;
  clusterLabels: boolean;
  editAnnotations: boolean;
  eventConfig?: EventConfig<S>;
  popupContent?: (nodeId: StateNode<S, A>) => ReactChild;
  annotationContent?: (nodeId: StateNode<S, A>) => ReactChild;
  expandedClusterList?: string[];
}

function BackboneNode<T, S extends string, A>({
  prov,
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
  bookmark,
  setAnnotationOpen,
  exemptList,
  setExemptList,
  bundleMap,
  eventConfig,
  popupContent,
  editAnnotations,
  annotationContent,
  expandedClusterList,
}: BackboneNodeProps<T, S, A>) {
  const padding = 15;

  const cursorStyle = {
    cursor: 'pointer',
  } as React.CSSProperties;

  const [annotateText, setAnnotateText] = useState(
    prov.getLatestAnnotation(node.id)?.annotation
      ? prov.getLatestAnnotation(node.id)?.annotation!
      : ''
  );

  const handleCheck = () => {
    const lastAnnotation = prov.getLatestAnnotation(node.id);

    if (lastAnnotation?.annotation !== annotateText.trim()) {
      prov.addAnnotation(annotateText, node.id);
      setAnnotationOpen(-1);
    }
  };

  const handleClose = () => {
    setAnnotateText(prov.getLatestAnnotation(node.id)?.annotation!);
    setAnnotationOpen(-1);
  };

  const handleInputChange = () => {};

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
    const { eventType } = node.metadata;
    if (eventType && eventType in eventConfig && eventType !== 'Root') {
      const { bundleGlyph, currentGlyph, backboneGlyph } = eventConfig[
        eventType
      ];
      if (bundleMap && Object.keys(bundleMap).includes(node.id)) {
        dropDownAdded = true;
        glyph = (
          <g style={cursorStyle} fontWeight={'none'}>
            {bundleGlyph}
          </g>
        );
      }
      if (current) {
        glyph = (
          <g style={cursorStyle} fontWeight={'none'}>
            {currentGlyph}
          </g>
        );
      } else if (!dropDownAdded) {
        glyph = (
          <g style={cursorStyle} fontWeight={'none'}>
            {backboneGlyph}
          </g>
        );
      }
    }
  }

  let label = '';
  let annotate = '';

  // console.log(bundleMap)
  // console.log(nodeMap[node.id]);

  if (
    bundleMap &&
    Object.keys(bundleMap).includes(node.id) &&
    node.actionType === 'Ephemeral' &&
    expandedClusterList &&
    !expandedClusterList.includes(node.id)
  ) {
    if (node.metadata && node.metadata.eventType) {
      label = `[${bundleMap[node.id].bunchedNodes.length}] ${
        node.metadata.eventType
      }`;
    } else {
      label = `[${bundleMap[node.id].bunchedNodes.length}]`;
    }
  } else {
    label = node.label;
  }

  if (
    node.artifacts &&
    node.artifacts.annotations.length > 0 &&
    annotationOpen !== nodeMap[node.id].depth
  ) {
    annotate = node.artifacts.annotations[0].annotation;
  }

  if (!nodeMap[node.id]) {
    return null;
  }

  if (annotate.length > 20) annotate = `${annotate.substr(0, 20)}..`;

  if (label.length > 20) label = `${label.substr(0, 20)}..`;

  const labelG = (
    <g style={{ opacity: 1 }} transform={translate(padding, 0)}>
      {!iconOnly ? (
        <g>
          {dropDownAdded ? (
            <text
              style={cursorStyle}
              onClick={(e) => nodeClicked(node, e)}
              fontSize={17}
              fill={'rgb(248, 191, 132)'}
              textAnchor="middle"
              alignmentBaseline="middle"
              x={1}
              y={0}
              fontFamily="Icons"
            >
              {expandedClusterList && expandedClusterList.includes(node.id)
                ? '\uf0d8'
                : '\uf0d7'}
            </text>
          ) : (
            <g></g>
          )}
          {editAnnotations ? (
            <button>
              <i className="fas fa-undo marginRight"></i>
              Undo
            </button>
          ) : (
            <g></g>
          )}
          <text
            y={annotate.length === 0 ? 0 : -7}
            x={dropDownAdded ? 10 : 0}
            dominantBaseline="middle"
            textAnchor="start"
            fontSize={textSize}
            fontWeight={'bold'}
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
            fontWeight={'regular'}
            onClick={() => labelClicked(node)}
          >
            {annotate}
          </text>
          ,
          <text
            style={cursorStyle}
            onClick={(e) => {
              prov.setBookmark(node.id, !prov.getBookmark(node.id));

              e.stopPropagation();
            }}
            fontSize={17}
            className="fas fa"
            opacity={bookmark === node.id || prov.getBookmark(node.id) ? 1 : 0}
            fill={prov.getBookmark(node.id) ? '#2185d0' : '#cccccc'}
            textAnchor="middle"
            alignmentBaseline="middle"
            x={175}
            y={0}
            fontFamily="Icons"
          >
            {'\uf02e'}
          </text>
          ,
          <text
            style={cursorStyle}
            onClick={() => {
              if (
                annotationOpen === -1 ||
                nodeMap[node.id].depth !== annotationOpen
              ) {
                setAnnotationOpen(nodeMap[node.id].depth);
              } else {
                setAnnotationOpen(-1);
              }
            }}
            fontSize={17}
            opacity={
              bookmark === node.id || annotationOpen === nodeMap[node.id].depth
                ? 1
                : 0
            }
            fill={
              annotationOpen === nodeMap[node.id].depth ? '#2185d0' : '#cccccc'
            }
            textAnchor="middle"
            alignmentBaseline="middle"
            x={210}
            y={0}
            fontFamily="Icons"
          >
            {'\uf044'}
          </text>
        </g>
      ) : (
        <g>
          {dropDownAdded ? (
            <text
              style={cursorStyle}
              onClick={(e) => nodeClicked(node, e)}
              fontSize={17}
              fill={'rgb(248, 191, 132)'}
              textAnchor="middle"
              alignmentBaseline="middle"
              x={1}
              y={0}
              fontFamily="Icons"
            >
              {expandedClusterList && expandedClusterList.includes(node.id)
                ? '\uf0d8'
                : '\uf0d7'}
            </text>
          ) : (
            <g></g>
          )}
        </g>
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
      {() => (
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

          {annotationOpen !== -1 &&
          nodeMap[node.id].depth === annotationOpen ? (
            <g transform="translate(15, 25)">
              <foreignObject width="175" height="80" x="0" y="0">
                <div>
                  <textarea
                    style={{ maxWidth: 130, resize: 'none' }}
                    onChange={handleInputChange}
                    value={annotateText}
                  />
                  <button onClick={handleCheck}>Annotate</button>

                  <button onClick={handleClose}>Close</button>
                </div>

                {/* <Input size='massive' icon='close' onChange={handleInputChange}
                  defaultValue={annotateText.current} placeholder="Edit Annotation" action>
                    <input />
                    <Button color="green" type="submit" onClick={handleCheck}>
                      <Icon name="world"/>
                    </Button>
                    <Button color="red" type="submit" onClick={handleClose}>
                      <Icon name="close"/>
                    </Button>
                  </Input> */}
              </foreignObject>
            </g>
          ) : (
            <g></g>
          )}
        </>
      )}
    </Animate>
  );

  function labelClicked(innerNode: ProvenanceNode<S, A>) {
    if (annotationOpen === nodeMap[innerNode.id].depth && annotationContent) {
      setAnnotationOpen(-1);
    } else if (annotationContent) {
      setAnnotationOpen(nodeMap[innerNode.id].depth);
    }
  }

  function nodeClicked(innerNode: ProvenanceNode<S, A>, event: any) {
    if (bundleMap && Object.keys(bundleMap).includes(innerNode.id)) {
      const exemptCopy: string[] = Array.from(exemptList);

      if (exemptCopy.includes(innerNode.id)) {
        exemptCopy.splice(
          exemptCopy.findIndex((d) => d === innerNode.id),
          1
        );
      } else {
        exemptCopy.push(innerNode.id);
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
