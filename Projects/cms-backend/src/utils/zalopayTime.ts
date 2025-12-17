/**
 * Get Vietnam timezone YYMMDD format for ZaloPay
 * ZaloPay requires yymmdd prefix in Vietnam timezone (GMT+7)
 */
export function vnYYMMDD(date: Date = new Date()): string {
  // Vietnam timezone offset: GMT+7 = 7 * 60 minutes
  const tzOffset = 7 * 60; // minutes
  const local = new Date(date.getTime() + (tzOffset - date.getTimezoneOffset()) * 60000);
  const y = local.getFullYear().toString().slice(-2);
  const m = (local.getMonth() + 1).toString().padStart(2, '0');
  const d = local.getDate().toString().padStart(2, '0');
  return `${y}${m}${d}`;
}





