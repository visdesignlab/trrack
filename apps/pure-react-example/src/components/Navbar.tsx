import RedoIcon from '@mui/icons-material/Redo';
import UndoIcon from '@mui/icons-material/Undo';
import { AppBar, Button, Toolbar, Typography } from '@mui/material';
import { useEffect } from 'react';

import { useTrrack } from '../store/trrack';

export function Navbar() {
  const { trrack, addAction, isAtLatest, isAtRoot } = useTrrack();

  useEffect(() => {
    addAction("add_random", {
      action() {
        console.log("Add random");
      },
      inverse() {
        console.log("Undo random");
      },
    });
  }, [addAction]);

  return (
    <>
      <AppBar sx={{ bgcolor: "white" }}>
        <Toolbar>
          <Typography color="black" variant="h6" sx={{ flexGrow: 1 }}>
            Action based tracking with React
          </Typography>
          <Button
            sx={{ margin: "0.2em" }}
            variant="contained"
            onClick={() => {
              trrack.apply({
                name: "increment",
                label: "Increase",
                doArgs: [],
                undoArgs: [],
              });
            }}
          >
            Increment
          </Button>
          <Button
            sx={{ margin: "0.2em" }}
            variant="contained"
            onClick={() => {
              trrack.apply({
                name: "add_random",
                label: "Random",
                doArgs: [],
                undoArgs: [],
              });
            }}
          >
            Add Random Vis
          </Button>
          <Button
            sx={{ margin: "0.2em" }}
            variant="contained"
            startIcon={<UndoIcon />}
            disabled={isAtRoot}
            onClick={() => trrack.undo()}
          >
            Undo
          </Button>
          <Button
            sx={{ margin: "0.2em" }}
            variant="contained"
            startIcon={<RedoIcon />}
            disabled={isAtLatest}
            onClick={() => trrack.redo()}
          >
            Redo
          </Button>
        </Toolbar>
      </AppBar>
      <Toolbar />
    </>
  );
}
