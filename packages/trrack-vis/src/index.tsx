import React, { FC, HTMLAttributes, ReactChild } from 'react';

import ProvVis from './components/ProvVis';
import { ProvVisCreator, UndoRedoButtonCreator } from './components/ProvVisCreator';
import { Config, EventConfig } from './Utils/EventConfig';

export interface Props extends HTMLAttributes<HTMLDivElement> {
  /** custom content, defaults to 'the snozzberries taste like snozzberries' */
  children?: ReactChild;
}

// Please do not use types off of a default export module or else Storybook Docs will suffer.
// see: https://github.com/storybookjs/storybook/issues/9556
/**
 * A custom Thing component. Neat!
 */
export const Thing: FC<Props> = ({ children }) => <div>{children || 'the snozzberries taste like snozzberries'}</div>;

export {
  ProvVis, EventConfig, Config, ProvVisCreator, UndoRedoButtonCreator,
};
