import T from './Termination';
import Commands from './Commands';

export default (A = T, DUAL = {}) => class extends A {
  constructor() {
    super();

    this.commands = new Commands(this);
  }

  do(execute, executeArguments, undoArguments = executeArguments, undo = DUAL[execute]) {
    return this.commands.execute(execute, executeArguments, undo, undoArguments);
  }

  undo() {
    return this.commands.undo();
  }

  redo() {
    return this.commands.redo();
  }
};