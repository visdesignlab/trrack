import React from 'react';
import { Popup } from 'semantic-ui-react';

type LinkProps = {} & React.SVGProps<SVGLineElement>;

export interface StippleNodeConfig<T, S extends string, A> {
  numHidden: number;
  state: LinkProps;
  fill: string;
  stroke: string;
  strokeWidth: number;
}
function StippleNode<T, S extends string, A>({
  numHidden,
  state,
  fill,
  stroke,
  strokeWidth,
}: StippleNodeConfig<T, S, A>) {
  const popup = `${numHidden} node(s) hidden`;
  const style = {
    borderRadius: 0,
    opacity: 0.7,
    padding: '.25em',
  };
  return (
    <Popup
      content={popup}
      position="right center"
      style={style}
      trigger={
        <line
          {...state}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeDasharray="3, 8"
          strokeLinecap="round"
          fill={fill}
        />
      }
    ></Popup>
  );
}
export default StippleNode;
