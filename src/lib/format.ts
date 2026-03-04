const CURRENCY_SYMBOLS: Record<string, string> = {
  ETB: "Br",
  USD: "$",
  EUR: "€",
};

export function currencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] ?? "";
}

/**
 * Format a cents value as a human-readable currency string.
 *
 * Examples:
 *   formatMoney(150000, "ETB")          => "Br1,500.00"
 *   formatMoney(150000, "ETB", true)    => "+Br1,500.00"
 *   formatMoney(150000, "ETB", false)   => "-Br1,500.00"
 *   formatMoney(150000, "USD", undefined, 0) => "$1,500"
 *   formatMoney(0, "ETB")              => "Br0.00"
 */
export function formatMoney(
  cents: number,
  currency: string,
  sign?: boolean | undefined,
  fractionDigits: number = 2,
): string {
  const abs = Math.abs(cents) / 100;
  const formatted = abs.toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  const sym = currencySymbol(currency);
  const prefix =
    sign === true ? "+" : sign === false ? "-" : "";
  return `${prefix}${sym}${formatted}`;
}
