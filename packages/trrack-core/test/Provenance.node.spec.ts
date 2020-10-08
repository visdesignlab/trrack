/**
 * @jest-environment node
 */
import { initialState, setupProvenanceAndAction } from './helper';

describe('done: should load state from url when available', () => {
  it('should throw error when "window" environment is not detected', () => {
    global.window = null as any;
    expect(() => setupProvenanceAndAction(initialState, true)).toThrow();
  });
});
