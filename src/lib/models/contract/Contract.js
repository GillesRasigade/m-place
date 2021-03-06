import EventEmitter from 'events';

import Stateable from '../../pattern/Stateable';
import Undoable from '../../pattern/Undoable';

import Validator from './Validator';
import Term from '../term';
import Actor from '../Actor';

/**
 * State actions and states
 */
const ACTIONS = Object.freeze({
  addTerm(term) {
    return this.updateData({
      terms: [].concat(this.data.terms, [
        term instanceof Term ? term : new Term(term)
      ])
    });
  },

  removeTerm(index) {
    const terms = [...this.data.terms];
    terms.splice(index, 1);
    return this.updateData({ terms });
  },

  changeOwnership(actor) {
    return this.updateData({
      owner: actor instanceof Actor ? actor : new Actor(actor)
    });
  },

  addParty(actor) {
    return this.updateData({
      parties: [].concat(this.data.parties, [
        actor instanceof Actor ? actor : new Actor(actor)
      ])
    });
  },

  unpublish() {
    return this.setState('signed');
  },

  publish() {
    return this.setState('published');
  },

  removeParty(index) {
    const parties = [...this.data.parties];
    parties.splice(index, 1);
    return this.updateData({ parties });
  },

  sign() {
    return this.checkForSigning().setState('signed');
  },

  cancel() {
    return this.setState('canceled');
  },

  edit() {
    return this.setState('edition');
  }
});

const STATES = Object.freeze({
  edition: {
    changeOwnership: ACTIONS.changeOwnership,
    addTerm: ACTIONS.addTerm,
    removeTerm: ACTIONS.removeTerm,
    addParty: ACTIONS.addParty,
    removeParty: ACTIONS.removeParty,
    cancel: ACTIONS.cancel,
    sign: ACTIONS.sign
  },
  signed: {
    publish: ACTIONS.publish,
    cancel: ACTIONS.cancel
  },
  published: {
    unpublish: ACTIONS.unpublish,
    cancel: ACTIONS.cancel
  },
  canceled: {
    edit: ACTIONS.edit
  }
});

const STATE_DUAL = Object.keys(ACTIONS).reduce((map, action) => {
    map[action] = 'cancelLastAction';
    return map;
  }, {});

/**
 * Undoable actions
 */
const DUAL = Object.freeze(Object.assign({
  // ...
}, STATE_DUAL));

/**
 * Initial state and data
 */
const INITIAL_STATE = 'edition';
const INITIAL_DATA = Object.freeze({
  terms: [],
  owner: null,
  parties: []
});

export default class Contract
  extends Undoable(Stateable(EventEmitter, STATES, INITIAL_STATE, INITIAL_DATA), DUAL) {
  constructor(data) {
    super();

    this.init(data);

    this.validator = new Validator(this);
  }

  init(data) {
    if (data) {
      const d = Object.assign({}, INITIAL_DATA, data);
      d.terms = d.terms.map(term => new Term(term));
      d.parties = d.parties.map(party => new Actor(party));

      this.updateData(d);
    }
  }

  validateTransaction(transaction) {
    return this.validator.validate(transaction);
  }

  checkForSigning() {
    const data = this.data;
    if (!(data.owner instanceof Actor)) {
      throw new Error('A owner to this contract must be defined');
    }

    if (data.terms.length === 0) {
      throw new Error('At least one Term must be defined to sign a contract');
    }

    return this;
  }

  toString() {
    return this.data.terms.map(term => term.toString()).join('');
  }

  /**
   * GETTERS
   */
  get terms() {
    return this.data.terms;
  }
}
