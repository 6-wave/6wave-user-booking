const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function formatNaira(amount: number): string {
  return naira.format(amount);
}

/** +2348012345678 -> 0801 234 5678 */
export function formatPhone(e164: string): string {
  const local = e164.startsWith("+234") ? `0${e164.slice(4)}` : e164;
  return local.replace(/^(\d{4})(\d{3})(\d{4})$/, "$1 $2 $3");
}
