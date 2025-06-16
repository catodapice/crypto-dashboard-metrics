import React, { useEffect, useState } from "react";
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
import { bitmexService } from "../../services/bitmexService";
import storage from "../../utils/storage";

interface Account {
  name: string;
  apiKey: string;
  apiSecret: string;
}

interface AccountSelectorProps {
  onChange?: (account: Account) => void;
}

const STORAGE_KEY = "bitmexAccounts";

const AccountSelector: React.FC<AccountSelectorProps> = ({ onChange }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");

  useEffect(() => {
    const stored = storage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: Account[] = JSON.parse(stored);
        setAccounts(parsed);
        if (parsed.length > 0) {
          setSelected(parsed[0].name);
          bitmexService.setCredentials(parsed[0].apiKey, parsed[0].apiSecret);
          onChange?.(parsed[0]);
        }
      } catch (error) {
        console.error("Error parsing stored accounts:", error);
      }
    }
  }, []); // Empty dependency array since we only want this to run once on mount

  const saveAccounts = (list: Account[]) => {
    setAccounts(list);
    storage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const handleAdd = () => {
    if (!name || !apiKey || !apiSecret) return;
    const newAcc = { name, apiKey, apiSecret };
    const updated = [...accounts, newAcc];
    saveAccounts(updated);
    setName("");
    setApiKey("");
    setApiSecret("");
    setSelected(newAcc.name);
    bitmexService.setCredentials(newAcc.apiKey, newAcc.apiSecret);
    onChange?.(newAcc);
  };

  const handleSelect = (evt: any) => {
    const val = evt.target.value as string;
    setSelected(val);
    const acc = accounts.find((a) => a.name === val);
    if (acc) {
      bitmexService.setCredentials(acc.apiKey, acc.apiSecret);
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
            value={selected}
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
