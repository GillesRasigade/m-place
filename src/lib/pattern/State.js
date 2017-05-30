
export default class State {
  constructor(subject, state, states, data) {
    this.subject = subject;
    this.id = state;
    this.states = states;
    this.previousState = this.subject.state;
    this.data = data || (this.previousState && this.previousState.data) || {};
  }

  bind() {
    // Bind all the actions to the subject
    for (const action in this.states[this.id]) {
      this.subject[action] = this.states[this.id][action].bind(this.subject);
    }

    return this;
  }

  cancel() {
    if (this.subject.state === this) {
      return this.subject.setState(this.previousState);
    }
  }
}
