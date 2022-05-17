import { Action, initializeActionFunctionRegistryTracker, initializeTrrack } from '@trrack/core';
import { useCallback, useMemo, useState } from 'react';
import Tree, { useTreeState } from 'react-hyper-tree';
import { TreeNode } from 'react-hyper-tree/dist/helpers/node';

function useBaseValue(initialValue: number) {
  const [baseValue, setBaseValue] = useState(initialValue);

  const addOneToBaseValue = useCallback(() => {
    setBaseValue((b) => b + 1);
  }, []);

  const removeOneFromBaseValue = useCallback(() => {
    setBaseValue((b) => b - 1);
  }, []);

  const action: Action = {
    registry_name: "add_one",
    label: "Add one to base value",
    do: {
      args: [],
    },
    undo: {
      args: [],
    },
  };

  return {
    baseValue,
    addOneToBaseValue,
    removeOneFromBaseValue,
    action,
  };
}

function App() {
  const {
    baseValue,
    action,
    addOneToBaseValue,
    removeOneFromBaseValue,
  } = useBaseValue(0);

  const trrack = useMemo(() => {
    const tracker = initializeActionFunctionRegistryTracker();
    tracker.register("add_one", addOneToBaseValue, removeOneFromBaseValue);
    return initializeTrrack(tracker);
  }, [addOneToBaseValue, removeOneFromBaseValue]);

  const { required, handlers } = useTreeState({
    data: trrack.tree,
    id: "test",
    defaultOpened: true,
  });

  open(required.data, trrack.graph.current);

  return (
    <div style={{ padding: "1em" }}>
      <h1>Action tracking</h1>
      <h4>{baseValue}</h4>
      <button onClick={() => trrack.applyAction(action)}>Add</button>
      <button onClick={() => trrack.undo()}>Undo</button>
      <button onClick={() => trrack.redo()}>Redo</button>
      <div style={{ margin: "1em" }}>
        <Tree
          {...required}
          {...handlers}
          gapMode="margin"
          setSelected={(node, isSelected) => {
            if (isSelected) trrack.goToNode(node.id);
          }}
        />
      </div>
    </div>
  );
}

export default App;

function open(nodes: TreeNode[], current: string) {
  nodes.forEach((node) => {
    node.setSelected(current === node.id);
    node.setOpened(true);

    if (node.children) open(node.children, current);
  });
}
