import { ProvenanceGraph } from '@visdesignlab/trrack';

import React, { Fragment } from 'react';
import { style } from 'typestyle';
import {
  Button, Checkbox, Label, IconProps,
} from 'semantic-ui-react';
import { SemanticShorthandItem } from 'semantic-ui-react/dist/commonjs/generic';
import { treeColor } from './Styles';

import { EventConfig } from '../Utils/EventConfig';
import translate from '../Utils/translate';

export interface NodeLegendConfig<T, S extends string, A> {
  graph?: ProvenanceGraph<T, S, A>;
  eventTypes: Set<string>;
  legendVals: string[];
  setLegendVals: (b: string[]) => void;
  eventConfig?: EventConfig<S>;
}

function NodeLegend<T, S extends string, A>({
  graph,
  eventTypes,
  legendVals,
  setLegendVals,
  eventConfig,

} : NodeLegendConfig<T, S, A>) {
  if (graph === undefined) {
    return null;
  }
  const radius = 5;
  const strokeWidth = 2;

  const cursorStyle = {
    cursor: 'pointer',
  } as React.CSSProperties;

  let glyph = (
    <circle
      style={cursorStyle}
      className={treeColor(true)}
      r={radius}
      strokeWidth={strokeWidth}
    />
  );

  console.log(eventTypes.values);
  const glyphs: SemanticShorthandItem<IconProps>[] = [];
  const selectedGlyphs: SemanticShorthandItem<IconProps>[] = [];
  if (eventConfig) {
    eventTypes.forEach((c) => {
      const { backboneGlyph, currentGlyph } = eventConfig[c];
      glyph = (
        <g style={cursorStyle} fontWeight={'none'}>
          {backboneGlyph}
        </g>
      );
      glyphs.push(glyph);
      glyph = (
        <g style={cursorStyle} fontWeight={'none'}>
          {currentGlyph}
        </g>
      );
      selectedGlyphs.push(glyph);
    });
  }

  const button = {
    display: 'block',
    width: '115px',
    height: '35px',
    marginLeft: '295px',
    background: 'white',
  } as React.CSSProperties;

  const legendStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: '100px',
    height: '0px',
  } as React.CSSProperties;

  const types = Array.from(eventTypes);

  function updateValues(item: string) {
    if (legendVals.includes(item)) {
      setLegendVals(legendVals.filter((i) => i !== item));
    } else {
      setLegendVals([...legendVals, item]);
    }
  }

  return (
    <div style={legendStyle}>
      {types.map((item, index) => (
        <Fragment key={index}>
          <Label
            variant="outlined"
            style={button}
            className={undoButtonStyle}
            onClick={() => {
              updateValues(item);
            }}
            active={legendVals.includes(item)}
            key={index}
          >
            <svg height={20} width={20} transform={translate(-5, 5)}>
              <g
                key={item}
                transform={translate(10, 10)}
                style={{ opacity: 1 }}
              >
                <g>{legendVals.includes(item) ? selectedGlyphs[index] : glyphs[index]} </g>
              </g>
            </svg>
            {item}
          </Label>
        </Fragment>
      ))}
    </div>
  );
}

const undoButtonStyle = style({
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

export default NodeLegend;
