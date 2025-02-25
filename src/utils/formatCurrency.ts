export function formatCurrency(value: number): string {
  if (value === undefined || value === null) return "$0.00";
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}
