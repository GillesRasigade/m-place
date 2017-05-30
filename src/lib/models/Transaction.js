import assert from 'assert';
import EventEmitter from 'events';

import Stateable from '../pattern/Stateable';
import Undoable from '../pattern/Undoable';

/**
 * State actions and states
 */
const ACTIONS = {
  setAmount(amount) {
    return this.setState('created', { amount });
  },
  accept() {
    return this.setState('accepted');
  },
  offer() {
    try {
      return this.checkForOffer().setState('offered');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  },
  validate() {
    return this.setState('validated');
  },
  cancel() {
    return this.setState('canceled');
  }
};

const STATES = {
  created: {
    setAmount: ACTIONS.setAmount,
    validate: ACTIONS.validate
  },
  validated: {
    cancel: ACTIONS.cancel,
    offer: ACTIONS.offer
  },
  offered: {
    accept: ACTIONS.accept,
    cancel: ACTIONS.cancel
  },
  accepted: {
    cancel: ACTIONS.cancel
  },
  canceled: {
  }
};

const STATE_DUAL = Object.keys(ACTIONS).reduce((map, action) => {
    map[action] = 'cancelLastAction';
    return map;
  }, {});

/**
 * Undoable actions
 */
const DUAL = Object.assign({
  set: 'unset',
  unset: 'set'
}, STATE_DUAL);

/**
 * Initial state and data
 */
const INITIAL_STATE = 'created';
const INITIAL_DATA = {
  amount: null
};

export default class Transaction
  extends Undoable(Stateable(EventEmitter, STATES, INITIAL_STATE, INITIAL_DATA), DUAL) {
  constructor(data) {
    super();

    this.setData(data);
  }

  checkForOffer() {
    const data = this.data;
    assert(data.amount > 0, 'Transaction amount must be greater than 0');

    return this;
  }
}
