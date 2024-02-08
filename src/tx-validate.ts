import type { Result, Transaction, UserBalance } from './types';

type Options = {
  comparator: (a: Transaction, b: Transaction) => number;
};

export interface ValidatedTransaction extends Transaction {
  valid: boolean;
}

const defaultOptions = {
  // TODO: вопрос! но что делать с порядком orderId если id равны? может тоже надо сортировать?
  comparator: (a: Transaction, b: Transaction) => a.id - b.id,
};

export function txValidate(
  transactions: Transaction[],
  initBalance: UserBalance = 0,
  options: Options = defaultOptions,
): Result {
  const transactionIds = new Set<number>();
  const notValidOrdersIds = new Set<number>();
  // ключ это индекс в отсортированном массиве, а не id транзакции
  const validTransactions = new Map<number, boolean>();

  const sortedTransactions = [...transactions].sort(options.comparator);

  let balance = initBalance;
  for (let i = 0; i < sortedTransactions.length; i++) {
    const tx = sortedTransactions[i];
    if (transactionIds.has(tx.id)) {
      validTransactions.set(i, false);
      continue;
    }
    // TODO: тонкость, делать ли пометку до предыдущего сравнения или после. Подумать над тестом
    transactionIds.add(tx.id);
    if (notValidOrdersIds.has(tx.orderId)) {
      validTransactions.set(i, false);
      continue;
    }

    if (tx.txType === 'Win') {
      balance += tx.amount;
      validTransactions.set(i, true);
      continue;
    } 
    if (tx.txType === 'Bet') {
      if (tx.amount > balance) {
        notValidOrdersIds.add(tx.orderId);
        validTransactions.set(i, false);
        continue;
      }
      balance -= tx.amount;
      validTransactions.set(i, true);
      continue;
    } 

    throw new Error(`Unknown txType: ${tx.txType}`);
  }

  return {
    transactions: sortedTransactions.map((tx, i) => ({
      ...tx,
      valid: validTransactions.get(i) ?? false,
    })),
    balance,
  };
}
