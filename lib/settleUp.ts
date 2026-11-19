export interface SettleTransaction {
  from: string; // Debtor who pays
  to: string;   // Creditor who receives
  amount: number;
}

/**
 * Computes the minimum number of transactions needed to settle all balances.
 * Takes an array of { username: string, score: number }
 * A positive score means the player won / is owed money.
 * A negative score means the player lost / owes money.
 */
export function calculateSettlements(
  players: Array<{ username: string; score: number }>
): { transactions: SettleTransaction[]; isBalanced: boolean; netTotal: number } {
  const netTotal = players.reduce((acc, p) => acc + p.score, 0);
  const isBalanced = Math.abs(netTotal) < 0.001;

  // Separate into debtors (score < 0) and creditors (score > 0)
  interface Person {
    username: string;
    amount: number;
  }

  const debtors: Person[] = [];
  const creditors: Person[] = [];

  for (const p of players) {
    if (p.score < -0.001) {
      debtors.push({ username: p.username, amount: -p.score });
    } else if (p.score > 0.001) {
      creditors.push({ username: p.username, amount: p.score });
    }
  }

  // Sort descending by amount
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions: SettleTransaction[] = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settled = Math.min(debtor.amount, creditor.amount);
    if (settled > 0.001) {
      transactions.push({
        from: debtor.username,
        to: creditor.username,
        amount: Math.round(settled * 100) / 100,
      });
    }

    debtor.amount -= settled;
    creditor.amount -= settled;

    if (debtor.amount < 0.001) dIdx++;
    if (creditor.amount < 0.001) cIdx++;
  }

  return {
    transactions,
    isBalanced,
    netTotal: Math.round(netTotal * 100) / 100,
  };
}
