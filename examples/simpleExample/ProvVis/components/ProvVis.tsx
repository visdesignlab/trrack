
import { isStateNode, isChildNode, NodeID, Nodes, ProvenanceGraph, ProvenanceNode, StateNode } from '../../../../src/index';
import { HierarchyNode, stratify } from 'd3';
import React, { ReactChild, useEffect, useState } from 'react';
import { NodeGroup } from 'react-move';
import { Popup } from 'semantic-ui-react';
import { style } from 'typestyle';

import { BundleMap } from '../Utils/BundleMap';
import { EventConfig } from '../Utils/EventConfig';
import findBundleParent from '../Utils/findBundleParent';
import translate from '../Utils/translate';
import { treeLayout } from '../Utils/TreeLayout';
import BackboneNode from './BackboneNode';
import bundleTransitions from './BundleTransitions';
import Link from './Link';
import linkTransitions from './LinkTransitions';
import nodeTransitions from './NodeTransitions';
import { treeColor } from './Styles';

interface ProvVisProps<T, S extends string, A> {
  graph: ProvenanceGraph<T, S, A>;
  root: NodeID;
  sideOffset?: number;
  iconOnly?: boolean;
  current: NodeID;
  nodeMap: Nodes<T, S, A>;
  backboneGutter?: number;
  gutter?: number;
  verticalSpace?: number;
  annotationHeight?: number;
  clusterVerticalSpace?: number;
  regularCircleRadius?: number;
  backboneCircleRadius?: number;
  regularCircleStroke?: number;
  backboneCircleStroke?: number;
  topOffset?: number;
  textSize?: number;
  height?: number;
  width?: number;
  linkWidth?: number;
  duration?: number;
  clusterLabels?: boolean;
  bundleMap?: BundleMap;
  eventConfig?: EventConfig<S>;
  changeCurrent?: (id: NodeID) => void;
  popupContent?: (nodeId: StateNode<T, S, A>) => ReactChild;
  annotationContent?: (nodeId: StateNode<T, S, A>) => ReactChild;
}

export type StratifiedMap<T, S, A> = {
  [key: string]: HierarchyNode<ProvenanceNode<T, S, A>>;
};

export type StratifiedList<T, S, A> = HierarchyNode<ProvenanceNode<T, S, A>>[];

