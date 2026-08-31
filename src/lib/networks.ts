// Chains each supported asset can actually move on. Assets pegged to a
// single native chain get one option; multi-chain assets (mainly USDT) list
// every network we accept a deposit/payout on.
export const assetNetworks: Record<string, string[]> = {
  BTC: ["Bitcoin"],
  ETH: ["ERC20"],
  BNB: ["BEP20"],
  SOL: ["Solana"],
  XRP: ["Ripple"],
  USDT: ["TRC20", "ERC20", "BEP20"],
  ADA: ["Cardano"],
  DOGE: ["Dogecoin"],
  LTC: ["Litecoin"],
  DOT: ["Polkadot"],
  LINK: ["ERC20"],
  POL: ["Polygon"],
  XLM: ["Stellar"],
  XMR: ["Monero"],
};

export function networksFor(asset: string): string[] {
  return assetNetworks[asset.toUpperCase()] || [asset.toUpperCase()];
}

// Logo for the chain a network option actually runs on (e.g. TRC20 -> Tron),
// not the traded asset itself.
export const networkIcons: Record<string, string> = {
  Bitcoin: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
  ERC20: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
  BEP20: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
  Solana: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
  Ripple: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
  TRC20: "https://assets.coingecko.com/coins/images/1094/large/tron-logo.png",
  Cardano: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
  Dogecoin: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png",
  Litecoin: "https://assets.coingecko.com/coins/images/2/large/litecoin.png",
  Polkadot: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png",
  Polygon: "https://assets.coingecko.com/coins/images/32440/large/polygon.png",
  Stellar: "https://assets.coingecko.com/coins/images/100/large/Stellar_symbol_black_RGB.png",
  Monero: "https://assets.coingecko.com/coins/images/69/large/monero_logo.png",
};
