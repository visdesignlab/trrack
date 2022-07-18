import React from 'react';
import translate from '../src/Utils/translate';

interface AddTaskGlyphProps {
  size?: number;
  fill?: string;
  scale?: number;
  background?: string;
}

export function AddTaskGlyph({
  size = 15,
  fill = '#ccc',
  background = 'white',
}: AddTaskGlyphProps) {
  return (
    <g>
      <circle fill={background} r={size} />
      <g transform={translate(-size / 2, -size / 2)}>
        <rect fill={fill} width={size} height={3} />
        <rect fill={fill} y="4" width={size} height={3} />
        <rect fill="green" y="8" width={size} height={3} />
      </g>
    </g>
  );
}

interface ChangeTaskGlyphProps {
  size?: number;
  fill?: string;
  background?: string;
}

export function ChangeTaskGlyph({
  size = 15,
  fill = '#ccc',
  background = 'white',
}: ChangeTaskGlyphProps) {
  return (
    <g>
      <circle fill={background} r={size} />
      <g transform={translate(-size / 2, -size / 2)}>
        <rect fill={fill} width={size} height={3} />
        <rect fill="#f00" y="4" width={size} height={3} />
        <rect fill={fill} y="8" width={size} height={3} />
      </g>
    </g>
  );
}
