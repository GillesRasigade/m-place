import T from './Termination';
import State from './State';

export default (A = T, STATES, defaultState, defaultData) => class extends A {
  constructor({ state, data } = { state: defaultState, data: defaultData }) {
    super();

    this.setState(state, data);
  }

  /**
   * Cancel the last action
   *
   * @returns {State}
   */
  cancelLastAction() {
    return this.state ? this.setState(this.state.previousState) : this;
  }

  /**
   * Cancel all the actions applied until the object creation
   *
   * @returns {State}
   */
  cancelAllActions() {
    if (this.state) {
      while (this.state.previousState) {
        this.cancelLastAction();
      }
    }
  }

  get state() {
    return this._state;
  }

  get data() {
    return this.state.data;
  }

  unbind() {
    if (!this.state) {return;}

    for (const action in STATES[this.state.id]) {
      delete this[action];
    }
  }

  setData(data) {
    return this.setState(this.state.id, data);
  }

  setState(state, data) {
    this.unbind();

    if (state instanceof State) {
      this._state = state;
    } else {
      this._state = new State(this, state, STATES, data);
    }

    this._state.bind();

    return this;
  }
};