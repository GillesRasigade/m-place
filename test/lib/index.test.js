import { expect } from 'chai';

import { Actor, Contract, Transaction } from '../../src/lib/models';

describe('Functional', () => {
  const joe = new Actor({ name: 'Joe' });
  const william = new Actor({ name: 'William' });
  const jack = new Actor({ name: 'Jack' });
  const averell = new Actor({ name: 'Averell' });
  const luke = new Actor({ name: 'Luke' });

  it('performs transactions successfully', async () => {
    const contract = new Contract();

    /**
     * Contract definition
     */
    contract
      .do('changeOwnership', [joe])
      .addTerm({ name: 'Term #1' })
      .addTerm({ name: 'Term #2' })
      .addTerm({
        name: 'Only one place is available',
        validate: function (transaction) {
          const orderers = transaction.data.orderers;
          if (orderers.length > 2) {
            throw new Error('Only one orderer is authorized');
          }
        }
      })
      .addTerm({
        name: 'Pay €10 to Joe',
        price: function () {
          const orderers = this.transaction.data.orderers;
          const rows = [];
          let i = 0;
          for (const orderer of orderers) {
            const amount = Math.max(0, this.amount(10).sub(5*i));
            rows.push(this.row([
              this.cell(orderer, -amount),
              this.cell(joe, amount)
            ], ['customer']));
            i++;
          }
          return rows;
        }
      })
      .addTerm({
        name: 'Pay €0.10 per second',
        price: function () {
          const orderers = this.transaction.data.orderers;
          const ordered = this.transaction.data.ordered;
          const completed = this.transaction.data.completed;
          const diff = completed - ordered;
          console.log(53, ordered, completed, diff);
          const rows = [];
          let i = 0;
          for (const orderer of orderers) {
            const amount = this.amount(0.1).times(diff / 1000);
            rows.push(this.row([
              this.cell(orderer, -amount),
              this.cell(joe, amount)
            ], ['customer']));
            i++;
          }
          return rows;
        }
      })
      .addTerm({
        name: 'Joe pay €2 to William',
        price: function () {
          const orderers = this.transaction.data.orderers;
          const rows = [];
          for (const orderer of orderers) {
            rows.push(this.row([
              this.cell(joe, -2),
              this.cell(william, 2)
            ], ['seller']));
          }
          return rows;
        }
      })
      .addTerm({
        name: 'The customer must pay a VAT of 10%',
        price: function () {
          const orderers = this.transaction.data.orderers;
          const rows = [];
          for (const orderer of orderers) {
            const total = this.totals[orderer.name];

            // Number here are negative:
            const vat = this.amount(Math.min(0, total) * 0.1);
            rows.push(this.row([
              this.cell(orderer, vat),
              this.cell({ 'name': 'VAT' }, -vat )
            ], ['customer', 'vat']));
          }

          return rows;
        }
      })
      .addTerm({
        name: 'The sellers must pay a VAT of 20%',
        price: function () {
          const parties = this.transaction.contract.data.parties;
          const rows = [];
          for (const party of parties) {
            // Number here is positive:
            const vat = this.amount(Math.max(0, this.totals[party.name]) * 0.2);
            rows.push(this.row([
              this.cell(party, -vat),
              this.cell({ 'name': 'VAT' }, vat )
            ], ['seller', 'vat']));
          }
          return rows;
        }
      })
      .addTerm({
        name: 'The platform is offering you 50% of the final bill except the VAT !',
        price: function () {
          const orderers = this.transaction.data.orderers;
          const totalsOnVat = this.getTotalsOnTag('vat');
          const rows = [];
          for (const orderer of orderers) {
            const total = this.totals[orderer.name];
            const vat = totalsOnVat[orderer.name] || 0;

            // Number here are negative:
            const offer = this.amount(Math.min(0, total.sub(vat)) * 0.5);
            rows.push(this.row([
              this.cell(orderer, -offer),
              this.cell({ 'name': 'Platform' }, offer )
            ]));
          }

          return rows;
        }
      })
      .addParty(joe)
      .addParty(william)
      .sign()
      .publish();

    /**
     * Transaction creation from a given contract
     */
    const transaction = new Transaction({ contract });

    try {
      transaction.do('order', [[averell, luke]]);
    } catch (err) {
      console.error(err);
    }
    // transaction.do('order', jack);

    // transaction.undo();

    // transaction.do('updateData', { a: 1 }).undo();

    await new Promise(resolve => setTimeout(resolve, 500));

    transaction.do('complete');
    console.log(transaction.toJSON());

    // console.log(transaction.check());
    console.log(transaction.computePrice().toString());
  });
});