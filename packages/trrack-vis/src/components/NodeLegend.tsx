import { ProvenanceGraph } from '@visdesignlab/trrack';

import React from 'react';
import { style } from 'typestyle';

import { Button } from '@material-ui/core';
import { EventConfig } from '../Utils/EventConfig';

export interface NodeLegendConfig<T, S extends string, A> {
  graph?: ProvenanceGraph<T, S, A>;
  eventTypes: Set<string>;
  legendButton: string;
  setLegendButton:(b: string) => void;

}

function NodeLegend<T, S extends string, A>({
  graph,
  eventTypes,
  legendButton,
  setLegendButton,

} : NodeLegendConfig<T, S, A>) {
  if (graph === undefined) {
    return null;
  }

  const isAtRoot = graph.root === graph.current;
  const isAtLatest = graph.nodes[graph.current].children.length === 0;

  const margin = {
    marginLeft: '20px',
    display: 'block',
  } as React.CSSProperties;

  const button = {
    display: 'block',
  } as React.CSSProperties;

  const types = Array.from(eventTypes);

  return (
    <div style={margin} >
      {types.map((item) => (
        <Button
          variant="outlined"
          style={button}
          className={undoButtonStyle}
          onClick= {() => { setLegendButton(item); }}
          key={item}>
          {item}
        </Button>
      ))}
    </div>

  );
}

const undoButtonStyle = style({
  marginTop: '2px',
  borderRadius: '2px',
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

// const redoButtonStyle = style({
//   marginTop: '2px',
//   borderRadius: '2px',
//   display: 'inline-block',
//   cursor: 'pointer',
//   fontFamily: 'Lato,Helvetica Neue,Arial,Helvetica,sans-serif',
//   fontSize: '14px',

//   $nest: {
//     '&:hover': {
//       backgroundColor: '#6c7c7c',
//     },

//     '&:active': {
//       backgroundColor: '#6c7c7c',
//     },

//   },

// });

export default NodeLegend;
