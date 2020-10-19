import { style } from 'typestyle';

// eslint-disable-next-line import/prefer-default-export
export const treeColor = (current?: boolean) => style({
  fill: current ? 'rgb(33, 133, 208)' : 'white',
  stroke: 'rgb(33, 133, 208)',
});
