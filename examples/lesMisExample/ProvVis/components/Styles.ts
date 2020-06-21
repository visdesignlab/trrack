import { style } from 'typestyle';

export const treeColor = (current?: boolean) => {
  return style({
    fill: current ? '#ccc' : 'white',
    stroke: '#ccc'
  });
};
