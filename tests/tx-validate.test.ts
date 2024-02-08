/* eslint-disable import/no-extraneous-dependencies */
import { suite } from 'uvu';
import * as assert from 'uvu/assert';

import type { ValidatedTransaction } from '../src';
import { txValidate } from '../src';

const test = suite('txValidate');

test('default usage', () => {
  const initBalance = 100;
  const trancastions: ValidatedTransaction[] = [
    { id: 1, orderId: 1, amount: 100, txType: 'Bet', valid: true }, // 000
    { id: 2, orderId: 2, amount: 200, txType: 'Win', valid: true }, // 200
    { id: 3, orderId: 3, amount: 300, txType: 'Bet', valid: false }, // -100
    { id: 4, orderId: 4, amount: 400, txType: 'Win', valid: true }, // 300
    { id: 5, orderId: 5, amount: 500, txType: 'Bet', valid: false }, // -200
    { id: 6, orderId: 6, amount: 600, txType: 'Win', valid: true }, // 400
  ];
  const resultBalance = 400;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const input = trancastions.map(({ valid, ...tx }) => tx);
  const result = txValidate(input, initBalance);
  assert.equal(result.balance, resultBalance);
  assert.equal(result.transactions, trancastions);
});

test.run();
