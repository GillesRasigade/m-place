import assert from 'assert';
import EventEmitter from 'events';

import Stateable from '../../pattern/Stateable';
import Undoable from '../../pattern/Undoable';

import Contract from '../contract';
import Price from '../price';

/**
 * State actions and states
 */
export const ACTIONS = Object.freeze({
  order(orderers) {
    return this.setState('ordered', Object.assign({}, this.data, {
      ordered: new Date(),
      orderers
    })).validateAndRollback();
  },
  complete() {
    return this.updateData({
      completed: new Date()
    }).checkForComplete().setState('completed');
  },
  cancel() {
    return this.setState('canceled');
  }
});

export const STATES = Object.freeze({
  created: {
    order: ACTIONS.order,
    cancel: ACTIONS.cancel
  },
  ordered: {
    complete: ACTIONS.complete,
    cancel: ACTIONS.cancel
  },
  completed: {},
  canceled: {}
});

const STATE_DUAL = Object.keys(ACTIONS).reduce((map, action) => {
    map[action] = 'cancelLastAction';
    return map;
  }, {});

/**
 * Undoable actions
 */
export const DUAL = Object.freeze(Object.assign({
  // ...
}, STATE_DUAL));

/**
 * Initial state and data
 */
export const INITIAL_STATE = 'created';
export const INITIAL_DATA = Object.freeze({
  contract: null,
  orderers: []
});

export default class Transaction
  extends Undoable(Stateable(EventEmitter, STATES, INITIAL_STATE, INITIAL_DATA), DUAL) {
  constructor(data) {
    super();

    this.init(data);
  }

  init(data) {
    if (data) {
      const d = Object.assign({}, INITIAL_DATA, data);

      d.contract = data.contract instanceof Contract ? data.contract : new Contract(data.contract);
      // Following line is the correct one:
      // d.contract = new Contract(data.contract instanceof Contract ? data.contract.toJSON() : data.contract);

      this.updateData(d);
    }
  }

  validate() {
    return this.data.contract.validateTransaction(this);
  }

  validateAndRollback() {
    const errors = this.validate();
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

  checkForComplete() {
    const data = this.data;
    assert(data.completed instanceof Date, 'Transaction must have a valid completed date');

    return this;
  }

  /**
   * GETTERS
   */
  get contract() {
    return this.data.contract;
  }
}
