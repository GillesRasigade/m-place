import T from './Termination';
import State from './State';

export default (A = T, STATES, defaultState = Object.keys(STATES).shift(), defaultData = {}) => class extends A {
  /**
   *
   * @param {object} data
   */
  constructor(data = {}) {
    super();

    this.setState(data.state || defaultState, Object.assign({ }, defaultData, data));
  }

  /**
   * Cancel the last action
   *
   * @returns {State}
   */
  cancelLastAction() {
    return this.setState(this.state.previousState);
  }

  /**
   * Cancel all the actions applied until the object creation
   *
   * @returns {State}
   */
  cancelAllActions() {
    while (this.state.previousState) {
      this.cancelLastAction();
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

  updateData(data) {
    return this.setData(Object.assign({}, this.data, data));
  }

  setData(data) {
    return this.setState(this.state.id, data);
  }

  toJSON() {
    return JSON.parse(JSON.stringify(this.data));
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