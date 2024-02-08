export interface Transaction {
  id: number;
  orderId: number;
  amount: number;
  txType: 'Bet' | 'Win';
}

type UserBalance = number;

type Options = {
  comparator: (a: Transaction, b: Transaction) => number;
};

export interface ValidatedTransaction extends Transaction {
  valid: boolean;
}

type Result = {
  transactions: ValidatedTransaction[];
  balance: UserBalance;
};

const defaultOptions = {
  // но что делать с порядком orderId внутри id?
  comparator: (a: Transaction, b: Transaction) => a.id - b.id,
};

export function txValidate(
  transactions: Transaction[],
  initBalance: UserBalance = 0,
  options: Options = defaultOptions,
): Result {
  const transactionIds = new Set<number>();
  const validTransactions = new Map<number, boolean>();

  const sortedTransactions = [...transactions].sort(options.comparator);

  let balance = initBalance;
  for (let i = 0; i < sortedTransactions.length; i++) {
    const tx = sortedTransactions[i];
    if (transactionIds.has(tx.id)) {
      validTransactions.set(i, false);
      continue;
    }
    if (tx.txType === 'Bet') {
      // Тоесть все таки не уходим в минус? или проверяем но не позволяем? tx.amount >= balance
      balance -= tx.amount;
      if (balance < 0) {
        validTransactions.set(i, false);
        continue;
      }
    } else if (tx.txType === 'Win') {
      balance += tx.amount;
    } else {
      // throw?
    }
    validTransactions.set(i, true);
  }

  // обсуждаемо, нужно ли возвращать в таком формате или "по минимому"
  // единственный аргумент за такой формат - удобен для покрытия тестов
  return {
    transactions: sortedTransactions.map((tx, i) => ({
      ...tx,
      valid: validTransactions.get(i) || false,
    })),
    balance,
  };
}
