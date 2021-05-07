import {
  customSerializerTest,
  setupProvenanceAndAction,
  setupTodoManager,
} from './helper';

describe('Testing serializing behaviour', () => {
  describe('for default serializing', () => {
    it('should use default serializer', () => {
      const { provenance } = setupTodoManager();

      expect(provenance.usingDefaultSerializer).toEqual(true);
    });

    describe('with pure JSON state', () => {
      const { provenance, action } = setupProvenanceAndAction();
      action.setLabel('Default Label');
      provenance.apply(action());
      provenance.apply(action());
      provenance.apply(action());

      it('should match state', () => {
        expect(provenance.state).toEqual({
          counter: 3,
          message: 'Init',
          testArr: ['First Element'],
        });
      });
    });

    describe('with Javascript Sets', () => {
      it('should have one entry in set as "log"', () => {
        const { provenance } = setupTodoManager();

        expect(Array.from(provenance.state.logs)).toContain('log');
      });

      it('should have the new entry in Set', () => {
        const { provenance, addLogAction } = setupTodoManager();
        provenance.apply(addLogAction('Test'));

        expect(Array.from(provenance.state.logs)).toContain('log');
        expect(Array.from(provenance.state.logs)).toContain('Test');
      });

      it('should be able to go back and forward', () => {
        const { provenance, addLogAction } = setupTodoManager();

        provenance.apply(addLogAction('Hello'));
        provenance.apply(addLogAction('World'));

        expect(provenance.state.logs.size).toEqual(3);

        provenance.undo();
        provenance.undo();

        expect(provenance.state.logs.size).toEqual(1);
        expect(provenance.state.logs).toContain('log');
        expect(provenance.state.logs).not.toContain('Hello');
        expect(provenance.state.logs).not.toContain('World');

        provenance.redo();
        expect(provenance.state.logs.size).toEqual(2);
        expect(provenance.state.logs).toContain('log');
        expect(provenance.state.logs).toContain('Hello');
        expect(provenance.state.logs).not.toContain('World');

        provenance.redo();
        expect(provenance.state.logs.size).toEqual(3);
        expect(provenance.state.logs).toContain('log');
        expect(provenance.state.logs).toContain('Hello');
        expect(provenance.state.logs).toContain('World');
      });
    });

    describe('with Javascript Maps', () => {
      it('should have empty map', () => {
        const { provenance } = setupTodoManager();
        expect(provenance.state.map.size).toBe(0);
      });

      it('should have one new key value in map', () => {
        const { provenance, addMapAction } = setupTodoManager();

        provenance.apply(addMapAction('Hello', 'World'));

        expect(provenance.state.map.size).toBe(1);
        expect(provenance.state.map.has('Hello')).toEqual(true);
        expect(provenance.state.map.get('Hello')).toEqual('World');
      });

      it('should be able to go back and forward', () => {
        const { provenance, addMapAction } = setupTodoManager();

        provenance.apply(addMapAction('Hello', 'World'));
        provenance.apply(addMapAction('Foo', 'Bar'));

        expect(provenance.state.map.size).toBe(2);

        provenance.undo();
        provenance.undo();

        expect(provenance.state.map.size).toBe(0);

        provenance.redo();
        expect(provenance.state.map).toEqual(new Map([['Hello', 'World']]));

        provenance.redo();
        expect(provenance.state.map).toEqual(
          new Map([
            ['Hello', 'World'],
            ['Foo', 'Bar'],
          ])
        );
      });
    });
  });

  describe('for custom serializers', () => {
    it('should use custom serializer', () => {
      const { provenance } = customSerializerTest();

      expect(provenance.usingDefaultSerializer).not.toEqual(true);
    });

    it('should have empty list', () => {
      const { provenance } = customSerializerTest();

      expect(provenance.state.size()).toEqual(0);
    });

    it('should have one item in list', () => {
      const { provenance, action } = customSerializerTest();

      provenance.apply(action('Hello'));

      expect(provenance.state.size()).toEqual(1);
      expect(provenance.state.elements()).toContain('Hello');
    });

    it('should be able to go to and fro', () => {
      const { provenance, action } = customSerializerTest();

      provenance.apply(action('Hello'));
      provenance.apply(action('World'));

      expect(provenance.state.size()).toEqual(2);

      provenance.undo();
      provenance.undo();

      expect(provenance.state.size()).toEqual(0);

      provenance.redo();
      expect(provenance.state.elements()).toEqual(['Hello']);

      provenance.redo();
      expect(provenance.state.elements()).toEqual(['Hello', 'World']);
    });
  });
});
