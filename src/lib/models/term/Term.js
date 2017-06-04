export default class Term {
  constructor(definition) {
    // ... definition checker
    Object.assign(this, definition);
  }

  toString() {
    return `
# ${this.name || 'Term'}

${this.description || ''}
`;
  }
}
