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
