import React from "react";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface TransactionSearchProps {
  txId: string;
  setTxId: (value: string) => void;
  handleSearch: () => void;
  searching: boolean;
  searchResult: any;
}

const TransactionSearch: React.FC<TransactionSearchProps> = ({
  txId,
  setTxId,
  handleSearch,
  searching,
  searchResult,
}) => {
  return (
    <>
      <Box sx={{ display: "flex", gap: 2 }}>
        <TextField
          label="ID de Transacción"
          variant="outlined"
          size="small"
          fullWidth
          value={txId}
          onChange={(e) => setTxId(e.target.value)}
        />
        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={handleSearch}
          disabled={searching || !txId}
        >
          Buscar
        </Button>
      </Box>

      {searching && (
        <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {searchResult && !searchResult.error && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Resultado:
          </Typography>
          <pre
            style={{
              backgroundColor: "#f5f5f5",
              padding: "10px",
              borderRadius: "4px",
              overflow: "auto",
            }}
          >
            {JSON.stringify(searchResult, null, 2)}
          </pre>
        </Box>
      )}

      {searchResult && searchResult.error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {searchResult.error}
        </Alert>
      )}
    </>
  );
};

export default TransactionSearch;
