export function formatCurrency(value: number): string {
  if (value >= 1e6 && value < 1e9) {
    return "$" + (value / 1e6).toFixed(2) + " M";
  } 
  if (value <= 1e6) {
    return  value.toFixed(2) + " $" ;
  }
  if (value >= 1e9) {
    return "$" + (value / 1e9).toFixed(2) + " B";
  } 
  return   value.toLocaleString("de-DE") +"$";
}
