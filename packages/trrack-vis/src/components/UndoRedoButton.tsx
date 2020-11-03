import { ProvenanceGraph } from '@visdesignlab/trrack';

import React from 'react';
import { style } from 'typestyle';

import { Button } from 'semantic-ui-react';

export interface UndoRedoConfig<T, S extends string, A> {
  undoCallback: () => void;
  redoCallback: () => void;
  graph?: ProvenanceGraph<T, S, A>;
}

function UndoRedoButton<T, S extends string, A>({
  graph,
  undoCallback,
  redoCallback,
} : UndoRedoConfig<T, S, A>) {
  if (graph === undefined) {
    return null;
  }

  const isAtRoot = graph.root === graph.current;
  const isAtLatest = graph.nodes[graph.current].children.length === 0;

  const margin = {
    marginRight: '3px',
  } as React.CSSProperties;

  return (
    <div>
      <Button
        variant="outlined"
        className={undoButtonStyle}
        disabled={isAtRoot}
        onClick={undoCallback}
      >
        <i style={margin} className="fas fa-undo marginRight"></i>
        Undo
      </Button>

      <Button
        variant="outlined"
        className={redoButtonStyle}
        disabled={isAtLatest}
        onClick={redoCallback}
      >
        <i style={margin} className="fas fa-redo marginRight"></i>
        Redo
      </Button>
    </div>
  );
}

const undoButtonStyle = style({
  marginTop: '2px',
  borderRadius: '2px',
  display: 'inline-block',
  cursor: 'pointer',
  fontFamily: 'Lato,Helvetica Neue,Arial,Helvetica,sans-serif',
  fontSize: '14px',
  marginRight: '1px',
  $nest: {
    '&:hover': {
      backgroundColor: '#6c7c7c',
    },
    '&:active': {
      backgroundColor: '#6c7c7c',
    },
  },
});

const redoButtonStyle = style({
  marginTop: '2px',
  borderRadius: '2px',
  display: 'inline-block',
  cursor: 'pointer',
  fontFamily: 'Lato,Helvetica Neue,Arial,Helvetica,sans-serif',
  fontSize: '14px',

  $nest: {
    '&:hover': {
      backgroundColor: '#6c7c7c',
    },

    '&:active': {
      backgroundColor: '#6c7c7c',
    },

  },

});

export default UndoRedoButton;
