"use client";

import { useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CancelIcon from "@mui/icons-material/Cancel";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import SendIcon from "@mui/icons-material/Send";
import TagIcon from "@mui/icons-material/Tag";
import { api, ApiError, fileUrl, money, type MessageDTO, type OrderDTO } from "@/lib/api";
import { StatusChip } from "@/components/muiapp/StatusChip";
import { TradeTimer } from "@/components/muiapp/TradeTimer";
import { CoinIcon } from "@/components/muiapp/CoinIcon";
import { BoxedTextField } from "@/components/muiapp/BoxedTextField";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" }).format(new Date(value));
}

function formatAssetAmount(value: number) {
  if (!value) return "0";
  return value.toFixed(8).replace(/0+$/, "").replace(/\.$/, "");
}

export function TradeChat({
  order,
  messages,
  currentUserId,
  isAdmin,
  connected,
  onSend,
  onOrder,
  onRefresh,
  onError,
  onBack,
  compact = false,
}: {
  order: OrderDTO;
  messages: MessageDTO[];
  currentUserId: string;
  isAdmin: boolean;
  connected: boolean;
  onSend: (body: string, attachmentUrl?: string) => void;
  onOrder: (order: OrderDTO) => void;
  onRefresh: () => void;
  onError: (message: string) => void;
  onBack?: () => void;
  compact?: boolean;
}) {
  const [message, setMessage] = useState("");
  const [hash, setHash] = useState(order.depositTxId || "");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [attachmentName, setAttachmentName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputing, setDisputing] = useState(false);
  const [payConfirmOpen, setPayConfirmOpen] = useState(false);
  const [depositConfirmOpen, setDepositConfirmOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [instructions, setInstructions] = useState<{ address: string; chain: string } | null>(null);
  const [instructionsError, setInstructionsError] = useState("");
  const [payInstructions, setPayInstructions] = useState<{ bankName: string; accountNumber: string; accountName: string } | null>(null);

  const isBuyer = order.buyerId === currentUserId;
  const isSeller = order.sellerId === currentUserId;
  const isDepositFlow = order.side === "buy"; // Thiago buying: taker (seller) sends crypto in
  const isPayFlow = order.side === "sell"; // Thiago selling: taker (buyer) pays fiat
  // From a trader's view, the other side is always Thiago Exchange itself —
  // only admin sees the real counterparty's name.
  const counterpartyName = isAdmin ? (isBuyer ? order.sellerName : order.buyerName) || "Trader" : "Thiago Exchange";
  const myName = (isBuyer ? order.buyerName : order.sellerName) || "there";
  const hasSubmittedHash = Boolean(order.depositTxId);
  const canCancel = (isBuyer || isSeller) && ["created", "awaiting_payment"].includes(order.status);
  const canDispute = (isBuyer || isSeller) && ["awaiting_payment", "payment_marked", "payment_confirmed"].includes(order.status);
  const canAct = order.status === "awaiting_payment" || order.status === "payment_marked";

  useEffect(() => {
    if (isDepositFlow && isSeller && order.status === "awaiting_payment") {
      api
        .depositInstructions(order.id)
        .then(setInstructions)
        .catch((err) =>
          setInstructionsError(
            err instanceof ApiError ? err.message : "Couldn't load the deposit address — try refreshing.",
          ),
        );
    }
  }, [isDepositFlow, isSeller, order.id, order.status]);

  useEffect(() => {
    if (isPayFlow && isBuyer && order.status === "awaiting_payment") {
      api
        .paymentInstructions(order.id)
        .then(setPayInstructions)
        .catch(() => undefined);
    }
  }, [isPayFlow, isBuyer, order.id, order.status]);

  async function postMessage() {
    if (!message.trim() && !pendingFile) return;
    if (pendingFile) {
      setUploading(true);
      try {
        const { url } = await api.upload(pendingFile);
        onSend(message, url);
      } catch (err) {
        onError(err instanceof ApiError ? err.message : "Couldn't attach that file.");
        return;
      } finally {
        setUploading(false);
      }
    } else {
      onSend(message);
    }
    setMessage("");
    setPendingFile(null);
    setAttachmentName("");
  }

  function attachFile(file?: File) {
    if (!file) return;
    setPendingFile(file);
    setAttachmentName(file.name);
    if (!message.trim()) setMessage("Proof screenshot attached.");
  }

  async function saveHash() {
    if (!hash.trim()) return;
    setVerifying(true);
    try {
      const updated = await api.submitDeposit(order.id, hash.trim());
      onOrder(updated);
      setDepositConfirmOpen(false);
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't verify that transaction yet — it may still be confirming on-chain.");
    } finally {
      setVerifying(false);
    }
  }

  async function markPaid() {
    if (!pendingFile) {
      onError("Attach your payment receipt first.");
      return;
    }
    setUploading(true);
    try {
      const { url } = await api.upload(pendingFile);
      const updated = await api.markPaid(order.id, url);
      onOrder(updated);
      setPendingFile(null);
      setAttachmentName("");
      setPayConfirmOpen(false);
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't submit your payment proof.");
    } finally {
      setUploading(false);
    }
  }

  async function cancelOrder() {
    setCanceling(true);
    try {
      const updated = await api.cancelOrder(order.id);
      onOrder(updated);
      setCancelOpen(false);
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't cancel this order.");
    } finally {
      setCanceling(false);
    }
  }

  async function raiseDispute() {
    if (!disputeReason.trim()) return;
    setDisputing(true);
    try {
      await api.raiseDispute(order.id, disputeReason.trim());
      onRefresh();
      setDisputeOpen(false);
      setDisputeReason("");
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Couldn't submit that dispute.");
    } finally {
      setDisputing(false);
    }
  }

  return (
    <Stack
      spacing={compact ? 1.5 : 0}
      sx={compact ? { minHeight: "auto" } : { height: "100%", minHeight: 0 }}
    >
      <Box
        sx={{
          p: { xs: 1.1, md: 1.6 },
          pl: { xs: 1.4, md: 2 },
          color: "#fff",
          borderRadius: compact ? { xs: 2.5, md: 3.5 } : 0,
          bgcolor: "#611818",
          boxShadow: compact ? "0 14px 36px rgba(97,24,24,0.18)" : "0 2px 8px rgba(0,0,0,0.12)",
          flexShrink: 0,
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={{ xs: 1.1, md: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            {onBack && (
              <IconButton onClick={onBack} sx={{ color: "#fff", ml: -1 }}>
                <ArrowBackIcon />
              </IconButton>
            )}
            <Avatar sx={{ width: { xs: 40, md: 46 }, height: { xs: 40, md: 46 }, bgcolor: "rgba(255,255,255,0.18)", fontWeight: 1000 }}>
              {counterpartyName.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant={compact ? "subtitle1" : "h6"} sx={{ fontWeight: 1000, fontSize: { xs: 16, md: compact ? 16 : 20 }, lineHeight: 1.2 }}>
                {counterpartyName}
              </Typography>
              <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.78)", fontSize: { xs: 12.5, md: 13.5 } }}>
                  {order.amount} {order.asset} · {money(order.fiatAmount)}
                </Typography>
                <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: connected ? "#d9861f" : "rgba(255,255,255,0.4)" }} />
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.78)", fontSize: { xs: 12.5, md: 13.5 } }}>
                  {connected ? "Online" : "Reconnecting"}
                </Typography>
              </Stack>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <StatusChip status={order.status} />
            {["awaiting_payment", "payment_marked"].includes(order.status) && (
              <Box sx={{ minWidth: 130 }}>
                <TradeTimer deadline={order.paymentDeadline} onExpired={onRefresh} dark />
              </Box>
            )}
          </Stack>
        </Stack>
      </Box>

      <Stack spacing={0} sx={{ flex: 1, minHeight: 0 }}>
        <Stack
          spacing={1.75}
          sx={{
            flex: 1,
            minHeight: compact ? 320 : 0,
            maxHeight: compact ? 320 : "none",
            overflowY: "auto",
            px: { xs: 2, md: compact ? 1.5 : 4 },
            pt: { xs: 2.5, md: compact ? 1.75 : 3.5 },
            pb: { xs: 2, md: compact ? 1.1 : 3 },
            bgcolor: "#e9dfc9",
            border: compact ? "1px solid rgba(32,8,8,0.08)" : 0,
            borderRadius: compact ? { xs: 2.5, md: 3.5 } : 0,
          }}
        >
          {isDepositFlow && isSeller && order.status === "awaiting_payment" && (
            <>
              <SystemBubble timestamp={order.createdAt}>{greeting()}, {myName}!</SystemBubble>
              <SystemBubble timestamp={order.createdAt}>
                Please proceed to send {formatAssetAmount(order.amount)} {order.asset} for this trade.
              </SystemBubble>
              {instructions ? (
                <SystemBubble timestamp={order.createdAt}>
                  Please send to: <CopyableValue value={instructions.address} label="address" />
                </SystemBubble>
              ) : instructionsError ? (
                <SystemBubble timestamp={order.createdAt}>{instructionsError}</SystemBubble>
              ) : (
                <SystemBubble timestamp={order.createdAt}>Fetching your deposit address…</SystemBubble>
              )}
              <SystemBubble timestamp={order.createdAt}>
                Once sent, submit your transaction hash below so we can verify and complete your trade.
              </SystemBubble>
            </>
          )}
          {isPayFlow && isBuyer && order.status === "awaiting_payment" && payInstructions?.accountNumber && (
            <>
              <SystemBubble timestamp={order.createdAt}>{greeting()}, {myName}!</SystemBubble>
              <SystemBubble timestamp={order.createdAt}>
                Please proceed to make payment for your trade.
              </SystemBubble>
              <SystemBubble timestamp={order.createdAt}>
                Amount: <CopyableValue value={money(order.fiatAmount)} label="amount" />
                <br />
                Account: <CopyableValue value={payInstructions.accountNumber} label="account number" /> ({payInstructions.bankName}, {payInstructions.accountName})
              </SystemBubble>
              <SystemBubble timestamp={order.createdAt}>
                Once you&apos;ve paid, kindly upload your proof of payment below so we can confirm and release your coin.
              </SystemBubble>
            </>
          )}
          {isPayFlow && isBuyer && order.status === "awaiting_payment" && !payInstructions?.accountNumber && (
            <SystemBubble timestamp={order.createdAt}>
              {greeting()}, {myName}! Ask for payment details in chat below, then attach your receipt and mark as paid.
            </SystemBubble>
          )}
          {messages.length === 0 && (
            <Typography sx={{ m: "auto", color: "#7a5a5a", fontSize: 14 }}>No messages yet — say hello.</Typography>
          )}
          {messages.map((item) => {
            const isMine = item.senderId === currentUserId;
            const senderName = isMine ? "You" : isAdmin ? "Trader" : "Thiago Exchange";
            return (
              <Stack
                key={item.id}
                direction="row"
                justifyContent={isMine ? "flex-end" : "flex-start"}
                sx={{ width: "100%" }}
              >
                <Box
                  sx={{
                    maxWidth: { xs: "78%", md: "60%" },
                    px: { xs: 1.15, md: 1.35 },
                    py: { xs: 0.8, md: 0.95 },
                    borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    bgcolor: isMine ? "#fbe9c8" : "#fff",
                    color: "#200808",
                    border: isMine ? 0 : "1px solid rgba(32,8,8,0.07)",
                    boxShadow: "0 6px 18px rgba(32,8,8,0.08)",
                    position: "relative",
                  }}
                >
                  {!isMine && (
                    <Typography variant="caption" sx={{ display: "block", fontWeight: 1000, color: "#611818", fontSize: { xs: 11.5, md: 12.5 }, lineHeight: 1.2 }}>
                      {senderName}
                    </Typography>
                  )}
                  {item.body && <Typography sx={{ mt: isMine ? 0 : 0.35, whiteSpace: "pre-wrap", fontSize: { xs: 13.5, md: 15 }, lineHeight: 1.45 }}>{item.body}</Typography>}
                  {item.attachmentUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={fileUrl(item.attachmentUrl)} alt="Trade attachment" style={{ marginTop: 8, display: "block", maxWidth: "100%", borderRadius: 8, border: "1px solid rgba(32,8,8,0.10)" }} />
                  )}
                  <Typography variant="caption" sx={{ display: "block", mt: 0.35, textAlign: "right", fontWeight: 800, color: "#7a5a5a", fontSize: { xs: 10.5, md: 11.5 }, lineHeight: 1.2 }}>
                    {formatMessageTime(item.createdAt)}
                  </Typography>
                </Box>
              </Stack>
            );
          })}
        </Stack>

        <Box
          sx={
            compact
              ? {}
              : { flexShrink: 0, bgcolor: "#fff", borderTop: "1px solid rgba(32,8,8,0.08)", p: { xs: 1, md: 2 } }
          }
        >
        {canAct ? (
          <Stack spacing={1.5}>
            {isDepositFlow && isSeller && order.status === "awaiting_payment" && !hasSubmittedHash && (
              <Stack spacing={1}>
                <BoxedTextField
                  label="Transaction hash"
                  value={hash}
                  onChange={(event) => setHash(event.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><TagIcon fontSize="small" /></InputAdornment> }}
                />
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={!hash.trim()}
                  onClick={() => setDepositConfirmOpen(true)}
                  sx={{ minHeight: 52, fontSize: 16, bgcolor: "#611818", "&:hover": { bgcolor: "#4a1212" } }}
                >
                  I&apos;ve Sent the Coin
                </Button>
              </Stack>
            )}
            {isDepositFlow && isSeller && hasSubmittedHash && order.status === "awaiting_payment" && (
              <Alert severity="info">Verifying your deposit on-chain — this updates automatically once confirmed.</Alert>
            )}

            {attachmentName && (
              <Chip
                icon={<AttachFileIcon />}
                label={attachmentName}
                onDelete={() => {
                  setAttachmentName("");
                  setPendingFile(null);
                }}
                sx={{ alignSelf: "flex-start" }}
              />
            )}

            {isPayFlow && isBuyer && order.status === "awaiting_payment" && (
              <Button
                variant="contained"
                fullWidth
                size="large"
                disabled={uploading || !pendingFile}
                onClick={() => setPayConfirmOpen(true)}
                sx={{ minHeight: 52, fontSize: 16, bgcolor: "#611818", "&:hover": { bgcolor: "#4a1212" } }}
              >
                I have paid
              </Button>
            )}

            <Stack direction="row" spacing={0.75} alignItems="flex-end" sx={{ p: 0.6, borderRadius: 6, bgcolor: "rgba(255,255,255,0.86)", border: "1px solid rgba(217,134,31,0.16)", boxShadow: "0 12px 34px rgba(32,8,8,0.08)" }}>
              <TextField
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                fullWidth
                multiline
                minRows={1}
                maxRows={6}
                placeholder="Type a message"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton component="label" sx={{ color: "#611818" }}>
                        <AttachFileIcon />
                        <input
                          hidden
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(event) => attachFile(event.target.files?.[0])}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 4,
                    bgcolor: "#fff",
                    fontSize: 16,
                    py: 1.2,
                    alignItems: "center",
                  },
                  "& .MuiInputAdornment-root": { alignSelf: "center", mt: "0 !important" },
                }}
              />
              {(message.trim() || pendingFile) && (
                <IconButton
                  onClick={postMessage}
                  disabled={uploading}
                  sx={{ width: 48, height: 48, bgcolor: "#611818", color: "#fff", "&:hover": { bgcolor: "#4a1212" }, "&.Mui-disabled": { bgcolor: "#d9861f", color: "#fff", opacity: 0.6 } }}
                >
                  <SendIcon />
                </IconButton>
              )}
            </Stack>

            <Stack direction="row" spacing={2}>
              {canCancel && (
                <Button color="error" variant="text" startIcon={<CancelIcon />} onClick={() => setCancelOpen(true)}>
                  Cancel
                </Button>
              )}
              {canDispute && (
                <Button color="warning" variant="text" startIcon={<ReportProblemIcon />} onClick={() => setDisputeOpen(true)}>
                  Raise a dispute
                </Button>
              )}
            </Stack>
          </Stack>
        ) : (
          <Stack spacing={1}>
            <Alert severity={order.status === "completed" ? "success" : order.status === "disputed" ? "error" : "warning"}>
              This order is {order.status.replace(/_/g, " ")}.
            </Alert>
            {canCancel && (
              <Button color="error" variant="text" startIcon={<CancelIcon />} onClick={() => setCancelOpen(true)} sx={{ alignSelf: "flex-start" }}>
                Cancel
              </Button>
            )}
            {canDispute && (
              <Button color="warning" variant="text" startIcon={<ReportProblemIcon />} onClick={() => setDisputeOpen(true)} sx={{ alignSelf: "flex-start" }}>
                Raise a dispute
              </Button>
            )}
          </Stack>
        )}
        </Box>
      </Stack>

      <Dialog open={cancelOpen} onClose={() => !canceling && setCancelOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ pb: 0.5, fontWeight: 1000, color: "#200808" }}>Cancel this trade?</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <CoinIcon coin={order.asset} size={28} />
            <Typography sx={{ fontWeight: 1000, color: "#200808" }}>{order.amount} {order.asset}</Typography>
          </Stack>
          <Typography sx={{ color: "#7a5a5a", fontSize: 14.5, lineHeight: 1.55 }}>
            This will close the trading ground. Only continue if you no longer want to complete this trade.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 0 }}>
          <Button variant="text" onClick={() => setCancelOpen(false)} disabled={canceling}>Keep Trade</Button>
          <Button color="error" variant="contained" onClick={cancelOrder} disabled={canceling}>{canceling ? "Cancelling..." : "Yes, Cancel"}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={disputeOpen} onClose={() => !disputing && setDisputeOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ pb: 0.5, fontWeight: 1000, color: "#200808" }}>Raise a dispute</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography sx={{ color: "#7a5a5a", fontSize: 14.5, lineHeight: 1.55, mb: 1.5 }}>
            Tell us what&apos;s wrong — our team will step in and review the trade.
          </Typography>
          <TextField value={disputeReason} onChange={(event) => setDisputeReason(event.target.value)} fullWidth multiline minRows={3} placeholder="Describe the issue..." />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 0 }}>
          <Button variant="text" onClick={() => setDisputeOpen(false)} disabled={disputing}>Cancel</Button>
          <Button color="warning" variant="contained" onClick={raiseDispute} disabled={disputing || !disputeReason.trim()}>{disputing ? "Submitting..." : "Submit dispute"}</Button>
        </DialogActions>
      </Dialog>

      <Drawer
        anchor="bottom"
        open={payConfirmOpen}
        onClose={() => !uploading && setPayConfirmOpen(false)}
        PaperProps={{
          sx: {
            width: "100%",
            maxWidth: { xs: "100%", md: 560 },
            mx: "auto",
            borderTopLeftRadius: { xs: 20, md: 24 },
            borderTopRightRadius: { xs: 20, md: 24 },
            bgcolor: "#fffaf0",
            backgroundImage: "none",
            p: { xs: 2, md: 3 },
          },
        }}
      >
        <Stack alignItems="center" sx={{ mb: 1.5 }}>
          <Box sx={{ width: 44, height: 5, borderRadius: 999, bgcolor: "rgba(32,8,8,0.14)" }} />
        </Stack>
        <Typography sx={{ fontWeight: 1000, fontSize: 20, color: "#200808" }}>Confirm payment</Typography>
        <Typography sx={{ color: "#7a5a5a", fontSize: 14.5, lineHeight: 1.55, mt: 0.5, mb: 2 }}>
          You&apos;re confirming you&apos;ve paid <strong>{money(order.fiatAmount)}</strong> and attached your proof of
          payment. The seller will be notified to verify and release your coin.
        </Typography>
        {attachmentName && (
          <Chip icon={<AttachFileIcon />} label={attachmentName} sx={{ mb: 2 }} />
        )}
        <Stack direction="row" spacing={1.5}>
          <Button variant="text" fullWidth onClick={() => setPayConfirmOpen(false)} disabled={uploading} sx={{ color: "#7a5a5a" }}>
            Not yet
          </Button>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={markPaid}
            disabled={uploading}
            sx={{ minHeight: 52, bgcolor: "#611818", "&:hover": { bgcolor: "#4a1212" } }}
          >
            {uploading ? "Submitting..." : "Yes, I've paid"}
          </Button>
        </Stack>
      </Drawer>

      <Drawer
        anchor="bottom"
        open={depositConfirmOpen}
        onClose={() => !verifying && setDepositConfirmOpen(false)}
        PaperProps={{
          sx: {
            width: "100%",
            maxWidth: { xs: "100%", md: 560 },
            mx: "auto",
            borderTopLeftRadius: { xs: 20, md: 24 },
            borderTopRightRadius: { xs: 20, md: 24 },
            bgcolor: "#fffaf0",
            backgroundImage: "none",
            p: { xs: 2, md: 3 },
          },
        }}
      >
        <Stack alignItems="center" sx={{ mb: 1.5 }}>
          <Box sx={{ width: 44, height: 5, borderRadius: 999, bgcolor: "rgba(32,8,8,0.14)" }} />
        </Stack>
        <Typography sx={{ fontWeight: 1000, fontSize: 20, color: "#200808" }}>Confirm deposit</Typography>
        <Typography sx={{ color: "#7a5a5a", fontSize: 14.5, lineHeight: 1.55, mt: 0.5, mb: 2 }}>
          You&apos;re confirming you&apos;ve sent <strong>{formatAssetAmount(order.amount)} {order.asset}</strong> to the
          deposit address, with transaction hash <strong>{hash.trim()}</strong>. We&apos;ll verify it on-chain and release your payout once confirmed.
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <Button variant="text" fullWidth onClick={() => setDepositConfirmOpen(false)} disabled={verifying} sx={{ color: "#7a5a5a" }}>
            Not yet
          </Button>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={saveHash}
            disabled={verifying}
            sx={{ minHeight: 52, bgcolor: "#611818", "&:hover": { bgcolor: "#4a1212" } }}
          >
            {verifying ? "Verifying..." : "Yes, I've sent it"}
          </Button>
        </Stack>
      </Drawer>
    </Stack>
  );
}

