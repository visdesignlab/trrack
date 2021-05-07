/* eslint-disable no-plusplus */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable no-unused-vars */
import {
  DiffNode,
  isChildNode,
  NodeID,
  Nodes,
  Provenance,
  ProvenanceNode,
  StateNode,
} from '@visdesignlab/trrack';
import {
  HierarchyNode,
  stratify,
  symbol,
  symbolCircle,
  symbolCross,
  symbolDiamond,
  symbolSquare,
  symbolStar,
  symbolTriangle,
  symbolWye,
} from 'd3';
import React, { ReactChild, useEffect, useState } from 'react';
import { NodeGroup } from 'react-move';
import { Popup, Tab } from 'semantic-ui-react';
import { style } from 'typestyle';
import { BundleMap } from '../Utils/BundleMap';
import { EventConfig } from '../Utils/EventConfig';
import findBundleParent from '../Utils/findBundleParent';
import translate from '../Utils/translate';
import { treeLayout } from '../Utils/TreeLayout';
import BackboneNode from './BackboneNode';
import BookmarkListView from './BookmarkListView';
import bundleTransitions from './BundleTransitions';
import Link from './Link';
import linkTransitions from './LinkTransitions';
import nodeTransitions from './NodeTransitions';
import { treeColor } from './Styles';
import UndoRedoButton from './UndoRedoButton';

interface ProvVisProps<T, S extends string, A> {
  root: NodeID;
  sideOffset?: number;
  iconOnly?: boolean;
  current: NodeID;
  nodeMap: Nodes<S, A>;
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
  popupContent?: (nodeId: StateNode<S, A>) => ReactChild;
  annotationContent?: (nodeId: StateNode<S, A>) => ReactChild;
  undoRedoButtons?: boolean;
  bookmarkToggle?: boolean;
  bookmarkListView?: boolean;
  editAnnotations?: boolean;
  prov?: Provenance<T, S, A>;
  ephemeralUndo?: boolean;
}

export type StratifiedMap<T, S, A> = {
  [key: string]: HierarchyNode<ProvenanceNode<S, A>>;
};

export type StratifiedList<T, S, A> = HierarchyNode<ProvenanceNode<S, A>>[];

