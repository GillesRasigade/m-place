import EventEmitter from 'events';

import T from './Termination';
import Stateable from './Stateable';
import Undoable from './Undoable';

export default (A = T, STATES, INITIAL_STATE, INITIAL_DATA, DUAL) =>
  class extends Undoable(Stateable(EventEmitter, STATES, INITIAL_STATE, INITIAL_DATA), DUAL) {
  constructor({ state, data } = { state: INITIAL_STATE, data: INITIAL_DATA }) {
    super();

    this.setState(state, data);
  }
};
