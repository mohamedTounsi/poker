export function formatTnd(amount: number): string {
  const formatNum = (val: number) => {
    // Check if it's an integer, if so don't show decimals
    if (Number.isInteger(val)) {
      return val.toString();
    }
    // Otherwise show up to 2 decimal places, removing trailing zeros
    return parseFloat(val.toFixed(2)).toString();
  };

  return `${formatNum(amount)} TND (${formatNum(amount / 2)} TND)`;
}
