"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import ErrorIcon from "@mui/icons-material/Error";
import GppGoodIcon from "@mui/icons-material/GppGood";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ShieldIcon from "@mui/icons-material/Shield";
import { api, ApiError, money, type AdDTO, type OrderDTO } from "@/lib/api";
import { CoinIcon } from "@/components/muiapp/CoinIcon";
import { isValidAddress } from "@/lib/address";
import { networkIcons, networksFor } from "@/lib/networks";

export function TradeView({
  ads,
  orders = [],
  isAuthed,
  selectedAd,
  onSelectedAd,
  onViewOffer,
  onBackToOffers,
  onRequireAuth,
  onCreated,
  onError,
}: {
  ads: AdDTO[];
  orders?: OrderDTO[];
  isAuthed: boolean;
  selectedAd: AdDTO | null;
  onSelectedAd: (ad: AdDTO | null) => void;
  onViewOffer?: (ad: AdDTO) => void;
  onBackToOffers?: () => void;
  onRequireAuth: () => void;
  onCreated: (order: OrderDTO) => void;
  onError: (message: string) => void;
}) {
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [payoutAddress, setPayoutAddress] = useState("");
  const [payoutChain, setPayoutChain] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  const selected = selectedAd;
  // ad.side === "sell" means Thiago is selling, so the trader here is buying.
  const traderIsBuying = selected ? selected.side === "sell" : mode === "buy";
  const rate = selected?.rateType === "fixed" ? selected.fixedRate : null;
  const numericAmount = Number(amount || 0);
  // Fixed-rate ads: the trader types the fiat amount they want to spend/receive
  // (the number the ad's min/max limits actually gate), and we derive the coin
  // amount from it. Floating-margin ads have no client-side rate to convert
  // with, so the trader still types the coin amount directly there, same as
  // before — the backend resolves the live rate and its own limit check at
  // order creation.
  const assetAmount = rate ? (numericAmount > 0 ? numericAmount / rate : 0) : numericAmount;
  const belowMinimum = Boolean(selected && rate && numericAmount > 0 && numericAmount < selected.minLimit);
  const aboveMaximum = Boolean(selected && rate && numericAmount > selected.maxLimit);
  const addressTouched = payoutAddress.trim().length > 0;
  const addressValid = addressTouched && isValidAddress(payoutChain, payoutAddress);

  useEffect(() => {
    setPayoutChain(selected ? networksFor(selected.asset)[0] : "");
  }, [selected]);

  const filteredAds = useMemo(() => {
    // From the trader's point of view: to buy, they need a "sell" ad
    // (Thiago selling); to sell, they need a "buy" ad.
    const wantSide = mode === "buy" ? "sell" : "buy";
    return [...ads].filter((a) => a.side === wantSide).sort((a, b) => a.asset.localeCompare(b.asset));
  }, [ads, mode]);

  function successfulCount(ad: AdDTO) {
    return orders.filter((o) => o.asset === ad.asset && o.status === "completed").length;
  }

  function responseTime(ad: AdDTO) {
    return ad.asset === "USDT" ? "Under 1 min" : "Under 5 mins";
  }

  function viewOffer(ad: AdDTO) {
    if (onViewOffer) {
      onViewOffer(ad);
      return;
    }
    onSelectedAd(ad);
    setAmount("");
    setAccepted(false);
    setLocalError("");
  }

  function closeSheet() {
    if (onBackToOffers) {
      onBackToOffers();
      return;
    }
    onSelectedAd(null);
  }

  async function submit() {
    if (!isAuthed) {
      onRequireAuth();
      return;
    }
    if (!selected || !accepted || !numericAmount) return;
    if (belowMinimum || aboveMaximum) {
      setLocalError(`Amount must land between ${money(selected.minLimit)} and ${money(selected.maxLimit)}.`);
      return;
    }
    if (traderIsBuying && (!payoutAddress.trim() || !payoutChain.trim())) {
      setLocalError("Add your wallet address and network so we know where to send your coin.");
      return;
    }
    if (traderIsBuying && !addressValid) {
      setLocalError(`That doesn't look like a valid ${payoutChain} address. Double-check it before continuing.`);
      return;
    }
    setSubmitting(true);
    setLocalError("");
    try {
      const order = await api.createOrder({
        adId: selected.id,
        assetAmount,
        payoutAddress: traderIsBuying ? payoutAddress.trim() : undefined,
        payoutChain: traderIsBuying ? payoutChain.trim() : undefined,
      });
      onSelectedAd(null);
      setAccepted(false);
      setAmount("");
      onCreated(order);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Something went wrong. Try again.";
      setLocalError(message);
      onError(message);
    } finally {
      setSubmitting(false);
    }
  }

  const detailSheet = (
    <Drawer
      anchor="bottom"
      open={Boolean(selected)}
      onClose={closeSheet}
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: { xs: "100%", md: 900 },
          mx: "auto",
          borderTopLeftRadius: { xs: 20, md: 28 },
          borderTopRightRadius: { xs: 20, md: 28 },
          maxHeight: "92vh",
          bgcolor: "#fffaf0",
          backgroundImage: "none",
        },
      }}
    >
      {selected && (
        <Box sx={{ overflowY: "auto", maxHeight: "92vh" }}>
          <Stack alignItems="center" sx={{ pt: 1.2 }}>
            <Box sx={{ width: 44, height: 5, borderRadius: 999, bgcolor: "rgba(32,8,8,0.14)" }} />
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: { xs: 1.5, md: 3 }, pt: 1, pb: 0.5 }}>
            <Chip size="small" icon={<ShieldIcon />} label="TRADING GROUND" sx={{ bgcolor: "#fbebeb", color: "#611818", fontWeight: 1000, letterSpacing: 1.6 }} />
            <IconButton onClick={closeSheet} aria-label="Close" sx={{ color: "#7a5a5a" }}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Box sx={{ p: { xs: 1.5, md: 3 }, pt: 1 }}>
            <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid item xs={12} md={5}>
              <Stack spacing={1.5}>
                <Box>
                  <Typography component="div" sx={{ fontWeight: 1000, fontSize: { xs: 28, md: 42 }, letterSpacing: "-0.04em", lineHeight: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>{traderIsBuying ? "Buy" : "Sell"}</span>
                      <CoinIcon coin={selected.asset} size={36} />
                    </Stack>
                  </Typography>
                  <Typography color="text.secondary">{selected.asset} offer from Thiago Exchange</Typography>
                </Box>
                <Box
                  sx={{
                    position: "relative",
                    overflow: "hidden",
                    p: { xs: 2, md: 2.75 },
                    borderRadius: { xs: 4, md: 5 },
                    background: "linear-gradient(135deg, #611818 0%, #7a2020 55%, #8a5a10 100%)",
                    boxShadow: "0 6px 16px rgba(97,24,24,0.12)",
                  }}
                >
                  <Box sx={{ position: "absolute", right: -18, top: -18, opacity: 0.14, transform: "rotate(-8deg)" }}>
                    <CoinIcon coin={selected.asset} size={132} />
                  </Box>
                  <Stack spacing={0.9} sx={{ position: "relative" }}>
                    <Chip
                      size="small"
                      label="RATE"
                      sx={{ alignSelf: "flex-start", bgcolor: "rgba(255,255,255,0.16)", color: "#fff", fontWeight: 1000, letterSpacing: 1.6, fontSize: 10.5 }}
                    />
                    <Box>
                      <Typography sx={{ fontWeight: 1000, fontSize: { xs: 32, md: 44 }, letterSpacing: "-0.03em", lineHeight: 1, color: "#fff" }}>
                        {rate ? money(rate) : `Bybit ± ${selected.floatingMarginPct}%`}
                      </Typography>
                      <Typography sx={{ color: "rgba(255,255,255,0.75)", fontWeight: 700, fontSize: 13.5, mt: 0.3 }}>
                        per {selected.asset}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                      <Chip size="small" label={`Min ${money(selected.minLimit)}`} sx={{ bgcolor: "rgba(255,255,255,0.14)", color: "#fff", fontWeight: 800 }} />
                      <Chip size="small" label={`Max ${money(selected.maxLimit)}`} sx={{ bgcolor: "rgba(255,255,255,0.14)", color: "#fff", fontWeight: 800 }} />
                    </Stack>
                  </Stack>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip size="small" icon={<GppGoodIcon />} label="30 min escrow window" />
                  <Chip size="small" icon={<BoltIcon />} label={`${responseTime(selected)} response`} />
                  <Chip size="small" icon={<ReceiptLongIcon />} label={`${successfulCount(selected)} completed`} />
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={7}>
              <Stack spacing={1.5}>
                <BoxedField
                  label={rate ? `Amount in ${selected.fiat}` : `Amount in ${selected.asset}`}
                  value={amount}
                  onChange={setAmount}
                  thousands
                  error={belowMinimum || aboveMaximum}
                  helperText={rate ? `Limit: ${money(selected.minLimit)} – ${money(selected.maxLimit)}` : "Priced live — final ₦ total is set by the live Bybit rate when you submit."}
                />
                <Box sx={{ minHeight: 64, px: 2, borderRadius: 1.5, bgcolor: "#fbfaf7", border: "1px solid rgba(217,134,31,0.14)", display: "flex", alignItems: "center" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: "100%" }}>
                    <Typography sx={{ color: "#7a5a5a", fontWeight: 900, fontSize: { xs: 15, sm: 16 } }}>
                      {traderIsBuying ? "You get" : "You send"}
                    </Typography>
                    <Typography sx={{ fontWeight: 1000, fontSize: { xs: 18, sm: 20 }, color: "#200808" }}>
                      {rate ? `${formatAssetAmount(assetAmount)} ${selected.asset}` : "Set at order time"}
                    </Typography>
                  </Stack>
                </Box>

                {traderIsBuying && (
                  <>
                    <BoxedField
                      label={`Your ${selected.asset} wallet address`}
                      value={payoutAddress}
                      onChange={setPayoutAddress}
                      error={addressTouched && !addressValid}
                      helperText={
                        addressTouched
                          ? addressValid
                            ? `Looks like a valid ${payoutChain} address.`
                            : `That doesn't look like a valid ${payoutChain} address.`
                          : undefined
                      }
                      endAdornment={
                        addressTouched ? (
                          addressValid ? (
                            <CheckCircleIcon sx={{ color: "#8a5a10", fontSize: 22 }} />
                          ) : (
                            <ErrorIcon sx={{ color: "#7a1f1f", fontSize: 22 }} />
                          )
                        ) : undefined
                      }
                    />
                    <NetworkField label="Network / chain" value={payoutChain} onChange={setPayoutChain} options={networksFor(selected.asset)} />
                  </>
                )}

                {localError && <Alert severity="error">{localError}</Alert>}
                <Stack spacing={1.25}>
                  <Typography sx={{ fontWeight: 1000, fontSize: 15, color: "#200808" }}>How this trade works</Typography>
                  <Stack spacing={1.1}>
                    {(traderIsBuying
                      ? [
                          "Pay the amount shown to the bank details sent in chat.",
                          "Upload proof of payment once sent.",
                          "Coin is released to your wallet after payment is confirmed.",
                        ]
                      : [
                          "Send coin to the deposit address shown in the trading ground.",
                          "Submit your transaction hash once sent.",
                          "Payout is made after your deposit is confirmed on-chain.",
                        ]
                    ).map((step, index) => (
                      <Stack key={step} direction="row" spacing={1.25} alignItems="flex-start">
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            flexShrink: 0,
                            borderRadius: "50%",
                            bgcolor: "#fbebeb",
                            color: "#611818",
                            display: "grid",
                            placeItems: "center",
                            fontWeight: 1000,
                            fontSize: 12,
                          }}
                        >
                          {index + 1}
                        </Box>
                        <Typography variant="body2" sx={{ color: "#4a3838", pt: 0.3, lineHeight: 1.5 }}>
                          {step}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
                <FormControlLabel
                  control={<Checkbox checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />}
                  label="I accept the trade terms"
                />
                <Button
                  variant="contained"
                  fullWidth
                  disableElevation
                  disabled={submitting || !accepted || !numericAmount}
                  onClick={submit}
                  sx={{
                    py: 1.35,
                    bgcolor: "#611818",
                    boxShadow: "none",
                    "&:hover": { bgcolor: "#4a1212", boxShadow: "none" },
                    "&.Mui-disabled": { bgcolor: "#d9861f", color: "#fff", opacity: 0.85 },
                  }}
                  startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : undefined}
                >
                  {submitting ? "Opening trade..." : "Open Trading Ground"}
                </Button>
              </Stack>
            </Grid>
            </Grid>
          </Box>
        </Box>
      )}
    </Drawer>
  );

  return (
    <Stack spacing={{ xs: 2, md: 3 }}>
      <Stack direction="row" spacing={1} sx={{ p: 0.5, borderRadius: 999, bgcolor: "#f3ede1", alignSelf: "flex-start" }}>
        {(["buy", "sell"] as const).map((m) => (
          <Button
            key={m}
            onClick={() => setMode(m)}
            sx={{
              px: 3,
              textTransform: "capitalize",
              color: mode === m ? "#fff" : "#7a5a5a",
              bgcolor: mode === m ? (m === "buy" ? "#611818" : "#8a5a10") : "transparent",
              "&:hover": { bgcolor: mode === m ? (m === "buy" ? "#4a1212" : "#6e480d") : "rgba(0,0,0,0.04)" },
            }}
          >
            {m}
          </Button>
        ))}
      </Stack>

      <Box>
        <Typography variant="h4" sx={{ fontWeight: 1000, mb: 0.8, letterSpacing: "-0.035em", fontSize: { xs: 22, md: 30 } }}>
          Offers
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: { xs: 13.5, md: 16 } }}>
          Pick an offer, review the terms, then continue to the trading ground.
        </Typography>
      </Box>

      {filteredAds.length === 0 && (
        <Alert severity="info" sx={{ borderRadius: 4 }}>
          No {mode === "buy" ? "sell" : "buy"} offers open right now — check back shortly.
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" },
          gap: { xs: 1.5, md: 2.5 },
          width: "100%",
        }}
      >
        {filteredAds.map((ad) => (
          <Card
            key={ad.id}
            variant="outlined"
            sx={{
              height: "100%",
              minWidth: 0,
              borderRadius: { xs: 4, md: 5 },
              borderColor: "rgba(217,134,31,0.2)",
              background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(253,250,247,0.96))",
              boxShadow: "0 12px 34px rgba(32,8,8,0.06)",
              transition: "transform .18s ease, box-shadow .18s ease, border-color .18s ease",
              "&:hover": { transform: "translateY(-4px)", borderColor: "#d9861f", boxShadow: "0 18px 46px rgba(97,24,24,0.12)" },
            }}
          >
            <CardContent sx={{ p: { xs: 1.5, md: 2.5 } }}>
              <Stack spacing={{ xs: 1.4, md: 1.8 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Stack direction="row" spacing={1.4} alignItems="center">
                    <CoinIcon coin={ad.asset} size={44} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 1000, fontSize: { xs: 16, md: 20 }, textTransform: "capitalize" }}>
                        {mode} {ad.asset}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">Thiago Exchange</Typography>
                    </Box>
                  </Stack>
                  <Typography
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: 0.6,
                      fontWeight: 1000,
                      fontSize: 11,
                      color: mode === "buy" ? "#611818" : "#8a5a10",
                    }}
                  >
                    {mode}
                  </Typography>
                </Stack>

                <Box>
                  <Typography variant="body2" color="text.secondary">Rate</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 1000, letterSpacing: 0, fontSize: { xs: 24, md: 30 } }}>
                    {ad.rateType === "fixed" ? money(ad.fixedRate) : `±${ad.floatingMarginPct}%`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    per {ad.asset}, limit {money(ad.minLimit)}–{money(ad.maxLimit)}
                  </Typography>
                </Box>

                <Divider sx={{ borderColor: "rgba(32,8,8,0.08)" }} />

                <Typography variant="body2" color="text.secondary">
                  {responseTime(ad)} response · 30 min escrow · {successfulCount(ad)} completed
                </Typography>

                <Button
                  variant="contained"
                  fullWidth
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => viewOffer(ad)}
                  disableElevation
                  sx={{
                    py: 1.25,
                    bgcolor: "#611818",
                    boxShadow: "none",
                    "&:hover": { bgcolor: "#4a1212", boxShadow: "none" },
                  }}
                >
                  View Offer
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      {detailSheet}
    </Stack>
  );
}

