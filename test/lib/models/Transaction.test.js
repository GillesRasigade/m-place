import { expect } from 'chai';

import { models } from '../../../src/lib';

describe('Transaction', () => {
  describe('Manages transaction data successfully', () => {
    it('allows to initialize data from the constructor', () => {
      const transaction = new models.Transaction({
        amount: 10
      });

      expect(transaction.data).to.deep.equal({
        amount: 10
      });
    });

    it('allows to replace the data from the setter', () => {
      const transaction = new models.Transaction();
      expect(transaction.data).to.deep.equal({ amount: null });

      transaction.setData({ amount: 10 });
      expect(transaction.data).to.deep.equal({ amount: 10 });
    });

    it('allows to undo the data update', () => {
      const transaction = new models.Transaction();
      expect(transaction.data).to.deep.equal({ amount: null });

      transaction.do('setAmount', 10);
      transaction.undo();
      expect(transaction.data).to.deep.equal({ amount: null });
    });
  });

  describe('Manages transaction state data successfully', () => {
    it('allows to initialize state data', () => {
      const transaction = new models.Transaction({ amount: 10 });

      transaction.do('setAmount', 11);

      transaction.undo();
      expect(transaction.data).to.deep.equal({
        amount: 10
      });
    });
  });

  describe('functional workflow', () => {
    it('allows to distribute transactions successfully', () => {
      const transaction = new models.Transaction();

      transaction.do('setAmount', -10).do('validate');
      expect(transaction.state.id).to.equal('validated');
      expect(transaction.data).to.deep.equal({
        amount: -10
      });

      transaction.undo();
      expect(transaction.state.id).to.equal('created');

      transaction.redo();
      expect(transaction.state.id).to.equal('validated');

      transaction.do('offer');
      console.log(transaction.state.id);
    });
  });
});