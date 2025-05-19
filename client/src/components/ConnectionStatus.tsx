import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

export interface ConnectionStatusProps {
  isConnected: boolean;
  lastChecked: Date | null;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  lastChecked,
}) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Chip
        icon={isConnected ? <CheckCircleIcon /> : <ErrorIcon />}
        label={isConnected ? "Conectado" : "Desconectado"}
        color={isConnected ? "success" : "error"}
        size="small"
      />
      {lastChecked && (
        <Typography variant="caption" color="text.secondary">
          Última verificación: {lastChecked.toLocaleTimeString()}
        </Typography>
      )}
    </Box>
  );
};

export default ConnectionStatus;
