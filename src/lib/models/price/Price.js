import Amount from './Amount';
import Cell from './Cell';
import Row from './Row';

export default class Price {
  constructor(transaction, { prices } = { prices: []}) {
    this.transaction = transaction;
    this.prices = prices;
  }

  toString() {
    const table = [];
    const actors = [];
    for (const r of this.prices) {
      for (const cell of r.cells) {
        let index = actors.indexOf(cell.actor.name);
        if (index === -1) {
          index = actors.length;
          actors.push(cell.actor.name);
          table.push([]);
        }
      }
    }

    console.log('\n\n', [...actors].join('\t')); // eslint-disable-line
    for (let i = 0; i < this.prices.length; i++) {
      table[i] = [...actors.map(() => '')];
      for (const cell of this.prices[i].cells) {
        const index = actors.indexOf(cell.actor.name);
        table[i][index] = `${cell.amount.toFixed(2)}`;
      }
      // table[i].unshift(this.prices[i].term.name);
      // console.log(this.prices[i].term.name);

      console.log( // eslint-disable-line
        '------------------\n',
        table[i].join('\t'),
        '\t\t\t', this.prices[i].term.name);
    }
  }

  amount(value) {
    return new Amount(value);
  }

  cell(actor, amount) {
    return new Cell(actor, amount instanceof Amount ? amount : new Amount(amount));
  }

  row(cells, tags) {
    return new Row(cells, tags);
  }

  getTotalsOnTag(tag) {
    const totals = {};
    for (const row of this.prices) {
      if (!row.hasTag(tag)) {
        continue;
      }

      for (const cell of row.cells) {
        if (totals[cell.actor.name] === undefined) { // eslint-disable-line
          totals[cell.actor.name] = this.amount(0);
        }

        totals[cell.actor.name] = totals[cell.actor.name].add(cell.amount);
      }
    }

    return totals;
  }

  consolidate() {
    this.totals = {};
    for (const row of this.prices) {
      let total = this.amount(0);
      for (const cell of row.cells) {
        total = total.add(cell.amount);

        if (this.totals[cell.actor.name] === undefined) { // eslint-disable-line
          this.totals[cell.actor.name] = this.amount(0);
        }

        this.totals[cell.actor.name] = this.totals[cell.actor.name].add(cell.amount);
      }

      if (!total.equals(0)) {
        throw new Error('Invalid price row definition. Row sum must be zero !');
      }
    }
    return this.prices;
  }

  compute() {
    const terms = this.transaction.contract.terms;
    this.prices = [];
    for (const term of terms) {
      if (typeof(term.price) === 'function') {
        let rows = term.price.call(this, this.transaction);
        if (!(rows instanceof Array)) {
          rows = [rows];
        }

        rows = rows.map(row => {
          row.term = term;
          return row;
        });

        this.prices = [...this.prices, ...rows];
        this.prices = this.consolidate();
      }
    }

    return this;
  }
}
