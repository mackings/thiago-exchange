import { coins } from "@/lib/coins";

export type CoinRate = {
  id: string;
  symbol: string;
  name: string;
  usd: number;
  usd24hChange: number;
  buyNgn: number;
  sellNgn: number;
};

// Reference NGN/USD rate and desk spread used to derive local buy/sell
// quotes from the live USD market price. Update these to match the desk's
// actual daily rate and margin. Exported so the client-side live price
// feed can apply the same math to fresh WebSocket ticks.
export const NGN_USD_RATE = 1650;
export const BUY_MARGIN = 0.03; // Thiago Exchange buys slightly below market
export const SELL_MARGIN = 0.03; // Thiago Exchange sells slightly above market

// Static fallback so the page still renders useful numbers if the live
// price feed is unreachable (e.g. offline build, upstream rate limit).
const FALLBACK_USD: Record<string, { usd: number; change: number }> = {
  bitcoin: { usd: 105000, change: 0 },
  tether: { usd: 1, change: 0 },
  ethereum: { usd: 3400, change: 0 },
  binancecoin: { usd: 650, change: 0 },
  ripple: { usd: 2.3, change: 0 },
  solana: { usd: 175, change: 0 },
  cardano: { usd: 0.75, change: 0 },
  dogecoin: { usd: 0.22, change: 0 },
  litecoin: { usd: 105, change: 0 },
  polkadot: { usd: 5.5, change: 0 },
  chainlink: { usd: 17, change: 0 },
  "polygon-ecosystem-token": { usd: 0.5, change: 0 },
  stellar: { usd: 0.32, change: 0 },
  monero: { usd: 160, change: 0 },
};

function buildRates(
  prices: Record<string, { usd: number; change: number }>,
): CoinRate[] {
  return coins.map((coin) => {
    const price = prices[coin.id] ?? FALLBACK_USD[coin.id];
    const usdValue = price?.usd ?? 0;
    const ngnValue = usdValue * NGN_USD_RATE;
    return {
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      usd: usdValue,
      usd24hChange: price?.change ?? 0,
      buyNgn: ngnValue * (1 - BUY_MARGIN),
      sellNgn: ngnValue * (1 + SELL_MARGIN),
    };
  });
}

// Synchronous fallback table, for client components that need to seed
// useLiveRates immediately (e.g. a ticker strip) without an async fetch.
export function getFallbackRates(): CoinRate[] {
  return buildRates(FALLBACK_USD);
}

export async function getRates(): Promise<{
  rates: CoinRate[];
  isLive: boolean;
}> {
  const ids = coins.map((c) => c.id).join(",");
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

  try {
    const res = await fetch(url, { next: { revalidate: 120 } });
    if (!res.ok) throw new Error(`CoinGecko responded ${res.status}`);

    const data = (await res.json()) as Record<
      string,
      { usd: number; usd_24h_change?: number }
    >;

    const prices: Record<string, { usd: number; change: number }> = {};
    for (const [id, value] of Object.entries(data)) {
      prices[id] = { usd: value.usd, change: value.usd_24h_change ?? 0 };
    }

    return { rates: buildRates(prices), isLive: true };
  } catch {
    return { rates: buildRates(FALLBACK_USD), isLive: false };
  }
}