function ProvVis<T, S extends string, A>({
  nodeMap,
  root,
  current,
  changeCurrent,
  width = 400,
  height = 800,
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
  bundleMap = {},
  eventConfig,
  popupContent,
  annotationContent,
  editAnnotations = false,
  prov,
  ephemeralUndo = false,
}: ProvVisProps<T, S, A>) {
  const [first, setFirst] = useState(true);
  const [bookmark, setBookmark] = useState<any>(null);
  const [annotationOpen, setAnnotationOpen] = useState(-1);
  const [tabsValue, setValue] = useState(0);

  let list: string[] = [];
  const eventTypes = new Set<string>();
  for (const j in nodeMap) {
    const child = nodeMap[j];
    if (isChildNode(child)) {
      if (child.metadata.eventType) {
        eventTypes.add(child.metadata.eventType);
      }

      if (
        child.actionType === 'Ephemeral' &&
        child.children.length === 1 &&
        (nodeMap[child.parent].actionType !== 'Ephemeral' ||
          nodeMap[child.parent].children.length > 1)
      ) {
        const group: string[] = [];
        let curr = child;
        while (curr.actionType === 'Ephemeral') {
          group.push(curr.id);
          if (
            curr.children.length === 1 &&
            nodeMap[curr.children[0]].actionType === 'Ephemeral'
          ) {
            curr = nodeMap[curr.children[0]] as DiffNode<S, A>;
          } else {
            break;
          }
        }

        bundleMap[child.id] = {
          metadata: '',
          bundleLabel: '',
          bunchedNodes: group,
        };
      }
    }
  }

  if (bundleMap) {
    list = list.concat(Object.keys(bundleMap));
  }

  function setDefaultConfig<E extends string>(
    types: Set<string>
  ): EventConfig<E> {
    const symbols = [
      symbol().type(symbolStar).size(50),
      symbol().type(symbolDiamond),
      symbol().type(symbolTriangle),
      symbol().type(symbolCircle),
      symbol().type(symbolCross),
      symbol().type(symbolSquare),
      symbol().type(symbolWye),
    ];

    // Find nodes in the clusters whose entire cluster is on the backbone.
    const conf: EventConfig<E> = {};
    let counter = 0;

    for (const j of types) {
      conf[j] = {};
      conf[j].backboneGlyph = (
        <path
          strokeWidth={2}
          className={treeColor(false)}
          d={symbols[counter]()!}
        />
      );

      conf[j].bundleGlyph = (
        <path
          strokeWidth={2}
          className={treeColor(false)}
          d={symbols[counter]()!}
        />
      );

      conf[j].currentGlyph = (
        <path
          strokeWidth={2}
          className={treeColor(true)}
          d={symbols[counter]()!}
        />
      );

      conf[j].regularGlyph = (
        <path
          strokeWidth={2}
          className={treeColor(false)}
          d={symbols[counter]()!}
        />
      );

      counter += 1;
    }

    return conf;
  }

  const [expandedClusterList, setExpandedClusterList] = useState<string[]>(
    Object.keys(bundleMap)
  );

  if (!eventConfig && eventTypes.size > 0 && eventTypes.size < 8) {
    eventConfig = setDefaultConfig<S>(eventTypes);
  }

  useEffect(() => {
    setFirst(false);
  }, []);

  const nodeList = Object.values(nodeMap).filter(() => true);

  const copyList = Array.from(nodeList);

  const keys = bundleMap ? Object.keys(bundleMap) : [];

  // Find a list of all nodes included in a bundle.
  let bundledNodes: string[] = [];

  if (bundleMap) {
    for (const key of keys) {
      bundledNodes = bundledNodes.concat(bundleMap[key].bunchedNodes);
      bundledNodes.push(key);
    }
  }

  const strat = stratify<ProvenanceNode<S, A>>()
    .id((d) => d.id)
    .parentId((d) => {
      if (d.id === root) return null;

      if (isChildNode(d)) {
        // If you are a unexpanded bundle, find your parent by going straight up.
        if (
          bundleMap &&
          Object.keys(bundleMap).includes(d.id) &&
          !expandedClusterList.includes(d.id)
        ) {
          let curr = d;

          // eslint-disable-next-line no-constant-condition
          while (true) {
            const localCurr = curr;

            if (
              !bundledNodes.includes(localCurr.parent) ||
              Object.keys(bundleMap).includes(localCurr.parent)
            ) {
              return localCurr.parent;
            }

            const temp = copyList.filter((c) => c.id === localCurr.parent)[0];

            if (isChildNode(temp)) {
              curr = temp;
            }
          }
        }

        const bundleParents = findBundleParent(d.parent, bundleMap);
        let collapsedParent;

        let allExpanded = true;

        for (const j in bundleParents) {
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
      }
      return null;
    });

  for (let i = 0; i < nodeList.length; i++) {
    const bundleParents = findBundleParent(nodeList[i].id, bundleMap);

    let allExpanded = true;

    for (const j in bundleParents) {
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

  stratifiedList.forEach((c) => {
    stratifiedMap[c.id!] = c;
  });
  treeLayout(stratifiedMap, current, root);

  let maxHeight = 0;
  let maxWidth = 0;

  for (const j in stratifiedList) {
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

  function regularGlyph(node: ProvenanceNode<S, A>) {
    if (eventConfig) {
      const { eventType } = node.metadata;
      if (
        eventType &&
        eventType in eventConfig &&
        eventType !== 'Root' &&
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

  function bundleGlyph(node: ProvenanceNode<S, A>) {
    if (eventConfig) {
      const { eventType } = node.metadata;
      if (eventType && eventType in eventConfig && eventType !== 'Root') {
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

  const svgWidth = width;

  const overflowStyle = {
    overflowX: 'auto',
    overflowY: 'auto',
  } as React.CSSProperties;

  const tabsStyle = {
    backgroundColor: 'lightgrey',
    width: '270px',
  } as React.CSSProperties;

  const bookmarkTabView = (
    <svg
      style={{ overflow: 'visible' }}
      height={maxHeight < height ? height : maxHeight}
      width={svgWidth}
      id="bookmarkView"
    >
      <g id={'globalG'} transform={translate(shiftLeft, topOffset)}>
        <BookmarkListView
          graph={prov ? prov.graph : undefined}
          eventConfig={eventConfig}
          currentNode={current}
        />
      </g>
    </svg>
  );

  const graphTabView = (
    <div>
      <div id="undoRedoDiv">
        <UndoRedoButton
          graph={prov ? prov.graph : undefined}
          undoCallback={() => {
            if (prov) {
              if (ephemeralUndo) {
                prov.goBackToNonEphemeral();
              } else {
                prov.goBackOneStep();
              }
            }
          }}
          redoCallback={() => {
            if (prov) {
              if (ephemeralUndo) {
                prov.goForwardToNonEphemeral();
              } else {
                prov.goForwardOneStep();
              }
            }
          }}
        />
      </div>

      <svg
        style={{ overflow: 'visible' }}
        id={'topSvg'}
        height={maxHeight < height ? height : maxHeight}
        width={svgWidth}
      >
        <rect height={height} width={width} fill="none" stroke="none" />
        <g id={'globalG'} transform={translate(shiftLeft, topOffset)}>
          <NodeGroup
            data={links}
            keyAccessor={(link) => `${link.source.id}${link.target.id}`}
            {...linkTransitions(
              xOffset,
              yOffset,
              clusterVerticalSpace,
              backboneGutter - gutter,
              duration,
              annotationOpen,
              annotationHeight
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
                        fill={'#ccc'}
                        stroke={'#ccc'}
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
              annotationOpen,
              annotationHeight
            )}
          >
            {(nodes) => (
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
                      onMouseOver={() => {
                        setBookmark(d.id);
                      }}
                      onMouseOut={() => {
                        setBookmark(null);
                      }}
                      transform={
                        d.width === 0
                          ? translate(state.x, state.y)
                          : translate(state.x, state.y)
                      }
                    >
                      {d.width === 0 && prov ? (
                        <g>
                          <rect
                            width="200"
                            height="25"
                            transform="translate(0, -12.5)"
                            opacity="0"
                          ></rect>
                          ,
                          <BackboneNode
                            prov={prov}
                            textSize={textSize}
                            iconOnly={iconOnly}
                            radius={backboneCircleRadius}
                            strokeWidth={backboneCircleStroke}
                            duration={duration}
                            first={first}
                            current={current === d.id}
                            node={d.data}
                            setBookmark={setBookmark}
                            bookmark={bookmark}
                            bundleMap={bundleMap}
                            nodeMap={stratifiedMap}
                            clusterLabels={clusterLabels}
                            annotationOpen={annotationOpen}
                            setAnnotationOpen={setAnnotationOpen}
                            exemptList={expandedClusterList}
                            editAnnotations={editAnnotations}
                            setExemptList={setExpandedClusterList}
                            eventConfig={eventConfig}
                            annotationContent={annotationContent}
                            popupContent={popupContent}
                            expandedClusterList={expandedClusterList}
                          />
                        </g>
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
            )}
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

  const panes = [
    {
      menuItem: { key: 'Graph', icon: 'share alternate', content: 'Graph' },
      render: () => <Tab.Pane attached={false}>{graphTabView}</Tab.Pane>,
    },
    {
      menuItem: {
        key: 'Bookmarks/Annotations',
        icon: 'bookmark',
        content: 'Bookmarks/Annotations',
      },
      render: () => <Tab.Pane attached={false}>{bookmarkTabView}</Tab.Pane>,
    },
  ];

  return (
    <div style={overflowStyle} className={container} id="prov-vis">
      <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
    </div>
  );
}

export default ProvVis;

const container = style({
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'auto',
});
