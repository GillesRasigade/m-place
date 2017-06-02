import { expect } from 'chai';

import Actor from '../../../../src/lib/models/Actor';
import Contract from '../../../../src/lib/models/contract';
import Term from '../../../../src/lib/models/contract/Term';
import Transaction from '../../../../src/lib/models/transaction';

import Price from '../../../../src/lib/models/price';
import Amount from '../../../../src/lib/models/price/Amount';

describe('Price', () => {
  let contract;
  let john;
  let william;

  beforeEach(() => {
    contract = new Contract();
    john = new Actor({ name: 'John' });
    william = new Actor({ name: 'William' });
    contract.changeOwnership(john);
    contract.addParty(john);
  });

  describe('#constructor', () => {
    it('creates price', () => {
      contract.addTerm({ name: 'No pricing term' });
      const transaction = new Transaction({ contract });

      const price = new Price(transaction);

      expect(price).to.be.instanceof(Price);
    });
  });

  describe('#compute', () => {
    it('returns an empty array if no pricing terms are defined', () => {
      contract.addTerm({ name: 'No pricing term' });
      const transaction = new Transaction({ contract });
      transaction.order([william]);

      const price = new Price(transaction);
      price.compute();

      expect(price).to.be.instanceOf(Price);
      expect(price.totals).to.deep.equal({});
      expect(price.rows).to.deep.equal([]);
    });

    it('returns updated prices against terms definitions', () => {
      const term = new Term({
        price: function () {
          const party = this.transaction.contract.data.parties.shift();
          const orderer = this.transaction.data.orderers.shift();
          const amount = 10;

          return this.row([
              this.cell(orderer, -amount),
              this.cell(party, amount)
            ], ['customer']);
        }
      });
      contract.addTerm(term);

      const transaction = new Transaction({ contract });
      transaction.order([william]);

      const price = new Price(transaction);
      price.compute();

      expect(price).to.be.instanceOf(Price);

      // Totals check:
      expect(Object.keys(price.totals).sort()).to.deep.equal([
        john.name,
        william.name
      ]);
      expect(price.totals[john.name].toString()).to.equal('10');
      expect(price.totals[william.name].toString()).to.equal('-10');

      // Rows check:
      expect(price.rows).to.have.property('length', 1);
      const row = price.rows[0];
      expect(row.tags).to.deep.equal(['customer']);
      expect(row.term).to.equal(term);

      // Cells check:
      expect(row.cells).to.have.property('length', 2);
      expect(row.cells[0].actor).to.be.equal(william);
      expect(row.cells[1].actor).to.be.equal(john);

      expect(row.cells[0].amount.toString()).to.be.equal('-10');
      expect(row.cells[1].amount.toString()).to.be.equal('10');
    });

    it('returns as many rows as pricing terms are defined', () => {
      const term = new Term({
        price: function () {
          return this.row([this.cell(william, -10), this.cell(john, 10)]);
        }
      });
      contract.addTerm(term).addTerm(term);

      const transaction = new Transaction({ contract });
      transaction.order([william]);

      const price = new Price(transaction);
      price.compute();

      // Rows check:
      expect(price.rows).to.have.property('length', 2);
    });

    it('supports to produce several pricing rows per term', () => {
      const term = new Term({
        price: function () {
          return [
            this.row([this.cell(william, -10), this.cell(john, 10)]),
            this.row([this.cell(william, -2), this.cell(john, 2)])
          ];
        }
      });
      contract.addTerm(term);

      const transaction = new Transaction({ contract });
      transaction.order([william]);

      const price = new Price(transaction);
      price.compute();

      // Rows check:
      expect(price.rows).to.have.property('length', 2);
    });

    it('raises an exception if a row amounts summation is not zero', () => {
      const term = new Term({
        price: function () {
          return this.row([
            this.cell(william, -10),
            this.cell(john, 11) // This is the error
          ]);
        }
      });
      contract.addTerm(term).addTerm(term);

      const transaction = new Transaction({ contract });
      transaction.order([william]);

      const price = new Price(transaction);
      expect(price.compute.bind(price))
        .to.throw(Error, 'Invalid price row definition. Row sum must be zero !');
    });
  });

  describe('#getTotalsOnTag', () => {
    it('returns allow totals matching the given tag', () => {
      const specialTax = new Amount(1);
      const term = new Term({
        name: 'Term #1',
        price: function () {
          return [
            this.row([this.cell(william, -10), this.cell(john, 10)], ['net']),
            this.row([this.cell(william, -2), this.cell(john, 2)], ['vat']),
            this.row([this.cell(william, -specialTax), this.cell(john, specialTax)], ['vat'])
          ];
        }
      });
      contract.addTerm(term);

      const transaction = new Transaction({ contract });
      transaction.order([william]);

      const price = new Price(transaction);
      price.compute();

      const totals = price.getTotalsOnTag('vat');

      expect(Object.keys(totals).sort()).to.deep.equal([
        john.name,
        william.name
      ]);
      expect(totals[john.name].toString()).to.equal('3');
      expect(totals[william.name].toString()).to.equal('-3');
    });
  });

  describe('#toString', () => {
    it('supports to produce several pricing rows per term', () => {
      const term = new Term({
        name: 'Term #1',
        price: function () {
          return [
            this.row([this.cell(william, -10), this.cell(john, 10)]),
            this.row([this.cell(william, -2), this.cell(john, 2)])
          ];
        }
      });
      contract.addTerm(term);

      const transaction = new Transaction({ contract });
      transaction.order([william]);

      const price = new Price(transaction);
      price.compute();

      const str = price.toString();

      /**
       * William	John
       * ------------------
       * -10.00	  10.00			Term #1
       * ------------------
       * -2.00	  2.00			Term #1
       */
      expect(str).to.equals('William\tJohn\n------------------\n-10.00\t10.00\t\t\tTerm #1\n------------------\n-2.00\t2.00\t\t\tTerm #1');
    });
  });

  describe('getters', () => null);
});