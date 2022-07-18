import { ProvenanceNode } from '@visdesignlab/trrack';
import React, { ReactChild } from 'react';

export interface Config<S extends string, A> {
  glyph: (node?: ProvenanceNode<S, A>) => ReactChild;
  currentGlyph: (node?: ProvenanceNode<S, A>) => ReactChild;
  backboneGlyph: (node?: ProvenanceNode<S, A>) => ReactChild;
  bundleGlyph: (node?: ProvenanceNode<S, A>) => ReactChild;
  hoverGlyph: (node?: ProvenanceNode<S, A>) => ReactChild;
}

export type IconConfig<S extends string, A> = {
  [key: string]: Partial<Config<S, A>>;
};

export function defaultIcon<S extends string, A>(color: string): Config<S, A> {
  return {
    glyph: () => <circle r={5} fill={'white'} stroke={color} strokeWidth={2} />,
    currentGlyph: () => (
      <circle r={5} fill={color} stroke={color} strokeWidth={2} />
    ),
    backboneGlyph: () => (
      <circle r={5} fill={'white'} stroke={color} strokeWidth={2} />
    ),
    bundleGlyph: () => (
      <circle r={5} fill={'white'} stroke={color} strokeWidth={2} />
    ),
    hoverGlyph: () => (
      <circle r={6} fill={'white'} stroke={color} strokeWidth={2} />
    ),
  };
}
