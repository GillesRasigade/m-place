export default class Row {
  constructor(cells, tags = []) {
    this.cells = cells;
    this.tags = tags;
  }

  hasTag(tag) {
    return this.tags.indexOf(tag) !== -1;
  }
}
