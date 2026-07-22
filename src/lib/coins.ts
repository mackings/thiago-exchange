import {
  SiBitcoin,
  SiEthereum,
  SiTether,
  SiBinance,
  SiRipple,
  SiSolana,
  SiCardano,
  SiDogecoin,
  SiLitecoin,
  SiPolkadot,
  SiChainlink,
  SiPolygon,
  SiStellar,
  SiMonero,
} from "react-icons/si";
import type { IconType } from "react-icons";

export type Coin = {
  id: string;
  symbol: string;
  name: string;
  icon: IconType;
  color: string;
};

export const coins: Coin[] = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", icon: SiBitcoin, color: "#F7931A" },
  { id: "tether", symbol: "USDT", name: "Tether", icon: SiTether, color: "#26A17B" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", icon: SiEthereum, color: "#627EEA" },
  { id: "binancecoin", symbol: "BNB", name: "BNB", icon: SiBinance, color: "#F3BA2F" },
  { id: "ripple", symbol: "XRP", name: "XRP", icon: SiRipple, color: "#23292F" },
  { id: "solana", symbol: "SOL", name: "Solana", icon: SiSolana, color: "#14F195" },
  { id: "cardano", symbol: "ADA", name: "Cardano", icon: SiCardano, color: "#0033AD" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin", icon: SiDogecoin, color: "#C2A633" },
  { id: "litecoin", symbol: "LTC", name: "Litecoin", icon: SiLitecoin, color: "#345D9D" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot", icon: SiPolkadot, color: "#E6007A" },
  { id: "chainlink", symbol: "LINK", name: "Chainlink", icon: SiChainlink, color: "#2A5ADA" },
  { id: "polygon-ecosystem-token", symbol: "POL", name: "Polygon", icon: SiPolygon, color: "#8247E5" },
  { id: "stellar", symbol: "XLM", name: "Stellar", icon: SiStellar, color: "#14B6E7" },
  { id: "monero", symbol: "XMR", name: "Monero", icon: SiMonero, color: "#FF6600" },
];
