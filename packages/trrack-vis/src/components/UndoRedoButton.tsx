
import { ProvenanceGraph } from '@visdesignlab/trrack';

import React from 'react';
import { style } from 'typestyle';

export interface UndoRedoConfig<T, S extends string, A> {
  undoCallback: () => void;
  redoCallback: () => void;
  graph?: ProvenanceGraph<T, S, A>;
}

function UndoRedoButton<T, S extends string, A>({
  graph,
  undoCallback,
  redoCallback
} : UndoRedoConfig<T, S, A> ) {
  if(graph === undefined)
  {
    return null;
  }

  const isAtRoot = graph.root === graph.current;
  const isAtLatest = graph.nodes[graph.current].children.length === 0;

  let margin = {
    marginRight: "3px"
  } as React.CSSProperties

  return (
    <div>
     <button
       className={undoButtonStyle}
       disabled={isAtRoot}
       onClick={undoCallback}
      ><i style={margin} className="fas fa-undo marginRight"></i>
        Undo</button>


     <button
       className={redoButtonStyle}
       disabled={isAtLatest}
       onClick={redoCallback}
       ><i style={margin} className="fas fa-redo marginRight"></i>
      Redo</button>


    </div>
 );
}

const undoButtonStyle = style({
  backgroundColor:"#768d87",
	borderRadius:"2px",
	border:"none",
	display:"inline-block",
	cursor:"pointer",
	color:"#ffffff",
  fontFamily:"Lato,Helvetica Neue,Arial,Helvetica,sans-serif",
	fontSize:"14px",
	padding:"5px 15px",
  marginRight: "1px",
  marginLeft: "10px",
  $nest: {
    "&:hover": {
      backgroundColor: "#6c7c7c"
    },

    "&:disabled": {
      backgroundColor: "#a8b3b0"
    },

    "&:active": {
      backgroundColor: "#6c7c7c"
    }
  }
});

const marginRight = style({
  marginRight:"3px",

});

const redoButtonStyle = style({
  backgroundColor:"#768d87",
	borderRadius:"2px",
	border:"none",
	display:"inline-block",
	cursor:"pointer",
	color:"#ffffff",
	fontFamily:"Lato,Helvetica Neue,Arial,Helvetica,sans-serif",
	fontSize:"14px",
	padding:"5px 15px",

  $nest: {
    "&:hover": {
      backgroundColor: "#6c7c7c"
    },

    "&:disabled": {
      backgroundColor: "#a8b3b0"
    },

    "&:active": {
      backgroundColor: "#6c7c7c"
    }

  }

});

export default UndoRedoButton;
