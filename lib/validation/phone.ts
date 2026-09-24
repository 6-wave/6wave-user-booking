/**
 * Accepts Nigerian mobile numbers written as 08012345678, 8012345678,
 * 2348012345678 or +234 801 234 5678 and returns E.164 (+2348012345678).
 * Returns null when the number isn't a valid Nigerian mobile number.
 */
export function normalizeNigerianPhone(input: string): string | null {
  const digits = input.replace(/[\s\-().]/g, "");
  if (!/^\+?\d+$/.test(digits)) return null;

  let national: string;
  if (digits.startsWith("+234")) national = digits.slice(4);
  else if (digits.startsWith("234")) national = digits.slice(3);
  else if (digits.startsWith("0")) national = digits.slice(1);
  else national = digits;

  // Nigerian mobile numbers: 10 digits after the country code, starting 7, 8 or 9.
  return /^[789]\d{9}$/.test(national) ? `+234${national}` : null;
}
