export default class Validator {
  constructor(contract) {
    this.contract = contract;
    this.errors = [];
  }

  validate(transaction) {
    const terms = this.contract.terms;
    const errors = [];
    for (var i in terms) {
      if ('function' === typeof(terms[i].validate)) {
        try {
          terms[i].validate.call(this.contract, transaction);
        } catch (err) {
          errors.push({
            term_id: parseInt(i, 10),
            term: terms[i],
            err
          });
        }
      }
    }

    this.errors = errors;
    return errors;
  }
}
