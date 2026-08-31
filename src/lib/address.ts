// Structural (format) validation only — confirms an address is well-formed
// for the given network, not that it exists on-chain or is reachable. Still
// the single highest-value check here: a malformed address is the most
// common way people lose funds sending crypto.
const patterns: Record<string, RegExp> = {
  Bitcoin: /^(bc1[a-z0-9]{25,90}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/,
  ERC20: /^0x[a-fA-F0-9]{40}$/,
  BEP20: /^0x[a-fA-F0-9]{40}$/,
  Polygon: /^0x[a-fA-F0-9]{40}$/,
  TRC20: /^T[1-9A-HJ-NP-Za-km-z]{33}$/,
  Solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  Ripple: /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/,
  Cardano: /^(addr1[a-z0-9]+|Ae2[1-9A-HJ-NP-Za-km-z]+|DdzFF[1-9A-HJ-NP-Za-km-z]+)$/,
  Dogecoin: /^D[5-9A-HJ-NP-U][1-9A-HJ-NP-Za-km-z]{32}$/,
  Litecoin: /^(ltc1[a-z0-9]{25,90}|[LM3][1-9A-HJ-NP-Za-km-z]{26,33})$/,
  Polkadot: /^1[1-9A-HJ-NP-Za-km-z]{46,47}$/,
  Stellar: /^G[A-Z2-7]{55}$/,
  Monero: /^[48][0-9AB][1-9A-HJ-NP-Za-km-z]{93}$/,
};

export function isValidAddress(network: string, address: string): boolean {
  const pattern = patterns[network];
  const trimmed = address.trim();
  if (!pattern) return trimmed.length > 0;
  return pattern.test(trimmed);
}
