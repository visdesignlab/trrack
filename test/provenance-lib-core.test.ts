import helloWorld from '../src/provenance-lib-core';

/**
 * Dummy test
 */
describe('Dummy test', () => {
  it('works if true is truthy', () => {
    expect(true).toBeTruthy();
  });

  it('is helloWorld a function', () => {
    expect(helloWorld).toBeInstanceOf(Function);
  });
});
