import { ActionType } from '../src';
import { isChildNode, Meta } from '../src/Types/Nodes';
import {
  initialState,
  setupProvenanceAndAction,
  setupTodoManager,
} from './helper';

describe('action object is valid', () => {
  const { action } = setupProvenanceAndAction(initialState);

  it('action object should not be null ', () => {
    expect(action).not.toBeNull();
  });
});

describe('apply action should work properly', () => {
  it('should throw error when applying action without setting label', () => {
    const { provenance, action } = setupProvenanceAndAction(
      initialState,
      false
    );

    expect(() => provenance.apply(action())).toThrowError(
      new Error('Please specify a default label when you create the action')
    );
  });

  it('new node should have correct label', () => {
    const { provenance, action } = setupProvenanceAndAction(initialState);
    const label = 'Increase counter by 1';
    action.setLabel(label);
    provenance.apply(action());

    expect(provenance.current.label).toBe(label);
  });

  it('new node should have correct custom label', () => {
    const { provenance, action } = setupProvenanceAndAction(initialState);
    const label = 'Increase counter by 1';
    const customLabel = 'Custom';
    action.setLabel(label);
    provenance.apply(action(), customLabel);

    expect(provenance.current.label).toBe(customLabel);
  });

  it('new node should have correct action type', () => {
    const { provenance, action } = setupProvenanceAndAction(initialState);
    const label = 'Increase counter by 1';
    action.setLabel(label).setActionType('Ephemeral');
    provenance.apply(action());

    expect(provenance.current.actionType).toBe<ActionType>('Ephemeral');
  });

  it('should increment counter value by 1', () => {
    const { provenance, action } = setupProvenanceAndAction(initialState);

    const originalValue = provenance.getState(provenance.current).counter;
    provenance.apply(action.setLabel('Increase Counter')());
    const newValue = provenance.getState(provenance.current).counter;

    expect(newValue - originalValue).toEqual(1);
  });

  it('should change message according to argument', () => {
    const { provenance, changeMessageAction } = setupProvenanceAndAction(
      initialState
    );

    const msg = 'Hello, World!';
    provenance.apply(changeMessageAction(msg));
    const newMessage = provenance.getState(provenance.current).message;
    expect(newMessage).toEqual(msg);
  });

  it('should set metadata', () => {
    const { provenance, action } = setupProvenanceAndAction(initialState);

    const val = 'Hello, World!';
    const meta: Meta = {
      testMetaData: val,
    };

    provenance.apply(action.setLabel('Increment counter').setMetaData(meta)());

    const currentNode = provenance.current;
    if (isChildNode(currentNode)) {
      expect(currentNode.metadata.testMetaData).toEqual(val);
    } else {
      throw new Error('Should not be root node');
    }
  });

  it('should set event type', () => {
    const { provenance, action } = setupProvenanceAndAction(initialState);

    provenance.apply(
      action.setLabel('Increment Counter').setEventType('IncreaseCounter')()
    );

    const currentNode = provenance.current;
    if (isChildNode(currentNode)) {
      expect(currentNode.metadata.eventType).toEqual('IncreaseCounter');
    } else {
      throw new Error('Should not be root node');
    }
  });

  it('should save diff', () => {
    const { provenance, changeName, addTodoAction } = setupTodoManager();

    provenance.apply(changeName('New Name'));
    provenance.apply(
      addTodoAction({
        title: 'Task 1',
        description: 'This is a test task',
        status: 'incomplete',
      })
    );
    expect('diffs' in provenance.current).toEqual(true);
  });

  it('should save complete state', () => {
    const { provenance, changeName, addTodoAction } = setupTodoManager();

    provenance.apply(changeName('New Name'));
    provenance.apply(
      addTodoAction.saveStateMode('Complete')({
        title: 'Task 1',
        description: 'This is a test task',
        status: 'incomplete',
      })
    );

    expect('state' in provenance.current).toEqual(true);
  });
});
