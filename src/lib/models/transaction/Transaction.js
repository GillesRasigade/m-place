import assert from 'assert';
import EventEmitter from 'events';

import Stateable from '../../pattern/Stateable';
import Undoable from '../../pattern/Undoable';

import Contract from '../contract';
import Price from '../price';

/**
 * State actions and states
 */
export const ACTIONS = {
  order(orderers) {
    return this.setState('ordered', Object.assign({}, this.data, {
      ordered: new Date(),
      orderers
    })).checkAndRollback();
  },
  complete() {
    return this.updateData({
      completed: new Date()
    });
  },
  validate() {
    return this.checkForValidate().setState('validated');
  },
  cancel() {
    return this.setState('canceled');
  }
};

export const STATES = {
  created: {
    order: ACTIONS.order
  },
  ordered: {
    complete: ACTIONS.complete,
    validate: ACTIONS.validate,
    cancel: ACTIONS.cancel
  },
  validated: {
    cancel: ACTIONS.cancel
  },
  canceled: {}
};

const STATE_DUAL = Object.keys(ACTIONS).reduce((map, action) => {
    map[action] = 'cancelLastAction';
    return map;
  }, {});

/**
 * Undoable actions
 */
export const DUAL = Object.assign({
  // ...
}, STATE_DUAL);

/**
 * Initial state and data
 */
export const INITIAL_STATE = 'created';
export const INITIAL_DATA = {
  contract: null,
  orderers: []
};

export default class Transaction
  extends Undoable(Stateable(EventEmitter, STATES, INITIAL_STATE, INITIAL_DATA), DUAL) {
  constructor(data) {
    super();

    this.init(data);
  }

  init(data) {
    if (data) {
      const d = Object.assign(INITIAL_DATA, data);
      d.contract = data.contract instanceof Contract ? data.contract : new Contract(data.contract);

      this.updateData(d);
    }
  }

  get contract() {
    return this.data.contract;
  }

  get owner() {
    return this.data.owner;
  }

  check() {
    return this.data.contract.validateTransaction(this);
  }

  checkAndRollback() {
    const errors = this.check();
    if (errors.length) {
      this.cancelLastAction();
      const err = new Error('Transaction check failed');
      err.errors = errors;
      throw err;
    }

    return this;
  }

  computePrice() {
    const price = new Price(this);

    return price.compute();
  }

  checkForOrder(orderers) {
    const data = this.data;
    for (const actor of orderers) {
      assert(data.contract.data.parties.indexOf(actor) === -1, 'A party can not order his transaction');
    }

    return this;
  }

  checkForValidate() {
    const data = this.data;
    assert(data.contract instanceof Contract, 'Transaction must have a valid Contract');

    return this;
  }
}
