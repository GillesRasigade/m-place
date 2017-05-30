import EventEmitter from 'events';
import { expect } from 'chai';

import Command from '../../../src/lib/pattern/Command';

describe('Command', () => {
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

  describe('undoable', () => {
    it('creates new command successfully', () => {
      const a = new A();
      const command = new Command(a, 'setAmount', [10], 'setAmount', [a.amount]);

      expect(command).to.be.an.instanceOf(Command);

      expect(command).to.have.property('_execute', 'setAmount');
      expect(command).to.have.property('_executeArguments');
      expect(command._executeArguments).to.deep.equal([10]);

      expect(command).to.have.property('_undo', 'setAmount');
      expect(command).to.have.property('_undoArguments');
      expect(command._undoArguments).to.deep.equal([0]);

      expect(command).to.have.property('_undoable', true);
    });

    it('executes the command successfully', () => {
      const a = new A();
      const command = new Command(a, 'setAmount', [10], 'setAmount', [a.amount]);

      command.execute();
      expect(a.amount).to.equal(10);
    });

    it('undo the command successfully', () => {
      const a = new A();
      const command = new Command(a, 'setAmount', [10], 'setAmount', [a.amount]);

      command.execute();
      expect(a.amount).to.equal(10);
      command.undo();
      expect(a.amount).to.equal(0);
    });

    it('supports no parameters for execute', () => {
      const a = new A();
      const command = new Command(a, 'setAmount');

      command.execute();
      expect(a.amount).to.equal(2);
    });

    it('supports constructor as context', () => {
      const command = new Command(A, 'echo');

      command.execute();
      expect(A.prototype.echoCalled).to.equal(true);
    });
  });

  describe('not undoable', () => {
    it('creates new command successfully', () => {
      const a = new A();
      const command = new Command(a, 'setAmount', [10]);

      expect(command).to.have.property('_undoable', false);
    });

    it('executes the command successfully', () => {
      const a = new A();
      const command = new Command(a, 'setAmount', [10]);

      command.execute();
      expect(a.amount).to.equal(10);
    });

    it('raises an exception if trying to undo the command', () => {
      const a = new A();
      const command = new Command(a, 'setAmount', [10]);

      command.execute();
      expect(a.amount).to.equal(10);

      expect(command.undo.bind(command)).to.throw(Error, 'Command is not undoable');
    });
  });

  describe('event emitter context', () => {
    class B extends EventEmitter {
      constructor(amount = 0) {
        super();

        this.amount = amount;
      }
      setAmount(amount) {
        this.amount = amount;
      }
    }
    it('emit `execute` event if supported', done => {
      const b = new B();
      const command = new Command(b, 'setAmount', [10]);

      b.on('execute', (method, args) => {
        expect(method).to.equal('setAmount');
        expect(args).to.deep.equal([10]);
        done();
      });

      command.execute();
    });
  });
});