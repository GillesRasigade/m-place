import { expect } from 'chai';

import Actor from '../../../../src/lib/models/Actor';
import Contract from '../../../../src/lib/models/contract';
import Term from '../../../../src/lib/models/contract/Term';
import Price from '../../../../src/lib/models/price';

import Transaction from '../../../../src/lib/models/transaction';

describe('Transaction', () => {
  const joe = new Actor({ name: 'Joe' });
  describe('actions', () => {
    const contract = new Contract();
    contract.changeOwnership(joe).addTerm({ name: 'Term' });

    let transaction;
    beforeEach(() => {
      transaction = new Transaction({ contract });
    });
    describe('#order', () => {
      it('allows to order the transaction in created state', () => {
        transaction.order();

        expect(transaction.data).to.have.property('state', 'ordered');
      });
    });
    describe('#complete', () => {
      it('allows to complete the transaction in ordered state', () => {
        transaction.order().complete();

        expect(transaction.data).to.have.property('state', 'completed');
        expect(transaction.data).to.have.property('completed').instanceOf(Date);
      });
    });
    describe('#cancel', () => {
      it('allows to cancel a transaction in created state', () => {
        transaction.cancel();

        expect(transaction.data).to.have.property('state', 'canceled');
      });

      it('allows to cancel a transaction in created state', () => {
        transaction.order().cancel();

        expect(transaction.data).to.have.property('state', 'canceled');
      });
    });
  });

  describe('#validate', () => {
    it('validates the transaction against the contract definition', () => {
      const contract = new Contract();
      console.log(contract.terms);
      const term = new Term({
        name: 'Term',
        validate: function (transaction) {
          const orderers = transaction.data.orderers;
          if (orderers.length < 2) {
            throw new Error('Only one orderer is authorized');
          }
        }
      });

      console.log(contract.terms);

      // Setup the contract
      contract.changeOwnership(joe).addTerm(term);

      const transaction = new Transaction({ contract });

      console.log(68, transaction);

      const errors = transaction.validate();
      expect(errors).to.have.property('length', 1);
      expect(errors[0]).to.have.property('term_id', 0);
      expect(errors[0]).to.have.property('term', term).instanceof(Term);

      // With 2 orderers, the terms are now validated
      transaction.order([{ name: 'William' }, { name: 'Averell'}]);
      expect(transaction.validate()).to.have.property('length', 0);
    });
  });

  describe('#validateAndRollback', () => {
    it('validates then rollback if errors exist the last action', () => {
      const contract = new Contract();
      const term = new Term({
        name: 'Term',
        validate: function (transaction) {
          const orderers = transaction.data.orderers;
          if (orderers.length < 2) {
            throw new Error('Only one orderer is authorized');
          }
        }
      });

      // Setup the contract
      contract.changeOwnership(joe).addTerm(term);

      const transaction = new Transaction({ contract });

      // With 2 orderers, the terms are now validated
      expect(() => transaction.order([{ name: 'William' }]))
        .to.throws(Error, 'Transaction check failed');
      expect(transaction.data).to.have.property('state', 'created');
    });
  });

  describe('#computePrice', () => {
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

    it('returns a two-dimensional prices array with totals and amounts', () => {
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
      const price = transaction.computePrice();

      expect(price).to.be.instanceOf(Price);
    });
  });

  describe('getters', () => {
    const contract = new Contract();
    const owner = new Actor({ name: 'John' });
    const transaction = new Transaction({ contract });

    it('`contract` returns the contract', () => {
      expect(transaction.contract).to.equals(contract);
    });
  });
});