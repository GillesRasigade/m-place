import Decimal from 'decimal.js';

const DecimalAmount = Decimal.clone({
  precision: 5,
  minE: -3
});

export default class Amount extends DecimalAmount {}
