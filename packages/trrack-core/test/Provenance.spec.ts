import { compressToEncodedURIComponent } from 'lz-string';
import {
  setupTodoManager,
  TodoManager,
  TodoEvents,
  TodoArtifacts,
  setupProvenanceAndAction,
  initialState,
  State,
} from './helper';
import { isChildNode, StateNode, DiffNode } from '../src/Types/Nodes';

function serializeJavascript(obj: any) {
  const str = JSON.stringify(obj, (_, val) => {
    if (val instanceof Set) {
      return {
        type: 'Set',
        arr: Array.from(val),
      };
    }
    return val;
  });
  return str;
}

describe('Testing provenance functions', () => {
  // Testing state
  describe('state: should return proper state of current node', () => {
    it('should return initial state.', () => {
      const { provenance, initState } = setupTodoManager();
      expect(provenance.state).toEqual(initState);
    });

    it('should return current state after applying action', () => {
      const { provenance, initState, changeName } = setupTodoManager();
      provenance.apply(changeName('JEST'));
      expect(provenance.state).toEqual({ ...initState, user: 'JEST' });
    });
  });

  it('current: current should return current node', () => {
    const { provenance, changeName } = setupTodoManager();
    provenance.apply(changeName('JEST'));

    const { graph } = provenance;

    expect(graph.nodes[graph.current]).toEqual(provenance.current);
  });

  it('root: root should return root node', () => {
    const { provenance } = setupTodoManager();

    const { graph } = provenance;

    expect(graph.nodes[graph.root]).toEqual(provenance.root);
  });

  it('goToNode: should go to node with correct id', () => {
    const { provenance, changeName } = setupTodoManager();
    provenance.apply(changeName('JEST'));
    provenance.apply(changeName('JEST 2'));
    provenance.apply(changeName('JEST 3'));
    provenance.apply(changeName('JEST 4'));

    const { current } = provenance;

    let id: string | null = null;
    if (isChildNode(current)) id = current.parent;
    if (!id) throw new Error('Error');

    provenance.goToNode(id);

    expect(id).toEqual(provenance.current.id);
  });

  type ChildNode<T, S, A> = StateNode<T, S, A> | DiffNode<T, S, A>;

  describe('addArtifact: should add artifact to specified node', () => {
    function setup() {
      const { provenance, changeName } = setupTodoManager();
      provenance.apply(changeName('JEST'));
      if (!isChildNode(provenance.current)) throw new Error('Error applying action');

      const preArtifact = (provenance.current as ChildNode<
        TodoManager,
        TodoEvents,
        TodoArtifacts
      >).artifacts;

      expect(preArtifact.customArtifacts).toHaveLength(0);
      const artifact: TodoArtifacts = {
        notes: 'This is test note',
      };
      provenance.addArtifact(artifact);

      const postArtifact = (provenance.current as ChildNode<
        TodoManager,
        TodoEvents,
        TodoArtifacts
      >).artifacts;
      return {
        provenance,
        preArtifact,
        postArtifact,
        artifact,
      };
    }

    it('artifacts should be empty', () => {
      const { preArtifact } = setup();

      expect(preArtifact.customArtifacts).toHaveLength(0);
    });

    it('should have one artifact', () => {
      const { postArtifact } = setup();

      expect(postArtifact.customArtifacts).toHaveLength(1);
    });
    it('artifact should match what was added', () => {
      const { postArtifact, artifact } = setup();
      expect(postArtifact.customArtifacts[0].artifact).toEqual(artifact);
    });
  });

  describe('addAnnotation: should add annotation to current node', () => {
    function setup() {
      const { provenance, changeName } = setupTodoManager();
      provenance.apply(changeName('JEST'));
      if (!isChildNode(provenance.current)) throw new Error('Error applying action');

      const preAnnotation = (provenance.current as ChildNode<any, any, any>).artifacts
        .annotations[0]?.annotation || undefined;

      const annotation = 'This is test annotation';

      provenance.addAnnotation(annotation);

      const postAnnotation = (provenance.current as ChildNode<any, any, any>)
        .artifacts.annotations[0].annotation;

      expect(postAnnotation).toBe(annotation);

      return { preAnnotation, postAnnotation, annotation };
    }

    it('annotation should be undefined', () => {
      const { preAnnotation } = setup();

      expect(preAnnotation).toBeUndefined();
    });

    it('annotation from node should match added annotation', () => {
      const { postAnnotation, annotation } = setup();
      expect(postAnnotation).toBe(annotation);
    });
  });

  describe('goBackOneStep: should go back to parent node', () => {
    function setup() {
      const { provenance, action } = setupProvenanceAndAction(initialState);
      provenance.apply(action.setLabel('Test Action'));

      const parentId = (provenance.current as any).parent;
      provenance.goBackOneStep();

      return { provenance, parentId };
    }
    it('current id should match parent id of child node', () => {
      const { provenance, parentId } = setup();
      expect(provenance.current.id).toEqual(parentId);
    });
    it('going back on root should throw error', () => {
      const { provenance } = setup();
      expect(() => provenance.goBackOneStep()).toThrow();
    });
  });

  describe('goForwardOneStep: should go forward to node as specified', () => {
    function setup() {
      const { provenance, action } = setupProvenanceAndAction(initialState);

      // Apply once
      provenance.apply(action.setLabel('Test Action')());
      const baseNode = provenance.current.id;

      // Apply second time
      provenance.apply(action.setLabel('Test Action')());
      const firstChild = provenance.current.id;

      // Go back once
      provenance.goBackOneStep();

      // Apply third time
      provenance.apply(action.setLabel('Test Action')());
      const secondChild = provenance.current.id;

      provenance.goBackOneStep();
      return {
        provenance,
        baseNode,
        firstChild,
        secondChild,
      };
    }

    it('should be at base node', () => {
      const { provenance, baseNode } = setup();
      expect(provenance.current.id).toBe(baseNode);
    });
    it('should have two children', () => {
      const { provenance } = setup();
      expect(provenance.current.children).toHaveLength(2);
    });
    it('should go to first node', () => {
      const { provenance, firstChild } = setup();
      provenance.goForwardOneStep('oldest');
      expect(provenance.current.id).toBe(firstChild);
    });

    it('should go to second node', () => {
      const { provenance, secondChild } = setup();
      provenance.goForwardOneStep('latest');
      expect(provenance.current.id).toBe(secondChild);
    });
  });

  describe('goBackToNonEphemeral: should go back to last non-ephemeral node', () => {
    function setup() {
      const { provenance, action, ephemeralAction } = setupProvenanceAndAction(
        initialState,
      );
      action.setLabel('Increase counter');
      provenance.apply(action());
      const baseNode = provenance.current;

      const ephemeralNodeList: string[] = [];

      provenance.apply(ephemeralAction());
      ephemeralNodeList.push(provenance.current.id);
      provenance.apply(ephemeralAction());
      ephemeralNodeList.push(provenance.current.id);
      provenance.apply(ephemeralAction());
      ephemeralNodeList.push(provenance.current.id);
      provenance.apply(ephemeralAction());
      ephemeralNodeList.push(provenance.current.id);
      provenance.apply(ephemeralAction());
      ephemeralNodeList.push(provenance.current.id);

      provenance.apply(action());
      const regularNode = provenance.current.id;

      return {
        provenance,
        baseNode,
        ephemeralNodeList,
        regularNode,
      };
    }

    it('baseNode should be regular', () => {
      const { baseNode } = setup();
      expect(baseNode.actionType).toBe('Regular');
    });

    it('ephemeral nodes added', () => {
      const {
        provenance: { graph },
        ephemeralNodeList,
      } = setup();

      const typeList = ephemeralNodeList
        .map((node) => graph.nodes[node])
        .map((node) => node.actionType)
        .map((type) => (type === 'Ephemeral' ? 0 : 1));

      let count = 0;
      typeList.forEach((d) => {
        count += d;
      });

      expect(count).toBe(0);
    });

    it('current should be at regularNode', () => {
      const { provenance, regularNode } = setup();
      expect(provenance.current.id).toBe(regularNode);
    });

    it('should go back to baseNode id', () => {
      const { provenance, baseNode } = setup();
      provenance.goBackToNonEphemeral();
      expect(provenance.current.id).toBe(baseNode.id);
    });
  });

  describe('goForwardToNonEphemeral: should go forward to next non-ephemeral node if available', () => {
    function setup() {
      const { provenance, action, ephemeralAction } = setupProvenanceAndAction(
        initialState,
      );
      action.setLabel('Increase counter');
      provenance.apply(action());
      const baseNode = provenance.current;

      const ephemeralNodeList: string[] = [];

      provenance.apply(ephemeralAction());
      ephemeralNodeList.push(provenance.current.id);
      provenance.apply(ephemeralAction());
      ephemeralNodeList.push(provenance.current.id);
      provenance.apply(ephemeralAction());
      ephemeralNodeList.push(provenance.current.id);
      provenance.apply(ephemeralAction());
      ephemeralNodeList.push(provenance.current.id);
      provenance.apply(ephemeralAction());
      ephemeralNodeList.push(provenance.current.id);

      provenance.apply(action());
      const regularNode = provenance.current.id;

      provenance.goToNode(baseNode.id);

      return {
        provenance,
        baseNode,
        ephemeralNodeList,
        regularNode,
      };
    }

    it('baseNode should be regular', () => {
      const { baseNode } = setup();
      expect(baseNode.actionType).toBe('Regular');
    });

    it('ephemeral nodes added', () => {
      const {
        provenance: { graph },
        ephemeralNodeList,
      } = setup();

      const typeList = ephemeralNodeList
        .map((node) => graph.nodes[node])
        .map((node) => node.actionType)
        .map((type) => (type === 'Ephemeral' ? 0 : 1));

      let count = 0;
      typeList.forEach((d) => {
        count += d;
      });

      expect(count).toBe(0);
    });

    it('current should be at baseNode', () => {
      const { provenance, baseNode } = setup();
      expect(provenance.current.id).toBe(baseNode.id);
    });

    it('should go forward to regularNode', () => {
      const { provenance, regularNode } = setup();
      provenance.goForwardToNonEphemeral('latest');
      expect(provenance.current.id).toBe(regularNode);
    });

    it('should go forward to furthest ephemeral if nothing available', () => {
      const { provenance, action, ephemeralAction } = setupProvenanceAndAction(
        initialState,
      );
      action.setLabel('Increase counter');
      provenance.apply(action());
      const baseNode = provenance.current;

      const ephemeralNodeList: string[] = [];

      provenance.apply(ephemeralAction());
      ephemeralNodeList.push(provenance.current.id);
      provenance.apply(ephemeralAction());
      ephemeralNodeList.push(provenance.current.id);
      provenance.apply(ephemeralAction());
      ephemeralNodeList.push(provenance.current.id);
      provenance.apply(ephemeralAction());
      ephemeralNodeList.push(provenance.current.id);
      provenance.apply(ephemeralAction());
      ephemeralNodeList.push(provenance.current.id);

      provenance.goToNode(baseNode.id);

      provenance.goForwardToNonEphemeral();

      expect(provenance.current.id).toBe(
        ephemeralNodeList[ephemeralNodeList.length - 1],
      );
    });

    it('should throw error when at latest node in branch', () => {
      const { provenance, action, ephemeralAction } = setupProvenanceAndAction(
        initialState,
      );
      action.setLabel('Increase counter');
      provenance.apply(action());

      provenance.apply(ephemeralAction());
      expect(() => provenance.goForwardToNonEphemeral()).toThrow();
    });
  });

  describe('getBookmark & setBookmark: should get & set bookmark', () => {
    function setup() {
      const { provenance, action } = setupProvenanceAndAction(initialState);

      action.setLabel('Test');

      provenance.apply(action());

      provenance.setBookmark(provenance.current.id, true);

      return { provenance };
    }

    it('should set bookmark to true', () => {
      const { provenance } = setup();
      expect(provenance.getBookmark(provenance.current.id)).toBeTruthy();
    });

    it('should set bookmark to false', () => {
      const { provenance } = setup();
      provenance.setBookmark(provenance.current.id, false);
      expect(provenance.getBookmark(provenance.current.id)).toBeFalsy();
    });
  });

  describe('reset: should go to root', () => {
    function setup() {
      const { provenance, action } = setupProvenanceAndAction(initialState);
      const rootNode = provenance.root;
      action.setLabel('Test');
      provenance.apply(action());
      const nonRootNode = provenance.current;

      return { provenance, rootNode, nonRootNode };
    }

    it('should not be at root node', () => {
      const { provenance, rootNode } = setup();
      expect(provenance.current.id).not.toEqual(rootNode.id);
    });

    it('should be at root node', () => {
      const { provenance, rootNode } = setup();
      provenance.reset();
      expect(provenance.current.id).toEqual(rootNode.id);
    });
  });

  describe('exportState: should return complete and partial state', () => {
    function setup() {
      const { provenance, action } = setupProvenanceAndAction(initialState);

      provenance.apply(action.setLabel('Test')());
      const completeExportedString = provenance.exportState();
      const partialExportedString = provenance.exportState(true);

      return { provenance, completeExportedString, partialExportedString };
    }

    it('should return initial state as string', () => {
      const { completeExportedString } = setup();

      const compressedString = compressToEncodedURIComponent(
        serializeJavascript({ ...initialState, counter: 1 }),
      );

      expect(completeExportedString).toEqual(compressedString);
    });

    it('should return partial state as string', () => {
      const { partialExportedString } = setup();

      const compressedString = compressToEncodedURIComponent(
        serializeJavascript({ counter: 1 }),
      );

      expect(partialExportedString).toEqual(compressedString);
    });
  });

  describe('importState: should return imported state as required', () => {
    let counterChangeString: string;
    let messageChangeString: string;
    let allChangeString: string;
    let counterChangeState: Partial<State>;
    beforeEach(() => {
      const {
        provenance,
        action,
        changeMessageAction,
      } = setupProvenanceAndAction(initialState);

      provenance.apply(action.setLabel('Test')());
      counterChangeState = { counter: 1 };
      counterChangeString = provenance.exportState(true);
      provenance.goBackOneStep();
      provenance.apply(changeMessageAction('Test'));
      messageChangeString = provenance.exportState(false);
      provenance.apply(action());
      allChangeString = provenance.exportState();
    });

    function setup() {
      const { provenance } = setupProvenanceAndAction(initialState);
      return { provenance };
    }

    it('should have a new node with "Import" label.', () => {
      const { provenance } = setup();
      provenance.importState(counterChangeString);

      expect(provenance.current.label).toEqual('Import');
    });

    it('should match state after importing messageChangeString', () => {
      const { provenance } = setup();

      provenance.importState(messageChangeString);

      expect(provenance.state).toEqual({ ...initialState, message: 'Test' });
    });

    it('should match state after importing allChangeString', () => {
      const { provenance } = setup();

      provenance.importState(allChangeString);

      expect(provenance.state).toEqual({
        counter: 1,
        message: 'Test',
        testArr: ['First Element'],
      });
    });

    it('should match state after importing counterChangeState', () => {
      const { provenance } = setup();

      provenance.importState(counterChangeState);

      expect(provenance.state).toEqual({ ...initialState, counter: 1 });
    });
  });

  describe('exportGraph: should return stringified provenance graph', () => {
    it('should return provenance graph as string', () => {
      const { provenance, action } = setupProvenanceAndAction(initialState);
      action.setLabel('Test');
      provenance.apply(action());

      expect(provenance.exportProvenanceGraph()).toEqual(
        serializeJavascript(provenance.graph),
      );
    });
  });

  describe('importGraph: should import proper provenance graph', () => {
    function setup() {
      const { provenance, action } = setupProvenanceAndAction(initialState);

      provenance.apply(action.setLabel('Test')());

      const provString = provenance.exportProvenanceGraph();

      return { provString, provenance };
    }

    it('should not match the provenance graph', () => {
      const { provenance: provenanceOld } = setup();
      const { provenance } = setupProvenanceAndAction(initialState);

      expect(provenance.graph).not.toEqual(provenanceOld.graph);
    });

    it('should match the provenance graph and current state', () => {
      const { provString, provenance: provenanceOld } = setup();
      const { provenance } = setupProvenanceAndAction(initialState);
      provenance.importProvenanceGraph(provString);

      expect(provenance.graph).toEqual(provenanceOld.graph);
    });

    it('should match the provenance graph and current state when loading using graph', () => {
      const { provenance: provenanceOld } = setup();
      const { provenance } = setupProvenanceAndAction(initialState);
      provenance.importProvenanceGraph(provenanceOld.graph);

      expect(provenance.graph).toEqual(provenanceOld.graph);
    });
  });

  describe('done: should load state from url when available', () => {
    beforeAll(() => {
      Object.defineProperty(global.window, 'location', { value: {} });
    });

    function setup() {
      const { provenance, changeMessageAction } = setupProvenanceAndAction(
        initialState,
      );

      provenance.apply(changeMessageAction('Test'));

      const exportString = provenance.exportState();

      const currentState = provenance.state;
      return { provenance, exportString, currentState };
    }

    it('should load from url and get current state', () => {
      const { exportString, currentState } = setup();

      Object.defineProperty(window.location, 'href', {
        writable: true,
        value: `http://example.com?provState=${exportString}`,
      });

      const { provenance } = setupProvenanceAndAction(initialState, true);

      expect(provenance.state).toEqual(currentState);
    });
  });

  describe('apply: should throw error when done is not called', () => {
    it('should fail', () => {
      const { provenance, action } = setupProvenanceAndAction(
        initialState,
        false,
        true,
      );

      expect(() => provenance.apply(action.setLabel('Test')())).toThrow();
    });
  });

  describe('loadFromUrl should update proper url when set', () => {
    function getLocationString() {
      const url = new URL(window.location.href);
      const params = new URLSearchParams(url.searchParams);
      return params.get('provState');
    }
    it('should update url correctly', () => {
      const { provenance, action } = setupProvenanceAndAction(
        initialState,
        true,
      );

      action.setLabel('Test');
      provenance.apply(action());

      setTimeout(() => {
        expect(
          compressToEncodedURIComponent(
            serializeJavascript(provenance.getState(provenance.current)),
          ),
        ).toBe(getLocationString());
      }, 100);
    });
  });

  //
});
