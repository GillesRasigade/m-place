import { expect } from 'chai';

import Undoable from '../../../src/lib/pattern/Undoable';

describe('Undoable', () => {
  class A extends Undoable(A, {
    setAmount: 'setAmount',
    set: 'unset',
    unset: 'set'
  }) {
    constructor(amount = 0) {
      super();

      this.amount = amount;
    }

    setAmount(amount = 2) { this.amount = amount; }
    set(key) { this[key] = true; }
    unset(key) { this[key] = false; }
  }

  describe('Compose class with Undoable methods', () => {
    it('allows to execute, undo and redo commands', () => {
      const a = new A();
      a.do('setAmount', [5], [a.amount]);
      expect(a.amount).to.equals(5);

      a.undo();
      expect(a.amount).to.equals(0);

      a.redo();
      expect(a.amount).to.equals(5);
    });

    it('allows to use dual methods succesfully', () => {
      const a = new A();
      a.do('set', ['key']);
      expect(a.key).to.equals(true);
      a.undo();
      expect(a.key).to.equals(false);
    });
  });
});