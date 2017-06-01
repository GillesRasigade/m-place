
export default class State {
  constructor(subject, state, states, data) {
    this.subject = subject;
    this.id = state;
    this.states = states;
    this.previousState = this.subject.state;

    const d = (data || (this.previousState && this.previousState.data) || {});
    this.data = Object.assign({},
      d, { state, updated: d.updated ? new Date(d.updated) : new Date() }
    );
  }

  bind() {
    // Bind all the actions to the subject
    for (const action in this.states[this.id]) {
      this.subject[action] = this.states[this.id][action].bind(this.subject);
    }

    return this;
  }
}
