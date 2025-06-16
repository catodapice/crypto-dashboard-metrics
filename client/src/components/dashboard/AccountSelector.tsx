import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useAccounts } from "../../context/AccountContext";

interface AccountSelectorProps {
  onChange?: (account: any) => void;
}

const AccountSelector: React.FC<AccountSelectorProps> = ({ onChange }) => {
  const { accounts, selectedAccount, addAccount, selectAccount } =
    useAccounts();
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");

  const handleAdd = () => {
    if (!name || !apiKey || !apiSecret) return;
    const newAcc = { name, apiKey, apiSecret };
    addAccount(newAcc);
    setName("");
    setApiKey("");
    setApiSecret("");
    onChange?.(newAcc);
  };

  const handleSelect = (evt: any) => {
    const val = evt.target.value as string;
    const acc = accounts.find((a) => a.name === val);
    if (acc) {
      selectAccount(acc);
      onChange?.(acc);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        API Accounts
      </Typography>
      {accounts.length > 0 && (
        <FormControl fullWidth sx={{ mb: 2 }} size="small">
          <InputLabel id="account-select-label">Select Account</InputLabel>
          <Select
            labelId="account-select-label"
            value={selectedAccount?.name || ""}
            label="Select Account"
            onChange={handleSelect}
          >
            {accounts.map((acc) => (
              <MenuItem key={acc.name} value={acc.name}>
                {acc.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          size="small"
        />
        <TextField
          label="API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          size="small"
        />
        <TextField
          label="API Secret"
          value={apiSecret}
          onChange={(e) => setApiSecret(e.target.value)}
          size="small"
        />
        <Button variant="contained" onClick={handleAdd} size="small">
          Add
        </Button>
      </Box>
    </Paper>
  );
};

export default AccountSelector;
