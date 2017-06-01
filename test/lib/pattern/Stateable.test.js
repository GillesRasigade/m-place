import { expect } from 'chai';

import State from '../../../src/lib/pattern/State';

import T from '../../../src/lib/pattern/Termination';
import Stateable from '../../../src/lib/pattern/Stateable';

describe('Stateable', () => {
  const STATES = {
    created: {
      setAmount(amount) { return this.updateData({ amount }); },
      cancel() { return this.setState('canceled'); }
    },
    canceled: { /* */ }
  };
  class A extends Stateable(T, STATES) {
    constructor(data) {
      super(data);
    }
  }

  describe('compose class with Stateable methods', () => {
    it('allows to initializes an object with state management', () => {
      const a = new A();

      expect(a).to.be.instanceof(A);

      // data check
      expect(a).to.have.property('data');
      expect(a.data).to.have.property('state', 'created');
      expect(a.data).to.have.property('updated');
      expect(a.data.updated).to.be.instanceof(Date);

      // state check
      expect(a.state).to.be.instanceof(State);
      expect(a.state.id).to.equals('created');
      expect(a.state.previousState).to.equals(undefined); // eslint-disable-line no-undefined
      expect(a.state.subject).to.equals(a);
    });

    it('allows to restore the state of an object', () => {
      const a = new A({ state: 'canceled', updated: '2016-01-01T00:00:00Z' });

      expect(a).to.have.property('data');
      expect(a.data).to.have.property('state', 'canceled');
      expect(a.data).to.have.property('updated');
      expect(a.data.updated.getTime())
        .to.equal((new Date('2016-01-01T00:00:00Z')).getTime());
    });
  });

  describe('manage states correctly', () => {
    it('binds methods correctly', () => {
      const a = new A();
      expect(a).to.haveOwnProperty('cancel');

      a.cancel();
      expect(a.state.id).to.equals('canceled');
      expect(a).to.not.haveOwnProperty('cancel');
    });

    it('allows to cancel last action', () => {
      const a = new A();
      a.cancel();
      expect(a.state.id).to.equals('canceled');

      a.cancelLastAction();
      expect(a.state.id).to.equals('created');
    });

    it('allows to cancel all applied actions', () => {
      const a = new A({ amount: 0 });
      expect(a.data).to.have.property('state', 'created');
      expect(a.data).to.have.property('amount', 0);

      a.cancelAllActions();
      expect(a.data).to.have.property('state', 'created');

      a.setAmount(2);
      expect(a.data).to.have.property('amount', 2);

      a.cancel();
      expect(a.state.id).to.equals('canceled');

      a.cancelAllActions();
      expect(a.state.id).to.equals('created');
      expect(a.data).to.have.property('amount', 0);
    });
  });

  describe('exposes toJSON method', () => {
    it('allows to retrieve the state data in JSON format', () => {
      const a1 = new A();
      a1.setAmount(2);
      expect(a1.data).to.have.property('amount', 2);

      const json = a1.toJSON();
      const a2 = new A(json);

      expect(a1.toJSON()).to.deep.equals(a2.toJSON());
      expect(a2.data).to.have.property('amount', 2);
    });
  });
});