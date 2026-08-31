"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { money, type AdDTO } from "@/lib/api";
import { CoinIcon } from "@/components/muiapp/CoinIcon";

type BinanceTicker = {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
};

const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT"];

export function MarketSlider({ ads }: { ads: AdDTO[] }) {
  const [tickers, setTickers] = useState<BinanceTicker[]>([]);
  const [marketError, setMarketError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function loadMarket() {
      try {
        const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(symbols))}`, { cache: "no-store" });
        if (!res.ok) throw new Error("market unavailable");
        const payload = (await res.json()) as BinanceTicker[];
        if (mounted) {
          setTickers(Array.isArray(payload) ? payload : []);
          setMarketError("");
        }
      } catch {
        if (mounted) setMarketError("Live market data is refreshing.");
      }
    }
    loadMarket();
    const id = window.setInterval(loadMarket, 60_000);
    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, []);

  const fallbackAds = ads.filter((ad) => ad.rateType === "fixed" && ["BTC", "ETH", "USDT"].includes(ad.asset.toUpperCase())).slice(0, 3);
  const liveItems = tickers.map((ticker) => ({
    key: ticker.symbol,
    coin: ticker.symbol.replace("USDT", ""),
    price: `$${Number(ticker.lastPrice).toLocaleString("en-US", { maximumFractionDigits: Number(ticker.lastPrice) > 100 ? 2 : 4 })}`,
    change: `${Number(ticker.priceChangePercent) >= 0 ? "+" : ""}${Number(ticker.priceChangePercent).toFixed(2)}%`,
    positive: Number(ticker.priceChangePercent) >= 0,
    source: "Binance",
  }));
  const items = liveItems.length
    ? liveItems
    : fallbackAds.map((ad) => ({
        key: ad.id,
        coin: ad.asset,
        price: `${money(ad.fixedRate)} / ${ad.asset}`,
        change: "Live",
        positive: true,
        source: "Thiago",
      }));

  return (
    <Box sx={{ overflow: "hidden", width: "100%", maxHeight: { xs: 82, md: 92 } }}>
      <Stack
        direction="row"
        spacing={0.8}
        sx={{
          width: "max-content",
          p: 0.45,
          animation: "marketSlide 28s linear infinite",
          "@keyframes marketSlide": {
            "0%": { transform: "translateX(0)" },
            "100%": { transform: "translateX(-50%)" },
          },
        }}
      >
        {[...items, ...items].map((item, index) => (
          <Box
            key={`${item.key}-${index}`}
            sx={{
              minWidth: { xs: 152, md: 188 },
              p: { xs: 0.8, md: 1 },
              borderRadius: 2.5,
              bgcolor: "#fff",
              border: "1px solid rgba(217,134,31,0.14)",
              boxShadow: "0 10px 24px rgba(32,8,8,0.05)",
            }}
          >
            <Stack direction="row" spacing={0.8} alignItems="center">
              <CoinIcon coin={item.coin} size={32} />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 1000, fontSize: { xs: 12.5, md: 13.5 }, lineHeight: 1.2, whiteSpace: "nowrap" }}>{item.coin}</Typography>
                <Stack direction="row" spacing={0.6} alignItems="baseline">
                  <Typography sx={{ fontWeight: 1000, color: "#611818", fontSize: { xs: 13, md: 15 }, lineHeight: 1.2, whiteSpace: "nowrap" }}>{item.price}</Typography>
                  <Typography sx={{ fontWeight: 900, fontSize: { xs: 10.5, md: 11.5 }, color: item.positive ? "#8a5a10" : "#b42318", whiteSpace: "nowrap" }}>{item.change}</Typography>
                </Stack>
              </Box>
            </Stack>
          </Box>
        ))}
        {["Binance", "Coinbase", "OKX"].map((name) => (
          <Box
            key={name}
            sx={{
              minWidth: { xs: 104, md: 120 },
              p: { xs: 0.8, md: 1 },
              borderRadius: 2.5,
              bgcolor: "#200808",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.14)",
            }}
          >
            <Typography sx={{ fontWeight: 1000, fontSize: { xs: 12.5, md: 13.5 }, lineHeight: 1.2 }}>{name}</Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.66)", fontSize: { xs: 9.5, md: 10.5 }, lineHeight: 1.25 }}>{marketError || "exchange signal"}</Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