function SystemBubble({ children, timestamp }: { children: React.ReactNode; timestamp: string }) {
  return (
    <Stack direction="row" justifyContent="flex-start" sx={{ width: "100%" }}>
      <Box
        sx={{
          maxWidth: { xs: "88%", md: "68%" },
          px: { xs: 1.15, md: 1.35 },
          py: { xs: 0.8, md: 0.95 },
          borderRadius: "16px 16px 16px 4px",
          bgcolor: "#fff",
          color: "#200808",
          border: "1px solid rgba(32,8,8,0.07)",
          boxShadow: "0 6px 18px rgba(32,8,8,0.08)",
        }}
      >
        <Typography variant="caption" sx={{ display: "block", fontWeight: 1000, color: "#611818", fontSize: { xs: 11.5, md: 12.5 } }}>
          Thiago Exchange
        </Typography>
        <Typography sx={{ mt: 0.35, fontSize: { xs: 13.5, md: 15 }, lineHeight: 1.5 }}>{children}</Typography>
        <Typography variant="caption" sx={{ display: "block", mt: 0.35, textAlign: "right", fontWeight: 800, color: "#7a5a5a", fontSize: { xs: 10.5, md: 11.5 }, lineHeight: 1.2 }}>
          {formatMessageTime(timestamp)}
        </Typography>
      </Box>
    </Stack>
  );
}

function CopyableValue({ value, label }: { value: string; label: string }) {
  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.2 }}>
      <strong>{value}</strong>
      <Tooltip title={`Copy ${label}`}>
        <IconButton size="small" onClick={() => navigator.clipboard.writeText(value)} sx={{ p: 0.3 }}>
          <ContentCopyIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
