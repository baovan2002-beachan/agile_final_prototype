// ASSUMPTION: account balance is used first, remainder goes to the payment gateway.
export function splitSettlement(total: number, balance: number): { fromAccount: number; fromGateway: number } {
  const t = Math.max(0, total);
  const fromAccount = Math.min(t, Math.max(0, balance));
  return { fromAccount, fromGateway: t - fromAccount };
}
