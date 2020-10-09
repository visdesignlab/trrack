import { style } from 'typestyle';

export const treeColor = (current?: boolean) => {
  return style({
    fill: current ? 'rgb(33, 133, 208)' : 'white',
    stroke: 'rgb(33, 133, 208)'
  });
};