function ProvVis<T, S extends string, A>({
  nodeMap,
  root,
  current,
  changeCurrent,
  width = 1500,
  height = 2000,
  iconOnly = false,
  gutter = 15,
  backboneGutter = 20,
  verticalSpace = 50,
  annotationHeight = 100,
  clusterVerticalSpace = 50,
  regularCircleRadius = 4,
  backboneCircleRadius = 5,
  regularCircleStroke = 3,
  backboneCircleStroke = 3,
  sideOffset = 200,
  topOffset = 30,
  textSize = 15,
  linkWidth = 4,
  duration = 600,
  clusterLabels = true,
  bundleMap,
  eventConfig,
  popupContent,
  annotationContent,
}: ProvVisProps<T, S, A>) {
  const [first, setFirst] = useState(true);
  const [annotationOpen, setAnnotationOpen] = useState(-1);
  const [expandedClusterList, setExpandedClusterList] = useState<string[]>(bundleMap ? Object.keys(bundleMap).filter(d => bundleMap[d].metadata.includes(d)) : []);

  useEffect(() => {
    setFirst(false);
  }, []);

  let nodeList = Object.values(nodeMap).filter(
    (d) => d.metadata.createdOn! >= nodeMap[root].metadata.createdOn!
  );

  let copyList = Array.from(nodeList);

  const keys = bundleMap ? Object.keys(bundleMap) : [];

  //Find a list of all nodes included in a bundle.
  let bundledNodes: string[] = [];

  if (bundleMap) {
    for (let key of keys) {
      bundledNodes = bundledNodes.concat(bundleMap[key].bunchedNodes);
      bundledNodes.push(key);
    }
  }

  const strat = stratify<ProvenanceNode<T, S, A>>()
    .id((d) => d.id)
    .parentId((d) => {
      if (d.id === root) return null;

      if (isChildNode(d)) {
        //If you are a unexpanded bundle, find your parent by going straight up.
        if (
          bundleMap &&
          Object.keys(bundleMap).includes(d.id) &&
          !expandedClusterList.includes(d.id)
        ) {
          let curr = d;

          while (true) {
            //need this to remove linter warning.
            let localCurr = curr;
            // let bundlePar = findBundleParent(curr.parent, bundleMap);
            // if(bundlePar.length > 0)
            // {
            //   for(let j in bundlePar)
            //   {
            //     if(bundlePar[j] != d.id && !expandedClusterList.includes(bundlePar[j]))
            //     {
            //       return bundlePar[j];
            //     }
            //   }
            // }

            if (
              !bundledNodes.includes(localCurr.parent) ||
              Object.keys(bundleMap).includes(localCurr.parent)
            ) {
              return localCurr.parent;
            }

            let temp = copyList.filter(function(d) {
              return d.id === localCurr.parent;
            })[0];

            if (isChildNode(temp)) {
              curr = temp;
            }
          }
        }

        let bundleParents = findBundleParent(d.parent, bundleMap);
        let collapsedParent = undefined;

        let allExpanded = true;

        for (let j in bundleParents) {
          if (!expandedClusterList.includes(bundleParents[j])) {
            allExpanded = false;
            collapsedParent = bundleParents[j];
            break;
          }
        }

        if (
          bundledNodes.includes(d.parent) &&
          bundleMap &&
          !Object.keys(bundleMap).includes(d.parent) &&
          !allExpanded
        ) {
          return collapsedParent;
        }

        return d.parent;
      } else {
        return null;
      }
    });

  for (let i = 0; i < nodeList.length; i++) {
    let bundleParents = findBundleParent(nodeList[i].id, bundleMap);

    let allExpanded = true;

    for (let j in bundleParents) {
      if (!expandedClusterList.includes(bundleParents[j])) {
        allExpanded = false;
        break;
      }
    }

    if (
      bundledNodes.includes(nodeList[i].id) &&
      !allExpanded &&
      bundleMap &&
      !Object.keys(bundleMap).includes(nodeList[i].id)
    ) {
      nodeList.splice(i, 1);
      i--;
    }
  }

  const stratifiedTree = strat(nodeList);
  // //console.log(JSON.parse(JSON.stringify(stratifiedTree)));

  const stratifiedList: StratifiedList<T, S, A> = stratifiedTree.descendants();
  const stratifiedMap: StratifiedMap<T, S, A> = {};

  stratifiedList.forEach((c) => (stratifiedMap[c.id!] = c));
  treeLayout(stratifiedMap, current, root);

  let maxHeight = 0;
  let maxWidth = 0;

  for (let j in stratifiedList) {
    if (stratifiedList[j].depth > maxHeight) {
      maxHeight = stratifiedList[j].depth;
    }

    if ((stratifiedList[j] as any).width > maxWidth) {
      maxWidth = (stratifiedList[j] as any).width;
    }
  }

  const links = stratifiedTree.links();

  const xOffset = gutter;
  const yOffset = verticalSpace;

  function regularGlyph(node: ProvenanceNode<T, S, A>) {
    if (eventConfig) {
      const eventType = node.metadata.type;
      if (
        eventType &&
        eventType in eventConfig &&
        eventType !== "Root" &&
        eventConfig[eventType].regularGlyph
      ) {
        return eventConfig[eventType].regularGlyph;
      }
    }
    return (
      <circle
        r={regularCircleRadius}
        strokeWidth={regularCircleStroke}
        className={treeColor(false)}
      />
    );
  }

  function bundleGlyph(node: ProvenanceNode<T, S, A>) {
    if (eventConfig) {
      const eventType = node.metadata.type;
      if (eventType && eventType in eventConfig && eventType !== "Root") {
        return eventConfig[eventType].bundleGlyph;
      }
    }
    return (
      <circle
        r={regularCircleRadius}
        strokeWidth={regularCircleStroke}
        className={treeColor(false)}
      />
    );
  }

  let shiftLeft = 0;

  if (maxWidth === 0) {
    shiftLeft = 30;
  } else if (maxWidth === 1) {
    shiftLeft = 52;
  } else if (maxWidth > 1) {
    shiftLeft = 74;
  }

  let svgWidth = width;

  // if (document.getElementById("globalG") !== null) {
  //   if (
  //     document
  //       .getElementById("globalG")!
  //       .getBoundingClientRect()
  //       .width.valueOf() > svgWidth
  //   ) {
  //     console.log("in here");
  //     svgWidth =
  //       document
  //         .getElementById("globalG")!
  //         .getBoundingClientRect()
  //         .width.valueOf() + 10;
  //   }
  // }

  let overflowStyle = {
    overflowX: "auto",
    overflowY: "auto",
  } as React.CSSProperties;

  return (
    <div style={overflowStyle} className={container} id="prov-vis">
      <svg
        style={{ overflow: "visible" }}
        id={"topSvg"}
        height={maxHeight < height ? height : maxHeight}
        width={svgWidth}
      >
        <rect height={height} width={width} fill="none" stroke="none" />
        <g id={"globalG"} transform={translate(shiftLeft, topOffset)}>
          <NodeGroup
            data={links}
            keyAccessor={(link) => `${link.source.id}${link.target.id}`}
            {...linkTransitions(
              xOffset,
              yOffset,
              clusterVerticalSpace,
              backboneGutter - gutter,
              duration,
              stratifiedList,
              stratifiedMap,
              annotationOpen,
              annotationHeight,
              bundleMap
            )}
          >
            {(linkArr) => (
              <>
                {linkArr.map((link) => {
                  const { key, state } = link;

                  return (
                    <g key={key}>
                      <Link
                        {...state}
                        className={treeColor(true)}
                        strokeWidth={linkWidth}
                      />
                    </g>
                  );
                })}
              </>
            )}
          </NodeGroup>
          <NodeGroup
            data={stratifiedList}
            keyAccessor={(d) => d.id}
            {...nodeTransitions(
              xOffset,
              yOffset,
              clusterVerticalSpace,
              backboneGutter - gutter,
              duration,
              stratifiedList,
              stratifiedMap,
              annotationOpen,
              annotationHeight,
              bundleMap
            )}
          >
            {(nodes) => {
              return (
                <>
                  {nodes.map((node) => {
                    const { data: d, key, state } = node;
                    const popupTrigger = (
                      <g
                        key={key}
                        onClick={() => {
                          if (changeCurrent) {
                            changeCurrent(d.id);
                          }
                        }}
                        transform={
                          d.width === 0
                            ? translate(state.x, state.y)
                            : translate(state.x, state.y)
                        }
                      >
                        {d.width === 0 ? (
                          <BackboneNode
                            textSize={textSize}
                            iconOnly={iconOnly}
                            radius={backboneCircleRadius}
                            strokeWidth={backboneCircleStroke}
                            duration={duration}
                            first={first}
                            current={current === d.id}
                            node={d.data}
                            bundleMap={bundleMap}
                            nodeMap={stratifiedMap}
                            clusterLabels={clusterLabels}
                            annotationOpen={annotationOpen}
                            setAnnotationOpen={setAnnotationOpen}
                            exemptList={expandedClusterList}
                            setExemptList={setExpandedClusterList}
                            eventConfig={eventConfig}
                            annotationContent={annotationContent}
                            popupContent={popupContent}
                            expandedClusterList={expandedClusterList}
                          />
                        ) : popupContent !== undefined ? (
                          <Popup
                            content={popupContent(d.data)}
                            trigger={
                              <g
                                onClick={() => {
                                  setAnnotationOpen(-1);
                                }}
                              >
                                {keys.includes(d.id)
                                  ? bundleGlyph(d.data)
                                  : regularGlyph(d.data)}
                              </g>
                            }
                          />
                        ) : (
                          <g
                            onClick={() => {
                              setAnnotationOpen(-1);
                            }}
                          >
                            {regularGlyph(d.data)}
                          </g>
                        )}
                      </g>
                    );

                    return popupTrigger;
                  })}
                </>
              );
            }}
          </NodeGroup>
          <NodeGroup
            data={keys}
            keyAccessor={(key) => `${key}`}
            {...bundleTransitions(
              xOffset,
              verticalSpace,
              clusterVerticalSpace,
              backboneGutter - gutter,
              duration,
              expandedClusterList,
              stratifiedMap,
              stratifiedList,
              annotationOpen,
              annotationHeight,
              bundleMap
            )}
          >
            {(bundle) => (
              <>
                {bundle.map((b) => {
                  const { key, state } = b;
                  if (
                    bundleMap === undefined ||
                    (stratifiedMap[b.key] as any).width !== 0 ||
                    state.validity === false
                  ) {
                    return null;
                  }

                  return (
                    <g
                      key={key}
                      transform={translate(
                        state.x - gutter + 5,
                        state.y - clusterVerticalSpace / 2
                      )}
                    >
                      <rect
                        style={{ opacity: state.opacity }}
                        width={iconOnly ? 42 : sideOffset - 15}
                        height={state.height}
                        rx="10"
                        ry="10"
                        fill="none"
                        strokeWidth="2px"
                        stroke="rgb(248, 191, 132)"
                      ></rect>
                    </g>
                  );
                })}
              </>
            )}
          </NodeGroup>
        </g>
      </svg>
    </div>
  );
}

export default ProvVis;

const container = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "auto",
});
