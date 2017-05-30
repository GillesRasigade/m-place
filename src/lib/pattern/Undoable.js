import T from './Termination';
import Commands from './Commands';

export default (A = T, DUAL = {}) => class extends A {
  constructor() {
    super();

    this.commands = new Commands(this);
  }

  do(method, ...args) {
    return this.commands.execute(method, args, DUAL[method], args);
  }

  undo() {
    return this.commands.undo();
  }

  redo() {
    return this.commands.redo();
  }
};