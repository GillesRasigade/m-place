# m-place

Market place models for transactions

[![Build Status](https://travis-ci.org/GillesRasigade/m-place.svg?branch=master)](https://travis-ci.org/GillesRasigade/m-place) [![Code Climate](https://codeclimate.com/github/GillesRasigade/pattern/badges/gpa.svg)](https://codeclimate.com/github/GillesRasigade/m-place) [![Test Coverage](https://codeclimate.com/github/GillesRasigade/m-place/badges/coverage.svg)](https://codeclimate.com/github/GillesRasigade/m-place/coverage) [![npm dependencies](https://david-dm.org/GillesRasigade/m-place.svg)](https://david-dm.org/GillesRasigade/m-place.svg) [![Issue Count](https://codeclimate.com/github/GillesRasigade/m-place/badges/issue_count.svg)](https://codeclimate.com/github/GillesRasigade/m-place)

## Installation

```bash
nvm use
npm install
npm test # eslint + coverage
```

## Workflow

```javascript
// 1. Contract definition and publication
const john = new Actor({ name: 'John' });
const contract = new Contract();

contract
  .changeOwnership(john)
  .addParty(john)
  .addTerm({ name: 'Term #1' })
  .sign()
  .pubish();

// 2. Transaction creation from contract
const william = new Actor({ name: 'William' });
const transaction = new Transaction({ contract });

transaction.order([william]).computePrice();
```