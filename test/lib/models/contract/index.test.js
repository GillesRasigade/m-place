import { expect } from 'chai';

import Contract from '../../../../src/lib/models/contract';

describe('Contract', () => {
  describe('#addTerm', () => {
    it('allows to add term to a contract', () => {
      const contract = new Contract();
      expect(contract.data.terms).to.have.property('length', 0);

      contract.addTerm({
        name: 'Transaction seller must be called B'
      });
      expect(contract.data.terms).to.have.property('length', 1);
    });
  });

  describe('#removeTerm', () => {
    it('allows to remove a term from a contract', () => {
      const contract = new Contract();
      expect(contract.data.terms).to.have.property('length', 0);

      contract
        .addTerm({ name: 'Term #1' })
        .addTerm({ name: 'Term #2' })
        .removeTerm(0);

      expect(contract.data.terms).to.have.property('length', 1);
      expect(contract.data.terms[0]).to.have.property('name', 'Term #2');
    });
  });

  describe('#sign', () => {
    it('allows to be signed when in edition mode', () => {
      const contract = new Contract();

      contract
        .addTerm({ name: 'Term #1' })
        .addTerm({ name: 'Term #2' })
        .sign();

      expect(contract.state.id).to.equal('signed');
    });
  });

  describe('#toJSON', () => {
    it('returns a valid JSON object', () => {
      const contract = new Contract();
      contract
        .addTerm({ name: 'Term #1', description: 'Description first terms' })
        .addTerm({ name: 'Term #2' });

      expect(contract.toJSON()).to.be.a('object');
    });

    it('initializes the object correctly', async () => {
      const c1 = new Contract();
      c1
        .do('addTerm', [{ name: 'Term #1', description: 'Description first terms' }])
        .do('addTerm', [{ name: 'Term #2' }]);

      await new Promise(resolve => setTimeout(resolve, 100));

      const c2 = new Contract(c1.toJSON());

      expect(c2.toJSON()).to.deep.equal(c1.toJSON());
    });
  });

  describe('#toString', () => {
    it('returns a human formated definition of terms', () => {
      const contract = new Contract();
      contract
        .addTerm({ name: 'Term #1', description: 'Description first terms' })
        .addTerm({ name: 'Term #2' });

      expect(contract.toString()).to.be.a('string');
    });
  });
});