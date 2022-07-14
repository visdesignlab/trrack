import {
  createAction,
  initProvenance,
  NodeID,
  Provenance,
  ProvenanceGraph,
  StateNode,
} from '@visdesignlab/trrack';
import React, { FC, useCallback, useMemo, useState, useEffect } from 'react';
import { ProvVis } from '../src/componentsNew/ProvVis';

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

/// //////////////////////////////////////////////////////////////

interface Props {
  provenance: Provenance<DemoState, Events, DemoAnnotation>;
  current: NodeID;
}

const BaseComponent: FC<Props> = (props) => {
  const goToNode = (nodeId: NodeID) => {
    console.log(nodeId);
    props.provenance.goToNode(nodeId);
  };
  return (
    <>
      <div
        style={{
          height: '2000px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ProvVis
          root={props.provenance.graph.root}
          changeCurrent={goToNode}
          current={props.current}
          nodeMap={props.provenance.graph.nodes}
          ephemeralUndo={false}
        />
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      ></div>
    </>
  );
};

// eslint-disable-next-line no-underscore-dangle
const _DemoComponent: FC = () => {
  const [current, setCurrent] = useState<NodeID>('');
  const [taskLength, setTaskLength] = useState<number>(1);

  const prov = useMemo(() => {
    const innerProv = initProvenance<DemoState, Events, DemoAnnotation>(
      defaultState
    );

    innerProv.addGlobalObserver(() => {
      setCurrent(innerProv.current.id);
    });

    innerProv.done();

    return innerProv;
  }, []);

  const addTask = useCallback((desc: string = 'Random Task') => {
    const action = createAction<DemoState, [string], Events>(
      (state, dsc: string) => {
        state.tasks.push({ key: taskLength, desc: dsc });
      }
    )
      .setLabel(`Adding task #: ${taskLength}`)
      .setEventType('Add Task');

    prov.apply(action(desc));

    setTaskLength(taskLength + 1);
  }, []);

  const updateTask = useCallback(
    (taskId: number, desc: string = 'Changed String ') => {
      const action = createAction<DemoState, [], Events>((state) => {
        const idx = state.tasks.findIndex((d) => d.key === taskId);
        if (idx !== -1) {
          state.tasks[idx].desc = desc;
        }
      })
        .setLabel(`Changing task #: ${taskId}`)
        .setEventType('Change Task');

      prov.apply(action());
    },
    []
  );

  const undo = () => prov.goBackOneStep();
  const redo = () => prov.goForwardOneStep();

  const addTestData = useCallback(() => {
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
  }, []);

  useEffect(() => {
    addTestData();
  }, []);

  return <BaseComponent provenance={prov} current={current}></BaseComponent>;
};

export default _DemoComponent;
