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
import { AddTaskGlyph, ChangeTaskGlyph } from './Nodes';

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
    props.provenance.goToNode(nodeId);
  };

  const bookmarkNode = (nodeId: NodeID) => {
    props.provenance.setBookmark(nodeId, !props.provenance.getBookmark(nodeId));
  };

  const annotateNode = (nodeId: NodeID, annotation: string) => {
    props.provenance.addAnnotation(annotation, nodeId);
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
          currentNode={props.current}
          nodeMap={props.provenance.graph.nodes}
          config={{
            changeCurrent: goToNode,
            bookmarkNode: bookmarkNode,
            annotateNode: annotateNode,
            // iconConfig: {
            //   'Add Task': {
            //     glyph: <AddTaskGlyph />,
            //     hoverGlyph: <AddTaskGlyph size={17} />,
            //     currentGlyph: <AddTaskGlyph size={20} />,
            //   },
            //   'Change Task': {
            //     glyph: <ChangeTaskGlyph />,
            //     hoverGlyph: <ChangeTaskGlyph size={17} />,
            //     currentGlyph: <ChangeTaskGlyph size={20} />,
            //   },
            // },
          }}
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
