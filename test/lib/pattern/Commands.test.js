import { expect } from 'chai';

import Commands from '../../../src/lib/pattern/Commands';

describe('Commands', () => {
  class A {
    constructor(amount = 0) {
      this.amount = amount;
    }

    setAmount(amount = 2) {
      this.amount = amount;
    }

    static echo() {
      return A.prototype.echoCalled = true;
    }
  }

  describe('#execute', () => {
    it('executes command successfully', () => {
      const a = new A();
      const commands = new Commands(a);

      commands.execute('setAmount', [5], 'setAmount', [a.amount]);
      expect(a.amount).to.equals(5);

      commands.undo();
      expect(a.amount).to.equals(0);

      commands.undo();
      expect(a.amount).to.equals(0);

      commands.redo();
      expect(a.amount).to.equals(5);

      commands.redo();
      expect(a.amount).to.equals(5);

      commands.execute('setAmount', [10], 'setAmount', [a.amount]);
      expect(a.amount).to.equals(10);

      commands.undo();
      expect(a.amount).to.equals(5);
    });
  });

  describe('#execute', () => {
    class B extends Commands {
      constructor(amount = 0) {
        super();

        this.amount = amount;
      }

      setAmount(amount = 2) {
        this.amount = amount;
      }

      static echo() {
        return A.prototype.echoCalled = true;
      }
    }

    it('instanciates Commands classes', () => {
      const b = new B();
      b.execute('setAmount', [5], 'setAmount', [b.amount]);

      expect(b.amount).to.equals(5);

      b.undo();
      expect(b.amount).to.equals(0);

      b.redo();
      expect(b.amount).to.equals(5);
    });
  });
});