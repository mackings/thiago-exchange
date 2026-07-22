// Maps our coin ids to Binance USDT trading pairs for live ticker streaming.
// Tether has no entry: it's the quote currency itself, so it's treated as a
// pegged $1.00 asset rather than streamed.
export const binanceSymbols: Record<string, string> = {
  bitcoin: "BTCUSDT",
  ethereum: "ETHUSDT",
  binancecoin: "BNBUSDT",
  ripple: "XRPUSDT",
  solana: "SOLUSDT",
  cardano: "ADAUSDT",
  dogecoin: "DOGEUSDT",
  litecoin: "LTCUSDT",
  polkadot: "DOTUSDT",
  chainlink: "LINKUSDT",
  "polygon-ecosystem-token": "POLUSDT",
  stellar: "XLMUSDT",
  monero: "XMRUSDT",
};
