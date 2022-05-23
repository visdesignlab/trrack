import { TreeNode } from 'react-hyper-tree/dist/helpers/node';

function App() {
  const baseValue = 10;

  return (
    <div style={{ padding: "1em" }}>
      <h1>Action tracking</h1>
      <h4>{baseValue}</h4>
      {/* <button onClick={() => trrack.applyAction(action)}>Add</button>
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
        </div> */}
    </div>
  );
}

export default App;

export function open(nodes: TreeNode[], current: string) {
  nodes.forEach((node) => {
    node.setSelected(current === node.id);
    node.setOpened(true);

    if (node.children) open(node.children, current);
  });
}
