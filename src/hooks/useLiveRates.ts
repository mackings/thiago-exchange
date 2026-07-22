"use client";

import { useEffect, useRef, useState } from "react";
import { binanceSymbols } from "@/lib/binance";
import { NGN_USD_RATE, BUY_MARGIN, SELL_MARGIN, type CoinRate } from "@/lib/rates";

export type LiveStatus = "connecting" | "live" | "reconnecting";

type BinanceTickerPayload = {
  data?: {
    s: string; // symbol, e.g. "BTCUSDT"
    c: string; // last price
    P: string; // 24h price change percent
  };
};

function toNgn(usd: number) {
  const ngn = usd * NGN_USD_RATE;
  return { buyNgn: ngn * (1 - BUY_MARGIN), sellNgn: ngn * (1 + SELL_MARGIN) };
}

export function useLiveRates(initialRates: CoinRate[]) {
  const [rates, setRates] = useState(initialRates);
  const [status, setStatus] = useState<LiveStatus>("connecting");
  const ratesRef = useRef(initialRates);
  // Only subscribe to the symbols this instance actually displays, captured
  // once at mount (the preview grid shows 6 coins, the full board shows all).
  const displayedIds = useRef(initialRates.map((r) => r.id));

  useEffect(() => {
    const relevantEntries = Object.entries(binanceSymbols).filter(([id]) =>
      displayedIds.current.includes(id),
    );
    const symbolToCoinId = new Map(
      relevantEntries.map(([id, symbol]) => [symbol, id]),
    );
    const streams = relevantEntries
      .map(([, symbol]) => `${symbol.toLowerCase()}@ticker`)
      .join("/");
    if (!streams) return;
    const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    function connect() {
      ws = new WebSocket(url);

      ws.onopen = () => {
        if (!cancelled) setStatus("live");
      };

      ws.onmessage = (event) => {
        let payload: BinanceTickerPayload;
        try {
          payload = JSON.parse(event.data);
        } catch {
          return;
        }
        const ticker = payload.data;
        if (!ticker?.s) return;

        const coinId = symbolToCoinId.get(ticker.s);
        if (!coinId) return;

        const usd = parseFloat(ticker.c);
        const usd24hChange = parseFloat(ticker.P);
        if (Number.isNaN(usd) || Number.isNaN(usd24hChange)) return;

        ratesRef.current = ratesRef.current.map((rate) =>
          rate.id === coinId
            ? { ...rate, usd, usd24hChange, ...toNgn(usd) }
            : rate,
        );
        setRates(ratesRef.current);
      };

      ws.onclose = () => {
        if (cancelled) return;
        setStatus("reconnecting");
        reconnectTimer = setTimeout(connect, 2000);
      };

      ws.onerror = () => {
        ws?.close();
      };
    }

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, []);

  return { rates, status };
}
