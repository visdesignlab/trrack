import { Action } from '../../action';
import { ANonRootNode, IActionNode, INode } from './types';

export class ActionNode<K, D extends unknown[], U extends unknown[], R>
  extends ANonRootNode
  implements IActionNode<K, D, U, R>
{
  action: Action<K, D, U>;
  type: 'ActionNode' = 'ActionNode';
  results?: R;

  constructor(parent: INode, action: Action<K, D, U>, results?: R) {
    super(parent, action.label);
    this.action = action;
    this.results = results;
  }
}
