import { Box } from '@mui/system';
import { useEffect, useMemo, useState } from 'react';
import Tree, { useTreeState } from 'react-hyper-tree';
import { TreeNode } from 'react-hyper-tree/dist/helpers/node';

import { Navbar } from './components/Navbar';
import { TrrackContext, useTrrackSetup } from './store/trrack';
import { useData } from './store/types';

function App() {
  const { data, isLoading, isError } = useData();
  const [counter, setCounter] = useState(0);
  const trrack = useTrrackSetup();
  const { addAction } = trrack;

  useEffect(() => {
    addAction("increment", {
      action() {
        setCounter((c) => c + 1);
      },
      inverse() {
        setCounter((c) => c - 1);
      },
    });

    addAction("decrement", {
      action() {
        setCounter((c) => c - 1);
      },
      inverse() {
        setCounter((c) => c + 1);
      },
    });
  }, [addAction]);

  const { required, handlers } = useTreeState({
    data: trrack.trrack.tree,
    id: "test",
    defaultOpened: true,
  });

  open(required.data, trrack.trrack.current.id);

  if (isLoading) return <div>Loading...</div>;

  if (isError) return <div>Something went wrong when fetching data.</div>;

  return (
    <TrrackContext.Provider value={trrack}>
      <Box sx={{ height: "100vh", width: "100vw" }}>
        <Navbar />
        {counter}
        <Tree
          {...required}
          {...handlers}
          gapMode="margin"
          setSelected={(node) => trrack.trrack.to(node.id)}
        />
      </Box>
    </TrrackContext.Provider>
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
