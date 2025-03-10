export function formatCurrency(value: number): string {
  // Handle undefined, null, or NaN values
  if (value === undefined || value === null || isNaN(value)) {
    return "0.00 $";
  }
  
  if (value < 0.01) {
    return value.toFixed(8) + " $";
  }
  if (value >= 1e9) {
    return (value / 1e9).toFixed(2) + "B $";
  }
  if (value >= 1e6) {
    return (value / 1e6).toFixed(2) + "M $";
  }
  // For all values between 0.01 and 1e6
  return value.toFixed(2) + " $";
}
