import 'semantic-ui-css/semantic.min.css';

import { Meta } from '@storybook/react';
import {
  createAction, initProvenance, NodeID, ProvenanceGraph, StateNode,
} from '@visdesignlab/trrack';
import { observable } from 'mobx';
import { inject, observer, Provider } from 'mobx-react';
import React, { FC } from 'react';
import { Button } from 'semantic-ui-react';

import { ProvVis } from '../src';
import { BundleMap } from '../src/Utils/BundleMap';

interface Task {
  key: number;
  desc: string;
}

interface DemoState {
  tasks: Task[];
}

interface DemoAnnotation {
  note: string;
}

const defaultState: DemoState = {
  tasks: [],
};

type Events = 'Add Task' | 'Change Task';

const prov = initProvenance<DemoState, Events, DemoAnnotation>(defaultState);

class DemoStore {
  @observable graph: ProvenanceGraph<DemoState, Events, DemoAnnotation> =
    prov.graph;

  @observable tasks: Task[] = defaultState.tasks;

  @observable isRoot: boolean = false;

  @observable isLatest: boolean = false;
}

const demoStore = new DemoStore();

let map: BundleMap;
const idList: string[] = [];

const popup = (node: StateNode<DemoState, Events, DemoAnnotation>) => (
  <p>{node.id}</p>
);

const annotiation = () => (
  // console.log(JSON.parse(JSON.stringify(node)))

  <g transform="translate(0, 5)">
    <text x="10" y="35" fontSize="1em">
      Sample annotation
    </text>
  </g>
);
prov.addGlobalObserver(() => {
  const { current } = prov;

  const isRoot = current.id === prov.graph.root;

  demoStore.isRoot = isRoot;
  demoStore.isLatest = prov.current.children.length === 0;

  demoStore.graph = prov.graph;
});

prov.addObserver(
  (state) => state.tasks,
  (state?: DemoState) => {
    idList.push(prov.graph.current);
    if (idList.length > 30) {
      map = {
        [idList[12]]: {
          metadata: idList[12],
          bundleLabel: 'Clustering Label',
          bunchedNodes: [idList[10], idList[11]],
        },

        [idList[24]]: {
          metadata: idList[24],
          bundleLabel: 'Clustering Label',
          bunchedNodes: [idList[22], idList[23], idList[21]],
        },
      };
    }
    if (state) {
      demoStore.tasks = [...state.tasks];
    }
  },
);

prov.done();

let taskNo: number = 1;

const addTask = (desc: string = 'Random Task') => {
  const action = createAction<DemoState, Events>((state) => {
    state.tasks.push({ key: taskNo, desc });
  })
    .setLabel(`Adding task #: ${taskNo}`)
    .setEventType('Add Task');

  prov.apply(action);

  taskNo += 1;
};

function updateTask(taskId: number, desc: string = 'Changed String ') {
  const action = createAction<DemoState, Events>((state) => {
    const idx = state.tasks.findIndex((d) => d.key === taskId);
    if (idx !== -1) {
      state.tasks[idx].desc = desc;
    }
  })
    .setLabel(`Changing task #: ${taskId}`)
    .setEventType('Change Task');

  prov.apply(action);
}

const undo = () => prov.goBackOneStep();
const redo = () => prov.goForwardOneStep();
const goToNode = (nodeId: NodeID) => {
  prov.goToNode(nodeId);
};

/// //////////////////////////////////////////////////////////////

interface Props {
  store?: any;
}

const BaseComponent: FC<Props> = ({ store }: Props) => {
  const {
    graph, isRoot, isLatest, tasks,
  } = store!;
  const { root, nodes, current } = graph;

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ProvVis
          width={500}
          height={800}
          sideOffset={200}
          root={root}
          current={current}
          nodeMap={nodes}
          changeCurrent={goToNode}
          gutter={20}
          backboneGutter={40}
          verticalSpace={50}
          clusterVerticalSpace={50}
          bundleMap={map}
          clusterLabels={false}
          popupContent={popup}
          annotationHeight={50}
          annotationContent={annotiation}
        />
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Button.Group>
          <Button disabled={isRoot} onClick={undo}>
            Undo
          </Button>
          <Button.Or></Button.Or>
          <Button disabled={isLatest} onClick={redo}>
            Redo
          </Button>
          <Button.Or></Button.Or>
          <Button
            onClick={() => {
              addTask(Math.random().toString());
            }}
          >
            Add Task
          </Button>
        </Button.Group>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div>
          {tasks.map((d: any) => (
            <div key={d.key}>
              {d.key} --- {d.desc}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const BaseComponentWithStore = inject('store')(observer(BaseComponent));

// eslint-disable-next-line no-underscore-dangle
const _DemoComponent: FC = () => (
  <Provider store={demoStore}>
    <BaseComponentWithStore></BaseComponentWithStore>
  </Provider>
);

export default _DemoComponent;

const setupInital = () => {
  addTask();
  addTask();
  addTask();
  undo();
  undo();
  addTask();
  addTask();
  undo();
  undo();
  addTask();
  addTask();
  addTask();
  addTask();
  addTask();
  addTask();
  undo();
  undo();
  undo();
  undo();
  undo();
  addTask();
  addTask();
  addTask();
  addTask();
  addTask();
  addTask();
  undo();
  undo();
  undo();
  updateTask(1);
  updateTask(12);
  updateTask(14);
};

setupInital();
