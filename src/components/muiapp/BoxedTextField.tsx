"use client";

import Stack from "@mui/material/Stack";
import TextField, { type TextFieldProps } from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

// The app's standard field look: label sits above as its own line, the
// input itself is a filled, borderless-looking box — matches AuthPageView's
// AuthField and TradeView's BoxedField instead of MUI's default floating
// label + thin outline.
export function BoxedTextField({ label, sx, ...props }: { label: string } & Omit<TextFieldProps, "label">) {
  return (
    <Stack spacing={1}>
      <Typography sx={{ color: "#7a5a5a", fontWeight: 900, fontSize: { xs: 15, sm: 16 } }}>{label}</Typography>
      <TextField
        fullWidth
        {...props}
        sx={[
          {
            "& .MuiOutlinedInput-root": {
              minHeight: 60,
              bgcolor: "#fbfaf7",
              borderRadius: 1.5,
              fontSize: { xs: 16, sm: 17 },
              color: "#200808",
              "& fieldset": { borderColor: "rgba(217,134,31,0.14)" },
              "&:hover fieldset": { borderColor: "rgba(217,134,31,0.28)" },
              "&.Mui-focused": { bgcolor: "#fdf6e9" },
              "&.Mui-focused fieldset": { borderColor: "#d9861f", borderWidth: 2 },
              "&.Mui-disabled": { bgcolor: "#f3ede1" },
            },
            "& .MuiInputBase-input": { px: 2, py: 1.5 },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      />
    </Stack>
  );
}