function formatThousands(raw: string) {
  if (!raw) return "";
  const [intPart, decPart] = raw.split(".");
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart !== undefined ? `${withCommas}.${decPart}` : withCommas;
}

function formatAssetAmount(value: number) {
  if (!value) return "0";
  return value.toFixed(8).replace(/0+$/, "").replace(/\.$/, "");
}

const boxedFieldSx = {
  "& .MuiOutlinedInput-root": {
    minHeight: 64,
    bgcolor: "#fbfaf7",
    borderRadius: 1.5,
    fontSize: { xs: 18, sm: 20 },
    color: "#200808",
    "& fieldset": { borderColor: "rgba(217,134,31,0.14)" },
    "&:hover fieldset": { borderColor: "rgba(217,134,31,0.28)" },
    "&.Mui-focused": { bgcolor: "#fdf6e9" },
    "&.Mui-focused fieldset": { borderColor: "#d9861f", borderWidth: 2 },
  },
  "& .MuiInputBase-input": { px: 2, py: 1.65 },
};

function BoxedField({
  label,
  value,
  onChange,
  error = false,
  helperText,
  thousands = false,
  endAdornment,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  thousands?: boolean;
  endAdornment?: ReactNode;
}) {
  function handleChange(raw: string) {
    if (!thousands) {
      onChange(raw);
      return;
    }
    const cleaned = raw.replace(/[^\d.]/g, "");
    const firstDot = cleaned.indexOf(".");
    const normalized =
      firstDot === -1 ? cleaned : `${cleaned.slice(0, firstDot + 1)}${cleaned.slice(firstDot + 1).replace(/\./g, "")}`;
    onChange(normalized);
  }

  return (
    <Stack spacing={1}>
      <Typography sx={{ color: "#7a5a5a", fontWeight: 900, fontSize: { xs: 15, sm: 16 } }}>{label}</Typography>
      <TextField
        type="text"
        inputMode={thousands ? "decimal" : undefined}
        value={thousands ? formatThousands(value) : value}
        onChange={(event) => handleChange(event.target.value)}
        fullWidth
        error={error}
        helperText={helperText}
        InputProps={endAdornment ? { endAdornment: <InputAdornment position="end">{endAdornment}</InputAdornment> } : undefined}
        sx={boxedFieldSx}
      />
    </Stack>
  );
}

function NetworkField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <Stack spacing={1}>
      <Typography sx={{ color: "#7a5a5a", fontWeight: 900, fontSize: { xs: 15, sm: 16 } }}>{label}</Typography>
      <Autocomplete
        options={options}
        value={value}
        onChange={(_, newValue) => onChange(newValue ?? "")}
        disableClearable
        renderOption={(props, option) => (
          <Box component="li" {...props} key={option} sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Avatar src={networkIcons[option]} sx={{ width: 24, height: 24, bgcolor: "#fbebeb", fontSize: 12 }}>
              {option.slice(0, 1)}
            </Avatar>
            <Typography sx={{ fontWeight: 700, fontSize: 14.5 }}>{option}</Typography>
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            placeholder="Search network"
            InputProps={{
              ...params.InputProps,
              startAdornment: value ? (
                <Avatar src={networkIcons[value]} sx={{ width: 24, height: 24, ml: 0.5, bgcolor: "#fbebeb", fontSize: 12 }}>
                  {value.slice(0, 1)}
                </Avatar>
              ) : undefined,
            }}
            sx={boxedFieldSx}
          />
        )}
      />
    </Stack>
  );
}
