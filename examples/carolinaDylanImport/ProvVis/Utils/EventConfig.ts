import {ReactChild} from 'react';

export type Config = {
  regularGlyph: ReactChild;
  currentGlyph: ReactChild;
  backboneGlyph: ReactChild;
  bundleGlyph: ReactChild;
};

export type EventConfig<E extends string> = {
  [key: string]: Partial<Config>;
};
