export function formatNum(val: number): string {
  const num = Number(val);
  if (isNaN(num)) return "0";
  if (Number.isInteger(num)) {
    return num.toString();
  }
  return parseFloat(num.toFixed(2)).toString();
}

export function formatTnd(amount: number, showPlus: boolean = false): string {
  const safeAmount = Number(amount) || 0;
  const isPositive = safeAmount > 0;
  const sign = showPlus && isPositive ? "+" : "";
  const half = safeAmount / 2;
  const halfSign = showPlus && half > 0 ? "+" : "";

  return `${sign}${formatNum(safeAmount)} TND (${halfSign}${formatNum(half)} TND)`;
}

export function formatCompactMoney(amount: number): {
  main: string;
  half: string;
  isWin: boolean;
  isLoss: boolean;
  colorClass: string;
} {
  const safeAmount = Number(amount) || 0;
  const isWin = safeAmount > 0;
  const isLoss = safeAmount < 0;
  const sign = isWin ? "+" : "";
  const half = safeAmount / 2;
  const halfSign = isWin ? "+" : "";

  return {
    main: `${sign}${formatNum(safeAmount)}`,
    half: `(${halfSign}${formatNum(half)})`,
    isWin,
    isLoss,
    colorClass: isWin ? "text-emerald-400" : isLoss ? "text-red-500" : "text-zinc-300",
  };
}

export function getMoneyColor(amount: number): string {
  if (amount > 0) return "text-emerald-400";
  if (amount < 0) return "text-red-500";
  return "text-zinc-300";
}
