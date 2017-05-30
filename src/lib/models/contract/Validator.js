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
            id: i,
            term: terms[i].name,
            err
          });
        }
      }
    }

    if (errors.length) {
      this.errors.push(errors);
    }
    return errors;
  }
}
